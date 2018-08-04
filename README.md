# daily-report-bot

## Installation

#### From Docker
- Install `docker`
- ```
  docker run -dit --name=lloyd --restart always \
  -e TOKEN=NDYxNjc4XXX2MzMwNDA2OTIy.XXXXX.lkmINsnj7qOvpTTpXXXrWGNWUJg \
  -e REPORT_CHANNEL=45442443508343446516 -e AUTO_REPORTING=true -e REPORT_HOUR=18 \
  -e DB_SERVER=ip:port -e DB_NAME=lloyd -e DB_USER=user -e DB_PASS=pass bravetarget/daily-report-bot
  ```

#### From Source
- Install `nodejs` v10+
- Clone repository to a local directory
- Create a new file in the root directory called .env with the [contents below](#sample-env) filled accordingly
- Install dependencies: `npm install`
- `npm start`
- Bot should now be connected


#### SAMPLE .ENV:
```
TOKEN=NDYxNjc4XXX2MzMwNDA2OTIy.XXXXX.lkmINsnj7qOvpTTpXXXrWGNWUJg
REPORT_CHANNEL=45442443508343446516
AUTO_REPORTING=true
REPORT_HOUR=18
DB_SERVER=ip:port
DB_NAME=lloyd
DB_USER=user
DB_PASS=pass
```
