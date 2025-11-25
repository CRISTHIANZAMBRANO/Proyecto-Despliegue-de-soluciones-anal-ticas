# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos package.json / lockfile
COPY package*.json ./

# Instalamos dependencias
RUN npm ci || npm install

# Copiamos el resto del código del dashboard
COPY . .

# Build de producción (Vite / React)
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine

# Railway usará esta variable, pero puedes cambiar el valor por defecto
ENV PORT=8000

# Limpiamos config por defecto de nginx y añadimos gettext para envsubst
RUN apk add --no-cache gettext \
 && rm /etc/nginx/conf.d/default.conf

# Plantilla de configuración de nginx usando ${PORT}
COPY <<'EOF' /etc/nginx/conf.d/default.conf.template
server {
    listen       ${PORT};
    listen       [::]:${PORT};
    server_name  _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Copiamos el build generado por Vite
# (OJO: si tu build va a otra ruta, cámbialo aquí)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8000

# Renderiza la plantilla con PORT y arranca nginx
CMD sh -c 'envsubst "${PORT}" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"'
