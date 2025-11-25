# Build: Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime: Nginx sirviendo el build
FROM nginx:1.27-alpine
ENV PORT=8000
RUN apk add --no-cache gettext \
 && rm /etc/nginx/conf.d/default.conf

# Plantilla de config que usa $PORT
COPY <<'EOF' /etc/nginx/conf.d/default.conf.template
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Renderiza la plantilla con envsubst y arranca nginx
CMD envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf \
 && nginx -g 'daemon off;'

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8000
