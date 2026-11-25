# Mapa de navegacion y estructura del frontend de CompraAmigo

Este documento resume la organizacion del frontend de CompraAmigo para que los integrantes del equipo puedan ubicar las pantallas, entender las rutas principales y reconocer donde se controlan los permisos de navegacion.

## 1. Tecnologia y comandos principales

El frontend esta desarrollado con Angular 22.2.6. Los comandos definidos en `package.json` son:

```powershell
npm.cmd ci
npm.cmd start
npm.cmd run build
npm.cmd test -- --watch=false
```

- `npm.cmd ci`: instala las dependencias definidas en `package-lock.json`.
- `npm.cmd start`: inicia el servidor de desarrollo.
- `npm.cmd run build`: genera la compilacion del frontend.
- `npm.cmd test -- --watch=false`: ejecuta las pruebas sin dejar el modo de observacion activo.

El servidor de desarrollo se abre en `http://localhost:4200/`.

## 2. Rutas principales

Las rutas se definen en `src/app/app.routes.ts`.

| Ruta | Pantalla o componente | Acceso configurado |
| --- | --- | --- |
| `/` | Redirecciona al catalogo | Redireccion |
| `/home` | Redirecciona al catalogo | Redireccion |
| `/login` | Inicio de sesion | Sin guard de ruta en esta configuracion |
| `/catalogo` | Catalogo de productos | Sesion iniciada |
| `/producto/:id` | Detalle de producto | Sesion iniciada |
| `/perfil` | Perfil del cliente | Sesion y rol de cliente |
| `/carrito` | Carrito de compras | Sesion y rol de cliente |
| `/checkout` | Finalizacion de compra | Sesion y rol de cliente |
| `/pedidos` | Historial de pedidos | Sesion y rol de cliente |
| `/pedidos/:id` | Detalle de pedido | Sesion y rol de cliente |
| `/pedidos/:id/confirmacion` | Confirmacion de pedido | Sesion y rol de cliente |
| `/admin/productos` | Administracion de productos | Sesion y rol de administrador |
| `/admin/pedidos` | Administracion de pedidos | Sesion y rol de administrador |
| `/soporte` | Soporte al cliente | Sesion y rol de cliente |

Las rutas que no coinciden con una ruta conocida redirigen al catalogo.

## 3. Control de acceso en las rutas

El archivo de rutas utiliza tres guards importados desde `src/app/services/autenticacion`:

- `requiereSesion`: limita el acceso a usuarios con una sesion iniciada.
- `requiereCliente`: se utiliza junto con la sesion en las pantallas destinadas al cliente.
- `requiereAdmin`: se utiliza junto con la sesion en las pantallas de administracion.

Antes de cambiar una ruta o su guard, revisa el flujo de autenticacion y confirma con el equipo que el cambio corresponde al comportamiento esperado.

## 4. Ubicacion de los componentes

Las pantallas se organizan dentro de `src/app/componente/`. Entre las carpetas presentes en el proyecto se encuentran:

- `login-component`: inicio de sesion.
- `catalogo-component`: catalogo de productos.
- `detalle-producto-component`: detalle de un producto.
- `perfil-component`: perfil del cliente.
- `carrito-component`: carrito de compras.
- `checkout-component`: proceso de compra.
- `pedidos-component`: listado de pedidos.
- `detalle-pedido-component`: detalle y confirmacion de pedidos.
- `admin-productos-component`: gestion administrativa de productos.
- `admin-pedidos-component`: gestion administrativa de pedidos.
- `soporte-component`: soporte al cliente.

Tambien existen carpetas para elementos complementarios, como `navbar`, `chat-flotante-component`, `eco-impacto-component`, `home-component` y `confirmar-producto-component`. Su presencia en el proyecto no significa necesariamente que cada uno tenga una ruta independiente.

Cada pantalla suele separar su implementacion en archivos TypeScript, HTML y CSS dentro de su carpeta.

## 5. Servicios y comunicacion con el backend

Los servicios compartidos se encuentran en `src/app/services/`. En la estructura revisada aparecen archivos relacionados con autenticacion, inicio de sesion, sesion y operaciones de compra.

El archivo `proxy.conf.json` reenvia las solicitudes que comienzan con `/api/` al backend local en `http://localhost:8080`. Esta configuracion se utiliza con el servidor de desarrollo; no reemplaza la configuracion que requiere un entorno desplegado.

## 6. Recomendaciones para realizar cambios

1. Revisa primero `app.routes.ts` para entender como se accede a la pantalla que vas a modificar.
2. Busca la carpeta del componente correspondiente dentro de `src/app/componente/`.
3. Revisa los servicios relacionados antes de cambiar llamadas a la API o el manejo de sesion.
4. Evita modificar los guards de acceso sin comprobar los efectos sobre los roles de cliente y administrador.
5. Ejecuta la compilacion y las pruebas disponibles antes de proponer el cambio mediante un Pull Request.
6. Describe en el Pull Request que pantalla o flujo se modifico y que validaciones ejecutaste.

---

Documento de orientacion elaborado a partir de la estructura del frontend, su archivo de rutas, `package.json`, `proxy.conf.json` y el README del proyecto. Si la estructura cambia, actualiza este mapa para mantenerlo alineado con el codigo.
