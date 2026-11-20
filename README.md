# CRUD de Productos — Angular + Firebase

Aplicación Angular para administrar productos guardados en Cloud Firestore.

- **Vercel:** https://crud-productos-angular-firebase.vercel.app/
- **GitHub:** https://github.com/Mathias-Anazco/crud-productos-angular-firebase

## Funciones

- **Crear:** registrar un producto desde el formulario.
- **Consultar:** ver los productos en una tabla (se actualiza en tiempo real).
- **Actualizar:** editar un producto existente por su id.
- **Eliminar:** borrar un producto con confirmación.
- Validaciones: nombre y categoría obligatorios, precio ≥ 0 y stock entero ≥ 0.

## Modelo de producto

Colección `productos`:

| Campo | Tipo |
|---|---|
| nombre | string |
| precio | number |
| stock | number |
| categoria | string |

## Configuración de Firebase

1. Crear un proyecto en Firebase y una app web.
2. Crear la base de datos Cloud Firestore con la colección `productos`.
3. Copiar `.env.example` como `.env` y completar los valores de la app web:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

En Vercel, estas mismas variables se agregan en **Environment Variables**.

## Instalación y ejecución local

```bash
npm install
npm start
```

Abrir http://localhost:4200
