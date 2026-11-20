import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { of } from 'rxjs';
import { Productos } from './services/productos';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // En las pruebas no se conecta a Firestore: se usa un servicio falso.
      providers: [{ provide: Productos, useValue: { obtenerProductos$: () => of([]) } }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestión de productos');
  });
});
