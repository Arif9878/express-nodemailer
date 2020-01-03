FROM arf95/npm-alpine:latest as build
WORKDIR /usr/src/app

#COPY package*.json ./
#COPY package-lock*.json ./
COPY .env-example ./.env
COPY . ./

RUN npm ci --production

FROM arf95/npm-alpine:latest
WORKDIR /usr/src/app

COPY --from=build /usr/src/app .
