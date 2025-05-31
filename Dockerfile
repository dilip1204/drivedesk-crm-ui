# Stage 1 - Build React app
FROM node:18 AS build

# Accept the environment variable during build
ARG REACT_APP_BASE_API_URL
ENV REACT_APP_BASE_API_URL=${REACT_APP_BASE_API_URL}

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Build with env  injected
RUN npm run build

# Stage 2 - NGINX to serve React and proxy API
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom NGINX config (with API proxy to /api/)
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
