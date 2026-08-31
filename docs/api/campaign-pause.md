# Campaign pause / resume

The dashboard now sends `is_paused` when updating a campaign. The backend needs
to persist it and return it on reads.

## Update

`PUT /ads/campaign/:campaign_id`

```json
{
  "campaign_id": "<campaign reference>",
  "is_paused": true
}
```

## Reads

Return `is_paused` on the campaign objects from:

- `GET /campaign`
- `GET /campaign/screen/:screen_id`
- `GET /campaign/:campaign_id`
- `GET /public-advert/campaigns/:deviceId` — on each ad

Paused campaigns should also be left out of the device playlist.
