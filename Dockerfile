# --- Build stage: compile the Vite/React app to static files ---
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL is intentionally left unset -> the app calls same-origin "/api",
# which Caddy proxies to the backend. No rebuild needed per environment.
RUN npm run build

# --- Serve stage: nginx with the built static files ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
