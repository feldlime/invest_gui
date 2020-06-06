FROM node:latest as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine as runtime
WORKDIR /app
COPY --from=builder /app/dist /app
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
