FROM node:14.17-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8008

CMD ["npm", "run", "start:prod"]