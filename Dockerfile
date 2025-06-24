# Stage 1: Build React app
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.21-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Entrypoint
CMD ["/bin/sh", "-c", "envsubst '$$API_HOST' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
