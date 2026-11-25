# Guia de contribucion - CompraAmigo Frontend

Gracias por ayudar a mejorar CompraAmigo. Esta guia resume como preparar el frontend, comprobar los cambios y proponerlos al equipo.

## 1. Preparar el entorno

- Instala Node.js y npm.
- Abre la carpeta raiz del frontend en la terminal.
- Instala las dependencias con:

```powershell
npm.cmd ci
```

## 2. Ejecutar la aplicacion

Inicia el servidor de desarrollo:

```powershell
npm.cmd start
```

Abre `http://localhost:4200/` en el navegador. El frontend utiliza rutas `/api`; el proxy de desarrollo las reenvia al backend Spring Boot en `http://localhost:8080`. Para probar funciones que consultan datos, inicia tambien el backend y su base de datos PostgreSQL.

## 3. Validar los cambios

Antes de proponer un cambio, ejecuta la compilacion:

```powershell
npm.cmd run build
```

Ejecuta tambien las pruebas automatizadas:

```powershell
npm.cmd test -- --watch=false
```

Si alguna validacion falla, indica el resultado en la descripcion del Pull Request.

## 4. Trabajar en una rama

Evita hacer cambios directamente sobre `master`. Crea una rama con un nombre corto que describa tu trabajo. Por ejemplo:

```powershell
git switch -c docs/guia-contribucion
```

Usa prefijos como `feature/` para nuevas funciones, `fix/` para correcciones y `docs/` para documentacion.

## 5. Guardar y enviar el aporte

Revisa los archivos modificados:

```powershell
git status
```

Agrega solamente los archivos relacionados con tu cambio. Para esta guia:

```powershell
git add README.md CONTRIBUTING.md
git commit -m "docs: add frontend contribution guide"
git push -u origin docs/guia-contribucion
```

Despues, abre GitHub y crea un Pull Request hacia la rama `master` del repositorio original `FiorellaDG/CompraAmigo-Frontend`. Explica que agregaste una guia para preparar el entorno, ejecutar validaciones y enviar contribuciones.

## 6. Buenas practicas

- Mantén los cambios enfocados y faciles de revisar.
- No subas `node_modules/`, archivos generados en `dist/`, contrasenas, tokens ni datos personales.
- No reemplaces archivos de configuracion del equipo sin coordinarlo.
- Incluye capturas cuando el cambio afecte la interfaz.
- Espera la revision del equipo antes de considerar integrado el cambio.

> Nota: si trabajas desde un fork, `origin` debe apuntar a tu copia de GitHub. El Pull Request se crea desde tu rama hacia `FiorellaDG/CompraAmigo-Frontend:master`.
