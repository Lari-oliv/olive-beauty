# Use uma imagem base oficial do Node.js
FROM node:18-alpine


RUN WORKDIR /app

WORKDIR /app

COPY COPY package*.json ./ 
RUN npm install

EXPOSE 3000
COPY . .

CMD ["npm", "run", "start"]