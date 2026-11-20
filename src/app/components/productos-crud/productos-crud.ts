import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Productos } from '../../services/productos';
import { Producto, ProductoDatos } from '../../models/producto';

// Validador: el texto debe tener al menos un carácter que no sea espacio.
function textoObligatorio(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.trim().length > 0
    ? null
    : { textoVacio: true };
}

// Validador: el valor debe ser un número entero (sin decimales).
function numeroEntero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '') return null; // de esto se encarga "required"
  return Number.isInteger(Number(valor)) ? null : { noEntero: true };
}

type TipoMensaje = 'exito' | 'error';

@Component({
  selector: 'app-productos-crud',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './productos-crud.html',
})
export class ProductosCrud implements OnInit, OnDestroy {

  private readonly servicio = inject(Productos);
  private readonly fb = inject(FormBuilder);

  // Estado de la pantalla. Se usan signals para que Angular
  // vuelva a dibujar la vista cuando cambian.
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly mensaje = signal<{ tipo: TipoMensaje; texto: string } | null>(null);

  // Formulario con las validaciones que pide la práctica.
  readonly formulario = this.fb.group({
    nombre: ['', [Validators.required, textoObligatorio]],
    precio: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [null as number | null, [Validators.required, Validators.min(0), numeroEntero]],
    categoria: ['', [Validators.required, textoObligatorio]],
  });

  // Suscripción al Observable de productos (para cancelarla al salir).
  private suscripcion?: Subscription;

  // CONSULTAR en tiempo real: nos suscribimos al Observable del servicio.
  // Cada vez que la colección cambia, llega la lista nueva en "next"
  // y la tabla se actualiza sola, sin recargar la página.
  ngOnInit(): void {
    this.cargando.set(true);
    this.suscripcion = this.servicio.obtenerProductos$().subscribe({
      next: productos => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: error => {
        console.error(error);
        this.cargando.set(false);
        this.mostrarMensaje('error', 'No se pudieron cargar los productos desde Firestore.');
      },
    });
  }

  // Al destruir el componente se cancela la suscripción,
  // y con eso se deja de escuchar Firestore.
  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // CREAR o ACTUALIZAR, según si se está editando un producto.
  async guardar(): Promise<void> {
    // Si hay datos inválidos, se marcan los campos para mostrar
    // los mensajes y no se envía nada a Firestore.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const datos: ProductoDatos = {
      nombre: valores.nombre ?? '',
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      categoria: valores.categoria ?? '',
    };

    this.guardando.set(true);
    try {
      const id = this.editandoId();
      if (id) {
        await this.servicio.actualizarProducto(id, datos);
        this.mostrarMensaje('exito', 'Producto actualizado correctamente.');
      } else {
        await this.servicio.crearProducto(datos);
        this.mostrarMensaje('exito', 'Producto creado correctamente.');
      }
      this.limpiarFormulario(); // la tabla se actualiza sola por la escucha
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('error', 'No se pudo guardar el producto. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }

  // EDITAR: pasa los datos del producto seleccionado al formulario.
  editar(producto: Producto): void {
    this.editandoId.set(producto.id ?? null);
    this.formulario.setValue({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    });
    this.mensaje.set(null);
  }

  // ELIMINAR: pide confirmación; si se cancela, el producto se conserva.
  async eliminar(producto: Producto): Promise<void> {
    if (!producto.id) return;

    const confirmado = confirm(`¿Seguro que deseas eliminar "${producto.nombre}"?`);
    if (!confirmado) {
      this.mostrarMensaje('exito', 'Eliminación cancelada. El producto se conserva.');
      return;
    }

    try {
      await this.servicio.eliminarProducto(producto.id);
      if (this.editandoId() === producto.id) this.limpiarFormulario();
      this.mostrarMensaje('exito', 'Producto eliminado correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('error', 'No se pudo eliminar el producto. Inténtalo de nuevo.');
    }
  }

  limpiarFormulario(): void {
    this.editandoId.set(null);
    this.formulario.reset({ nombre: '', precio: null, stock: null, categoria: '' });
  }

  // Indica si un campo debe mostrar su mensaje de error.
  campoInvalido(campo: 'nombre' | 'precio' | 'stock' | 'categoria'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  private mostrarMensaje(tipo: TipoMensaje, texto: string): void {
    this.mensaje.set({ tipo, texto });
  }
}
