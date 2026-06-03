# build environment
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile
COPY . /app

RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]