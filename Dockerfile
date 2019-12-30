FROM arf95/npm-alpine:latest as build
WORKDIR /usr/src/app

COPY package*.json ./
COPY package-lock*.json ./
COPY . ./

RUN npm ci --production && \
    npm run-script build

FROM arf95/npm-alpine:latest
WORKDIR /usr/src/app

COPY .babelrc .
COPY --from=build /usr/src/app .

RUN ['npm','start']
