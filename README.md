# EA Backend Proyecto

Backend Express + MongoDB para el proyecto de graduacion.

## Desplegar en Render con MongoDB Atlas

El proyecto esta preparado para desplegarse como servicio Docker en Render y usar MongoDB Atlas como base de datos externa.

Render construye la imagen desde el `Dockerfile` del repositorio. El archivo `render.yaml` deja configurado:

- servicio web con `runtime: docker`;
- healthcheck en `/ping`;
- variables JWT generadas automaticamente;
- `MONGO_URI` como variable que debes introducir en Render.

Variables que debes configurar en Render:

```text
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/graduacio?retryWrites=true&w=majority
```

No hace falta definir `SERVER_PORT` en Render. El backend lee automaticamente `PORT`, que es el puerto que suelen inyectar las plataformas de hosting.

En MongoDB Atlas, recuerda permitir conexiones desde Render. Para pruebas puedes usar `0.0.0.0/0` en Network Access, aunque para produccion es mejor restringirlo si tu proveedor te da IPs fijas.

## Ejecutar con Docker

Este modo levanta tambien un MongoDB local. Usalo solo para desarrollo local.

1. Copia el archivo de ejemplo de variables:

```bash
cp .env.docker.example .env
```

2. Cambia los valores de `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` en `.env`.

3. Levanta la API y MongoDB:

```bash
docker compose up --build
```

La API queda disponible en:

```text
http://localhost:1337
```

Swagger queda disponible en:

```text
http://localhost:1337/api
```

Healthcheck:

```text
http://localhost:1337/ping
```

## Variables principales

- `SERVER_PORT`: puerto expuesto en la maquina host. Por defecto `1337`.
- `PORT`: puerto dinamico usado por plataformas como Render. Tiene prioridad sobre `SERVER_PORT`.
- `MONGO_PORT`: puerto expuesto de MongoDB en la maquina host. Por defecto `27017`.
- `MONGO_URI`: dentro de Docker Compose se configura como `mongodb://mongo:27017/graduacio`.
- `JWT_ACCESS_SECRET`: secreto para firmar access tokens.
- `JWT_REFRESH_SECRET`: secreto para firmar refresh tokens.
- `JWT_ACCESS_EXPIRES_IN`: expiracion del access token. Por defecto `12h` en Docker.
- `JWT_REFRESH_EXPIRES_IN`: expiracion del refresh token. Por defecto `7d`.

## Comandos utiles

Parar los contenedores:

```bash
docker compose down
```

Parar y borrar tambien los datos de MongoDB:

```bash
docker compose down -v
```

Ver logs de la API:

```bash
docker compose logs -f api
```
