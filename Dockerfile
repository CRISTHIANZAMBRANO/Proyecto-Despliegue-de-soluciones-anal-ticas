# Imagen base: Python ligero
FROM python:3.11-slim

# Evitar archivos .pyc y forzar logs en stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar herramientas de compilación (por si xgboost necesita compilar algo)
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la API y el modelo entrenado
COPY app.py .
COPY model_xgboost.pkl .

# Puerto por defecto dentro del contenedor
EXPOSE 8000
ENV PORT=8000

# Comando para arrancar FastAPI con Uvicorn
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
