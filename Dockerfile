FROM node:14.18.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . ./
ENV PORT 8080
CMD [ "npm", "start" ]