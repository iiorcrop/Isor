FROM node:22-alpine

RUN npm install -g pm2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
CMD ["pm2-runtime", "start", "index.js"]