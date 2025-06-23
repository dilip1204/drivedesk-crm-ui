# Stage 1: Build React app
FROM node:18 AS build
WORKDIR /app
COPY . .
ARG REACT_APP_BASE_API_URL
ENV REACT_APP_BASE_API_URL=$REACT_APP_BASE_API_URL
RUN npm install && npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
ENV API_HOST=drivedesk-dev-api:8000
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]

