FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install

RUN apk update && \
    apk add --no-cache ffmpeg

COPY ./src ./src

CMD npm start