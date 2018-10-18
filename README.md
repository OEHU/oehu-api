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

Created this cron on server:

    */1 * * * * ~/create_ssh_tunnel.sh > tunnel.log 2>&1

Companioned with this `~/create_ssh_tunnel.sh` script:

    #!/bin/bash
    createTunnel() {
      /usr/bin/ssh root@188.166.15.225 -L 27018:localhost:27017
      if [[ $? -eq 0 ]]; then
        echo Tunnel to bigchaindb node created successfully
      else
        echo An error occurred creating a tunnel to bigchaindb node. RC was $?
      fi
    }
    /bin/pidof ssh
    if [[ $? -ne 0 ]]; then
      echo Creating new tunnel connection
      createTunnel
    fi
