FROM node:latest as build

WORKDIR /app

COPY . .

RUN npm install

# New container is created here
FROM node:23.6.1-alpine

WORKDIR /app

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/src /app/src
COPY --from=build /app/tsconfig.json /app/tsconfig.json

CMD ["npm", "run", "dev"]