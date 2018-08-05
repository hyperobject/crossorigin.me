FROM node:10

RUN npm install yarn

WORKDIR /app
ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
RUN yarn install

ADD . /app

CMD npm start
