import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductosCrud } from './components/productos-crud/productos-crud';

@Component({
  imports: [RouterOutlet, ProductosCrud],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
