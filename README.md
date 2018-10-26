# veh-api

This API makes it easy to query one of the OEHU bigchaindb nodes.

The API is part of the OEHU bigger project. Read about the bigger picture [over here](http://github.com/oehu/oehu-documentation).

## Installation

Install dependencies:

```bash
npm install
```

Now copy ./src/config.example.json to ./config.json & fill in the right mongo connection credentials:

```bash
cp ./src/config.example.json ./src/config.json
```

## Development

Make sure you have a connection to the mongo database. You might have to create a SSL tunnel:

```bash
ssh root@IP_OF_BIGCHAINDB_NODE -L 27018:localhost:27017
```

Now run the development environment:

```bash
npm run dev
```

The API server will listen on [http://localhost:8000](http://localhost:8000) & watch for changes to restart.

## Production

```bash
npm start
```

## Tests

The tests are made with [AVA](https://github.com/avajs/ava), [nyc](https://github.com/istanbuljs/nyc) and [mono-test-utils](https://github.com/terrajs/mono-test-utils) in `test/`:

```bash
npm test
```

____

Create this cron on the server to automatically start a SSH tunnel to a bigchaindb node:

    crontab -e

    * * * * * nc -z localhost 27018 || ssh -N -L 27018:localhost:27017 root@188.166.15.225 &

If you want to manually start the application using `pm2`, do the following:

    pm2 start npm -- start
