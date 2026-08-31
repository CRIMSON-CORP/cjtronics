# Screen brightness / volume

The dashboard now sends `brightness` and `volume` for a screen. The backend
needs to persist them and return them on reads.

Both are integers, 0-100.

## Update

`PUT /screen/settings/:reference`

```json
{
  "brightness": 80,
  "volume": 0
}
```

Mirrors the existing `PUT /screen/scroll/:reference`.

## Reads

Return `brightness` and `volume` on the screen objects from:

- `GET /screen`
- `GET /screen/:screen_id`
- `GET /public-advert/campaigns/:deviceId` — on the `config` object

Where no value is stored, the dashboard and the device both default to
brightness `100` and volume `0`, so an unconfigured screen looks normal and
never plays audio on its own.

## Note on the live path

The value reaches the device over the websocket, not through the backend. The
backend record is what the dashboard reads on page load and what a reinstalled
device starts from; the device itself stores the last value it actually applied
and reapplies that on boot.
