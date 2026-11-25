c# Cloudinary Image Lab

**Menos peso. Mismo impacto.**

[Read in English](./README.md)

Aplicación web interactiva y educativa desarrollada con Angular 22 para explorar, comparar y medir en tiempo real cómo Cloudinary optimiza imágenes mediante transformaciones dinámicas.

Desarrollada por **Orlando Ezequiel Salazar Cruz** ([GitHub](https://github.com/Ezequie1Sc)) como demostración técnica del artículo de DEV Community *"Stop Serving Heavy Images: A Developer's Guide to Cloudinary and Angular"* y como contribución al programa Cloudinary Creators (modalidades Build & Share y Write & Share, sujetas a aprobación).

---

## Funcionalidades

- **Comparador interactivo Before & After**: Deslizador fluido compatible con mouse, pantallas táctiles y teclado que compara exactamente el mismo recurso de Cloudinary antes y después de optimizarlo.
- **Métricas reales en el navegador**: Mide el tamaño real (`Blob.size`), la cabecera `Content-Type`, las dimensiones intrínsecas, los bytes ahorrados y el porcentaje de reducción, contemplando archivos más pesados, restricciones CORS y cancelación de solicitudes obsoletas.
- **Panel de transformaciones**: Permite elegir formato (`f_auto`, `f_webp`, `f_avif`, `f_jpg`, `f_png`), calidad (`q_auto`, `q_auto:best`, `q_auto:good`, `q_auto:eco`, `q_auto:low` o manual `q_10`–`q_100`) y ancho máximo con `c_limit,w_*`.
- **URL generada y Code Playground**: Muestra la URL exacta con resaltado discreto de parámetros y fragmentos copiables en `URL`, `HTML`, `Angular` y `TypeScript` usando `@cloudinary/url-gen` y `@cloudinary/ng`.
- **Demostración de imágenes responsivas**: Muestra cómo combinar `srcset`, `sizes` y `c_limit,w_*` para vistas Móvil, Tablet y Escritorio.
- **Internacionalización completa (EN / ES)**: Cambio inmediato sin recargar, detección del navegador, persistencia en `localStorage`, formato numérico con `Intl` y prueba automatizada de paridad de claves.
- **Diseño inspirado en Vercel y Geist**: Interfaz monocromática oscura con Geist Sans y Geist Mono autohospedadas mediante Fontsource.

## Tecnologías

- **Angular 22** (Standalone Components, Signals, `OnPush`, lazy loading)
- **TypeScript 6** (modo `strict`)
- **SDK oficiales de Cloudinary**: `@cloudinary/url-gen` y `@cloudinary/ng`
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + Design Tokens CSS
- **Lucide Icons** (`@lucide/angular`)
- **Geist Sans y Geist Mono** (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`)
- **Vitest + jsdom** (`@angular/build:unit-test`)
- **ESLint 9 + angular-eslint 22 + Prettier**

## Arquitectura

Arquitectura basada en funcionalidades (*Feature-Based Architecture*) con capas separadas: `core/`, `shared/`, `layouts/` y `features/` (`home`, `image-lab`, `documentation`). Consulta [docs/architecture.md](./docs/architecture.md) para más detalles.

## Instalación y ejecución local

### Requisitos previos

- **Node.js**: `^22.22.3`, `^24.15.0` o `^26.0.0` (requerido por Angular 22)
- **npm**: `>= 10.0.0`

### Primeros pasos

```bash
npm install
npm start
```

Abre `http://localhost:4200` en tu navegador. La aplicación funciona de inmediato con recursos públicos verificados del entorno `demo` de Cloudinary.

## Configuración de Cloudinary

La configuración está centralizada en `src/environments/environment.ts` y `src/environments/environment.prod.ts` mediante el token `CLOUDINARY_CONFIG`. Consulta [docs/cloudinary-setup.md](./docs/cloudinary-setup.md) para usar tu propio Cloud Name.

## Pruebas y control de calidad

```bash
npm test          # Pruebas unitarias con Vitest (no interactivo)
npm run lint      # ESLint y accesibilidad de plantillas Angular
npm run typecheck # Verificación estricta de TypeScript
npm run build:prod
```

## Despliegue en Vercel

El archivo `vercel.json` ya está configurado para el directorio de salida de Angular 22 (`dist/cloudinary-image-lab/browser`) con rewrites SPA para Angular Router.

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Verifica el comando `npm run build:prod` y el directorio `dist/cloudinary-image-lab/browser`.
4. Ejecuta el despliegue.

## Consideraciones de seguridad

- Solo el `cloudName` público forma parte del frontend.
- No existen API Secrets ni credenciales privadas en el repositorio.
- Los `publicId` se validan contra recorridos de ruta (`..`) y caracteres no permitidos.

## Limitaciones conocidas

- Las métricas miden `Blob.size` mediante `fetch()` en modo CORS. Si un entorno personalizado restringe CORS, la interfaz muestra explícitamente *No disponible*.
- Las mediciones en vivo en `docs/optimization-results.md` deben registrarse al ejecutar la aplicación localmente con acceso a Internet.

## Licencia

Licencia MIT — consulta [LICENSE](./LICENSE).

## Desarrollador

**Orlando Ezequiel Salazar Cruz** — [https://github.com/Ezequie1Sc](https://github.com/Ezequie1Sc)
