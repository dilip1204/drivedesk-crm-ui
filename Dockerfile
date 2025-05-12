# Stage 1: Build the React app
FROM node:18-alpine as build

WORKDIR /app
COPY . .

# Add this line to fix OpenSSL error
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm install --legacy-peer-deps
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
