#!/bin/bash

npm run build:prod
pm2 start dist/index.js --name hotel_manage_server