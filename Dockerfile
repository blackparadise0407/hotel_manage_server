FROM node:14.17-alpine

RUN mkdir -p /app/node_modules

WORKDIR /app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 8008

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.8.0/wait /wait
RUN chmod +x /wait

CMD /wait && npm run start:prod