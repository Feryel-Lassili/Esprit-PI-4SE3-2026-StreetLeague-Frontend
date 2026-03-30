# ========================
# Stage 1: Build Angular App
# ========================
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the Angular app for production
RUN npm run build -- --configuration production

# ========================
# Stage 2: Production Image (Nginx)
# ========================
FROM nginx:stable-alpine

# Copy the built Angular files (IMPORTANT: your output path)
COPY --from=build /app/dist/frontend2test/browser /usr/share/nginx/html

# Copy custom nginx config for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]