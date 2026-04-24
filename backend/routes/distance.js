const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) return res.status(400).json({ error: 'Origin and destination required' });

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        units: 'imperial',
        key: process.env.GOOGLE_MAPS_API_KEY,
        region: 'gb'
      }
    });

    const data = response.data;
    if (data.status !== 'OK') {
      return res.status(400).json({ error: `Maps API error: ${data.status}` });
    }

    const meters = data.routes[0].legs[0].distance.value;
    const miles = Math.round((meters / 1609.344) * 10) / 10;
    const durationText = data.routes[0].legs[0].duration.text;

    res.json({ miles, duration: durationText });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not calculate distance' });
  }
});

module.exports = router;