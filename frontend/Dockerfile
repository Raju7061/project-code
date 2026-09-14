# ==========================================================
# Stage 1 - Build React App
# ==========================================================
FROM node:20-bookworm AS build

WORKDIR /app

COPY package*.json ./

# Faster and more reliable in CI
RUN npm ci

COPY . .

RUN npm run build

# ==========================================================
# Stage 2 - Nginx
# ==========================================================
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
