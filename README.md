# daily-report-bot

## Installation

#### From Docker
- Install `docker`
- `docker run -dit --restart always -e TOKEN=<YOUR TOKEN> -e REPORT_CHANNEL=<YOUR CHANNEL ID> -e AUTO_REPORTING=true -e REPORT_HOUR=10 bravetarget/daily-report-bot`

#### From Source
- Install `nodejs` v10+
- Clone repository to a local directory
- Create a new file in the root directory called .env with the [contents below](#sample-env) filled accordingly
- Install dependencies: `npm install`
- `npm start`
- Bot should now be connected


#### SAMPLE .ENV:
```
TOKEN=NDYxNjc4NjY2MzMwNDA2OTIy.XXXXX.lkmINsnj7qOvpTupOoSrWGNWUJg
REPORT_CHANNEL=454444350858346516
AUTO_REPORTING=true
REPORT_HOUR=10
```
