// Modelo de un producto de la colección "productos" en Cloud Firestore.
// El id es el identificador del documento en Firestore: no se guarda
// como campo, se usa para editar y eliminar el documento.
export interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

// Datos que se guardan en Firestore (todo menos el id).
export type ProductoDatos = Omit<Producto, 'id'>;
