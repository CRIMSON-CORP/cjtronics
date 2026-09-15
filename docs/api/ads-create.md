# Ad Upload & Creation (`POST /v1/ads/create`)

The dashboard uploads ad creatives directly to the backend using `multipart/form-data`. Each creative is submitted as an individual request so that progress can be tracked and failed uploads can be retried independently without duplicating successful ones.

---

## Endpoint Details

- **Method**: `POST`
- **URL**: `/v1/ads/create`
- **Headers**:
  - `Authorization: Bearer <user_token>`
  - `Content-Type: multipart/form-data`
  - `Accept: application/json`

---

## Request Payload (`multipart/form-data`)

| Field            | Type              | Required | Description                                                                      |
| :--------------- | :---------------- | :------- | :------------------------------------------------------------------------------- |
| `organizationId` | `string` / `int`  | **Yes**  | ID of the organization that owns the campaign/screen.                            |
| `screenId`       | `string` / `int`  | **Yes**  | ID of the target screen.                                                         |
| `adsAccountId`   | `string` / `int`  | **Yes**  | ID of the advertiser/ad account.                                                 |
| `adsType`        | `string`          | **Yes**  | Creative type: `'image'`, `'video'`, or `'html'`.                                |
| `adsName`        | `string`          | **Yes**  | Display name or file name of the ad.                                             |
| `adsUpload`      | `File` / `string` | **Yes**  | Content payload. Binary file for `image`/`video`, or raw HTML string for `html`. |

### Important PHP Handling Note for `adsUpload`

Because ads can be either media files or HTML snippets, PHP will parse `adsUpload` differently depending on `adsType`:

- **For `'image'` and `'video'`**: Sent as a binary file.
  - Access in PHP: `$_FILES['adsUpload']` (or `$request->file('adsUpload')` in Laravel).
- **For `'html'`**: Sent as a raw HTML snippet/iframe text.
  - Access in PHP: `$_POST['adsUpload']` (or `$request->input('adsUpload')` in Laravel).

---

## Responses

The frontend uses toast notifications that expect a human-readable `message` string on both success and error responses (`error.response?.data?.message`).

### 1. Success (`201 Created` or `200 OK`)

```json
{
  "status": true,
  "message": "Ad uploaded successfully",
  "data": {
    "id": 1042,
    "adsName": "Sample Video Promo",
    "adsType": "video",
    "url": "https://cdn.example.com/ads/sample.mp4",
    "screenId": "screen_123",
    "organizationId": "org_456"
  }
}
```

### 2. Validation Error (`422 Unprocessable Entity` or `400 Bad Request`)

Return a descriptive `message` so the dashboard toast displays why the upload was rejected:

```json
{
  "status": false,
  "message": "The file size exceeds the allowed limit of 100MB.",
  "errors": {
    "adsUpload": ["The file size exceeds the allowed limit of 100MB."]
  }
}
```

### 3. Authentication Error (`401 Unauthorized`)

```json
{
  "status": false,
  "message": "Unauthenticated or token expired."
}
```

---
