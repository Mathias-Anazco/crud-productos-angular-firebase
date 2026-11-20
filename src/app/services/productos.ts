import { Injectable } from '@angular/core';
import { db } from '../firebase.config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Producto, ProductoDatos } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class Productos {

  private readonly productosRef = collection(db, 'productos');

  // Consultar: devuelve todos los productos con el id de su documento.
  async obtenerProductos(): Promise<Producto[]> {
    const consulta = await getDocs(this.productosRef);

    return consulta.docs.map(documento => ({
      id: documento.id,
      ...(documento.data() as ProductoDatos)
    }));
  }

  // Consultar en TIEMPO REAL como Observable.
  // Cada vez que la colección cambia (desde la app, desde la consola de
  // Firebase o desde otra pestaña), el Observable emite la lista nueva,
  // sin recargar la página.
  obtenerProductos$(): Observable<Producto[]> {
    return new Observable<Producto[]>(suscriptor => {
      // onSnapshot se queda escuchando la colección "productos".
      const dejarDeEscuchar: Unsubscribe = onSnapshot(
        this.productosRef,
        consulta => {
          const productos = consulta.docs
            .map(documento => ({
              id: documento.id,
              ...(documento.data() as ProductoDatos)
            }))
            // Ignora documentos incompletos (por ejemplo, creados a mano
            // en la consola sin los campos del modelo).
            .filter(p => typeof p.nombre === 'string' && typeof p.categoria === 'string');
          suscriptor.next(productos);   // emite la lista actualizada
        },
        error => suscriptor.error(error) // avisa si Firestore falla
      );

      // Al cancelar la suscripción, se deja de escuchar Firestore.
      return () => dejarDeEscuchar();
    });
  }

  // Crear: guarda un producto nuevo y devuelve el id generado por Firestore.
  async crearProducto(producto: ProductoDatos): Promise<string> {
    const referencia = await addDoc(this.productosRef, this.limpiarDatos(producto));
    return referencia.id;
  }

  // Actualizar: guarda los cambios en el mismo documento, usando su id.
  async actualizarProducto(id: string, producto: ProductoDatos): Promise<void> {
    const productoRef = doc(db, 'productos', id);
    await updateDoc(productoRef, { ...this.limpiarDatos(producto) });
  }

  // Eliminar: borra el documento del producto con ese id.
  async eliminarProducto(id: string): Promise<void> {
    const productoRef = doc(db, 'productos', id);
    await deleteDoc(productoRef);
  }

  // Deja solo los cuatro campos del modelo, para no guardar el id
  // ni otros datos extra dentro del documento.
  private limpiarDatos(producto: ProductoDatos): ProductoDatos {
    return {
      nombre: producto.nombre.trim(),
      precio: Number(producto.precio),
      stock: Number(producto.stock),
      categoria: producto.categoria.trim(),
    };
  }

}
