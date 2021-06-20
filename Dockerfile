FROM node:14.17-alpine

RUN mkdir -p /home/kyle/apps/hotel_manage_server/node_modules

WORKDIR /home/kyle/apps/hotel_manage_server

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 8008

CMD ["npm", "run", "start:prod"]