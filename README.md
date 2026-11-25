# CompraAmigoFrontend

## Ejecutar CompraAmigo con el backend de Sprint 1

Abre esta carpeta en WebStorm y ejecuta `npm.cmd ci` seguido de `npm.cmd start`.
El frontend usa `/api` y el proxy de desarrollo reenvía las peticiones a Spring Boot en `http://localhost:8080`.
Ejecuta el backend de `CompraAmigo-Sprint1.zip` con PostgreSQL y sus variables de conexión.
Los datos SMTP se configuran en el backend si se quiere comprobar el recibo por correo.

Cada pantalla se encuentra en `src/app/componente/<nombre>-component/`, con archivos TypeScript, HTML y CSS.
La base de autenticación, la carpeta `login-component` y el menú `navbar` continúan la estructura de master.
La pestaña **Crear cuenta** usa un formulario reactivo con Angular Material y envía `nombre`, `username` y `password` a `POST /api/register`.
El registro crea una cuenta cliente. El acceso administrativo usa el rol que entrega la API.
Al completar el alta, el frontend inicia sesión con las credenciales recién registradas y abre Mi perfil.
Allí aparecen nombre y correo. Teléfono, ciudad, distrito y dirección quedan para completar.
Carrito, historial e impacto se consultan por la identidad de la cuenta actual.
La sesión anterior se retira al cambiar de cuenta y al completar un registro.
El login solicita correo, contraseña y la confirmación «Confirmo que soy humano».
La casilla usa `MatCheckbox` con `Validators.requiredTrue`. Es una confirmación del formulario.
Spring determina el rol de la cuenta autenticada. El administrador abre Inventario y el usuario abre Catálogo.

Se adaptaron del Sprint 1 las pantallas de catálogo, ficha, perfil, carrito, checkout, pedidos, inventario, chat e incidencias.
Los controles de texto y selección usan Angular Material y las pantallas se integran con la sesión que ya maneja master.
El checkout usa precios y totales calculados por Spring. El medio de pago se registra para la demostración.

Para verificar la compilación ejecuta `npm.cmd run build`. Para la prueba de navegación ejecuta `npm.cmd test -- --watch=false`.
El proxy se aplica al servidor local de desarrollo. La configuración del despliegue debe resolver `/api` hacia el backend del entorno.

### Preparar el frontend para la demo en EC2

1. En la terminal de WebStorm, ejecuta `npm.cmd ci` y `npm.cmd run build`. En Linux usa `npm ci` y `npm run build`.
2. Copia el contenido de `dist/CompraAmigo-Frontend/browser/` a la carpeta `frontend/` del paquete de EC2. Incluye `index.html`, JavaScript, estilos e imágenes.
3. Usa la configuración de Nginx de `deploy/ec2` en el backend de CompraAmigo. Nginx sirve los archivos de Angular y reenvía las solicitudes a `/api/` a Spring Boot. Así la pantalla y la API se pueden abrir desde la misma IPv4 pública.
4. Antes de presentar, abre `/api/health` y confirma que devuelve `{"status":"UP"}`. Verifica el registro de un cliente nuevo, abre el catálogo, recarga `/catalogo` y comprueba que la compra aparezca en **Mis pedidos**.

### Verificación de la integración

Se comprobó la compilación de producción, las pruebas automáticas de navegación, login y cambio de sesión, y un recorrido de navegador contra Spring Boot, PostgreSQL temporal y un buzón SMTP de prueba.
El recorrido creó una cuenta desde Angular, rechazó un correo duplicado, inició y cerró sesión, guardó el perfil y completó una compra por S/ 188.
También se comprobó la gestión de productos y stock, el seguimiento a «En camino», el chat, el código del ticket y el recibo HTML.
La API rechazó el acceso a pedidos y carritos ajenos. El formulario de registro se revisó en 1280 y 390 píxeles de ancho.
La compilación genera un aviso por el tamaño del paquete inicial de aproximadamente 528 kB, sobre el umbral de advertencia de 500 kB.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.6.

## Development server

To start a local development server, run:

```bash
npm.cmd start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
