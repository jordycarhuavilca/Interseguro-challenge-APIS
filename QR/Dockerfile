# Etapa 1: Construcción
FROM node:22 AS builder
# Establecer directorio de trabajo en el contenedor
WORKDIR /app_QR
# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install
# Copiar el resto de los archivos de la aplicación
COPY . .
# Compilar la aplicación
RUN npm run build
# Etapa 2: Ejecución
FROM node:22
# Establecer directorio de trabajo en el contenedor
WORKDIR /app_QR
# Copiar las dependencias instaladas desde la etapa de construcción
COPY --from=builder /app_QR/node_modules ./node_modules

# Copiar el código compilado desde la etapa de construcción
COPY --from=builder /app_QR/dist ./dist
# Copiar archivos de configuración necesarios (opcional)
COPY --from=builder /app_QR/package*.json ./
# Comando para ejecutar la aplicación
CMD ["/bin/bash", "-c", "node /app_QR/dist/index.js"]
# CMD ["tail", "-f", "/dev/null"]
