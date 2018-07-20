FROM node:9
WORKDIR /srv/daily-report-bot
ADD package.json /srv/daily-report-bot
RUN npm install
COPY . .
CMD [ "npm", "start" ]