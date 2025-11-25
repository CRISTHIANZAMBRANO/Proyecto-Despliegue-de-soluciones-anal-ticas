# Imagen base de Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y lockfile (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir versión de producción
RUN npm run build

# Exponer puerto (Railway usará PORT)
EXPOSE 5173
ENV PORT=5173

# Servir el build. Con Vite:
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT}"]