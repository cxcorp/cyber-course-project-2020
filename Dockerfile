FROM node:14-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm i

COPY . .

CMD ["node", "src/index.js"]