# veh-api

VEH Project API

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

API server will listen on [http://localhost:8000](http://localhost:8000) & watch for changes to restart.

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
