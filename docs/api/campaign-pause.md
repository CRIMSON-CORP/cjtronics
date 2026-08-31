# Campaign pause / resume

**Status: frontend built, backend not implemented.**

The dashboard sends the field described below today. The backend currently
ignores it, so the toggle round-trips and updates the UI without changing
anything server-side. Everything under [Backend work required](#backend-work-required)
is still outstanding.

## Feature

Operators can pause and resume an individual campaign.

- A paused campaign stops playing.
- Pausing does **not** change the campaign's original `startAt` / `endAt`. The
  booked schedule must survive a pause/resume cycle untouched.
- A paused campaign is excluded from the screen playlist.
- Paused campaigns remain visible in the dashboard, otherwise they could not be
  resumed.

## Frontend request

The toggle reuses the existing campaign update proxy rather than adding a route.

`PUT /api/admin/campaigns/update` → `PUT /ads/campaign/:campaign_id`

```json
{
  "campaign_id": "<campaign reference>",
  "is_paused": true
}
```

`campaign_id` is the campaign's `reference`, consistent with the rest of the
codebase (`edit-campaign` sends `campaign_id: campaign.reference`).

Expected response, matching the standard envelope:

```json
{
  "status": true,
  "message": "Campaign paused",
  "data": { "reference": "<campaign reference>", "is_paused": true }
}
```

The client treats HTTP 200 with `status: false` as a failure and surfaces
`message` in a toast, same as every other mutation on the dashboard.

## Backend work required

### 1. Accept and persist `is_paused`

`PUT /ads/campaign/:campaign_id` must accept a boolean `is_paused` and persist
it as a **new field, independent of `isActive` and of the start/end dates.**

> **This request is a partial update.** It carries only `campaign_id` and
> `is_paused`. If the handler currently overwrites the campaign from the request
> body, it will blank out `name`, `startAt`, `endAt`, `playDays`, `playUploads`
> and everything else. Confirm it merges rather than replaces before relying on
> this, or expose a dedicated endpoint (suggested: `PUT /campaign/pause/:reference`)
> and the frontend will be repointed at it.

Do not model pausing by mutating dates or by clearing `isActive` — the feature
explicitly requires the original booking window to be preserved, and the
dashboard's active-campaigns list filters on `isActive: true`, so reusing that
flag would make paused campaigns disappear from the screen used to resume them.

### 2. Return `is_paused` on campaign reads

Add `is_paused` to the campaign objects returned by at least:

- `GET /campaign`
- `GET /campaign/screen/:screen_id`
- `GET /campaign/:campaign_id`

Until this lands the dashboard defaults each row to `false` on page load, so a
paused campaign reads as unpaused after a refresh.

### 3. Exclude paused campaigns from the device playlist

`GET /public-advert/campaigns/:deviceId` must omit ads belonging to paused
campaigns. **This is the mechanism that actually stops playback** — everything
below is a backstop, not a substitute.

Additionally, include `is_paused` on each ad object in that payload. The device
now filters on it as defence in depth, so a payload that still carries paused
ads won't play them. Absent is treated as not paused, so shipping the field is
optional if step 3 is done properly — but sending it costs nothing and covers a
partial rollout.

> Note: every other field in this payload is camelCase (`campaignId`,
> `campaignView`, `uploadRef`). `is_paused` is snake_case to match the field
> name chosen for the campaign record. Worth settling on one before this is
> implemented — changing it now is a two-line change in each repo, changing it
> later is a migration.

## Not covered by this change

**Connected screens are not updated live.** A device only refreshes its playlist
when someone presses *Send to Device* on the campaign schedule page, or on a
fresh install. A device with a populated cache never re-fetches on its own.

So after step 3 ships, a paused campaign keeps playing on already-running screens
until the playlist is pushed. Closing that gap means having the pause action
trigger a `send-to-device` over the socket, which is a separate piece of work and
has not been requested.
