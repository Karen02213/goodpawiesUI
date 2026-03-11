# GoodPawies systemd deployment

This repository now includes systemd units for both development and production-style runtime.

## What gets installed

- `goodpawies-client-dev.service`: runs `npm start` inside `client/`
- `goodpawies-server-dev.service`: runs `npm run dev` inside `server/`
- `goodpawies-server.service`: runs `npm start` inside `server/`
- `goodpawies-dev.target`: starts the client and server development services together
- `goodpawies-prod.target`: starts the production API service together with `nginx`

## Why there are two modes

The client command `npm start` is the React development server and the server command `npm run dev` uses `nodemon`. They are fine for development, but they are not the production-grade way to serve the app.

For production, the frontend should be built with `npm run build` and served by `nginx`, while the backend should run with `npm start`.

## Install the units

From the repository root:

```bash
sudo ./scripts/install-systemd-services.sh --enable dev
```

To install the same units but make production boot behavior the default:

```bash
sudo ./scripts/install-systemd-services.sh --enable prod
```

The installer will:

- render the unit files with the current repository path
- detect the active `npm` binary
- install a helper command at `/usr/local/bin/goodpawiesctl`
- enable the selected target at boot
- start the selected target immediately unless `--no-start` is used

## Daily control commands

Development mode:

```bash
sudo goodpawiesctl dev start all
sudo goodpawiesctl dev stop all
sudo goodpawiesctl dev restart client
sudo goodpawiesctl dev restart server
sudo goodpawiesctl dev status all
sudo goodpawiesctl dev logs server
```

Production mode:

```bash
sudo goodpawiesctl prod start all
sudo goodpawiesctl prod stop all
sudo goodpawiesctl prod restart server
sudo goodpawiesctl prod restart nginx
sudo goodpawiesctl prod status all
sudo goodpawiesctl prod logs server
```

You can also use raw `systemctl` directly:

```bash
sudo systemctl start goodpawies-client-dev.service
sudo systemctl stop goodpawies-server-dev.service
sudo systemctl restart goodpawies-server.service
sudo systemctl start goodpawies-dev.target
sudo systemctl stop goodpawies-prod.target
```

## Production checklist

Before using `goodpawies-prod.target`:

1. Install dependencies in both `client/` and `server/`.
2. Build the frontend with `cd client && npm run build`.
3. Install and reload the `nginx` config from `nginx/goodpawies`.
4. Ensure the server `.env` file is present and valid.
5. Point DNS to the server for `goodpawies.dev` and `api.goodpawies.dev`.

## Logs

Use the journal for service logs:

```bash
sudo journalctl -u goodpawies-client-dev.service -f
sudo journalctl -u goodpawies-server-dev.service -f
sudo journalctl -u goodpawies-server.service -f
```

## Notes

- All services use `Restart=always` with a short backoff.
- The grouped targets are enabled with `WantedBy=multi-user.target`, so they start on boot.
- The server already handles `SIGTERM` and `SIGINT`, which makes systemd restarts and shutdowns clean.