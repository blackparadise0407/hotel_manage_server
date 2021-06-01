FROM node:14.16.1-alpine3.12

RUN mkdir -p /home/apps/instagram/server/node_modules 
# Create app directory
WORKDIR /home/apps/instagram/server

COPY package*.json /server/

RUN npm install

COPY . .

EXPOSE 8008

CMD ["npm run", "start:prod"]
