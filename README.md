
# ERP Bicicentro (React + Electron + Express/SQLite)

## Descripción

Este proyecto es una aplicación de escritorio (Windows, Mac, Linux) para gestión ERP, construida con React + Vite en el frontend, Electron como wrapper de escritorio, y un backend Express con base de datos SQLite.

---

## ¿Cómo ejecutar en desarrollo?

1. **Clona el repositorio**

   ```bash
   git clone <TU_URL_DE_GITHUB>
   cd <NOMBRE_PROYECTO>
   ```

2. **Instala las dependencias (tanto para frontend como backend):**

   ```bash
   # Instala dependencias raíz (incluye Electron y build tools)
   npm install

   # Instala dependencias del backend Express
   cd backend
   npm install
   cd ..
   ```

3. **Agrega tus variables de entorno si es necesario**

   Puedes copiar `.env.example` a `.env` y ajustar la URL del backend si necesitas acceder desde otra PC o IP.

4. **Levanta la app en modo desarrollo (con hot-reload):**

   ```bash
   npm run dev
   ```

   Esto hará todo automático:
   - Lanza Vite (React) en http://localhost:8080
   - Lanza Electron apuntando a ese frontend
   - Lanza el backend Express en http://localhost:4000

---

## ¿Cómo generar un instalador de escritorio (producción)?

1. **Asegúrate de estar en la raíz del proyecto**

2. **Construye el frontend:** 

   ```bash
   npm run build
   ```

   Esto genera la carpeta `dist/` con la app React compilada.

3. **Empaqueta la aplicación con Electron Builder:**

   ```bash
   npm run electron:build
   ```

   Esto generará un instalador (por ejemplo `.exe` para Windows, `.dmg` para Mac) en la carpeta `/dist_electron/` o `/release/` (según SO).

   > **Nota:** El script lanzará el backend Express dentro del paquete de escritorio de manera automática cada vez que la app se abra.

---

## Detalles importantes

- El backend Express (carpeta `/backend`) se ejecuta de forma interna junto a la app Electron.
- Si necesitas customizar la URL de tu backend local, edita la variable en `.env` (**VITE_API_BASE_URL**).
- El backend utiliza SQLite para almacenamiento (no requiere instalación externa de base de datos).
- Puedes modificar variables sensibles del backend en `backend/.env`.

---

## Scripts Útiles

- `npm run dev`: Desarrolla con hot-reload (Electron + Vite + backend)
- `npm run build`: Compila el frontend React
- `npm run electron:build`: Empaqueta todo en una app instalable de escritorio
- `npm run electron`: Lanza solo la app Electron en modo producción local (útil para debugging)
- Dentro de `/backend`:
  - `npm start`: Arranca solo el backend
  - `npm run dev`: Backend con hot-reload (requiere nodemon)
  - `npm run init-data`: Inicializa algunos datos básicos en la base

---

## Requisitos

- Node.js 18+
- npm 9+
- (Opcional) Git para clonar el repositorio

---

## ¿Dudas o problemas?

- Si tienes errores de dependencias, borra `node_modules` y ejecuta `npm install` de nuevo.
- Asegúrate de que los puertos 4000 (backend) y 8080 (frontend) estén libres.
- Recuerda ejecutar siempre los comandos desde la raíz del proyecto, excepto los que explícitamente indican `/backend`.

---

## Créditos

Desarrollado con [Lovable](https://lovable.dev/) y tecnologías open source.

---

