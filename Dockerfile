FROM node:10

WORKDIR /app
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm install

ADD . /app

CMD npm start
