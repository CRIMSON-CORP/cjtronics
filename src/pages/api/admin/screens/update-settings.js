/**
 * STUB ROUTE - the backend does not store screen brightness/volume yet.
 *
 * Validates and echoes the standard envelope so the UI can be built against it.
 * Nothing is persisted: the sliders reset to their defaults on reload.
 *
 * Contract for the backend team: docs/api/screen-brightness-volume.md
 */

const isPercentage = (value) => Number.isInteger(value) && value >= 0 && value <= 100;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { reference, brightness, volume } = req.body ?? {};

  if (!reference) {
    return res.status(400).json({ status: false, message: 'Screen reference is required' });
  }

  if (!isPercentage(brightness) || !isPercentage(volume)) {
    return res
      .status(400)
      .json({ status: false, message: 'brightness and volume must be integers between 0 and 100' });
  }

  // TODO(backend): once PUT /screen/settings/:reference exists, delete the
  // stubbed response below and restore this. Needs the two imports back:
  // `import axios from 'src/lib/axios'` and `import getCookie from 'src/utils/get-cookie'`.
  //
  // try {
  //   const response = await axios.put(
  //     `/screen/settings/${reference}`,
  //     { brightness, volume },
  //     { headers: { Authorization: `Bearer ${getCookie(req)}` } }
  //   );
  //   if (response.data.status && response.status === 200)
  //     return res.status(response.status).json(response.data);
  //   throw response;
  // } catch (error) {
  //   if (error.data) {
  //     return res.status(401).json({ message: error.message });
  //   }
  //   if (!error.response) {
  //     return res.status(503).json({ message: 'No response from Server' });
  //   }
  //   return res.status(error.response.status).json(error.response.data);
  // }

  return res.status(200).json({
    status: true,
    message: 'Screen settings saved',
    data: { reference, brightness, volume },
  });
}
