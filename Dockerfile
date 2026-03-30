# ========================
# Stage 1: Build Angular App
# ========================
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build -- --configuration production

# ========================
# Stage 2: Production Image (Nginx)
# ========================
FROM nginx:stable-alpine

# Copy built Angular app from build stage
COPY --from=build /app/dist/frontend2test/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]