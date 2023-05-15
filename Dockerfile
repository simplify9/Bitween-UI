# build environment
FROM node:18-alpine as build
WORKDIR /app

COPY package.json /app/
RUN yarn
COPY . /app

RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/public /usr/share/nginx/html
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
