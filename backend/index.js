const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  let url = '';

  try {
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Please provide city or latitude and longitude.' });
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

app.get('/api/forecast', async (req, res) => {
  const { city, lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  let url = '';

  try {
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Please provide city or latitude and longitude.' });
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data.' });
  }
});

app.get('/api/alerts', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${apiKey}`;
    const response = await axios.get(url);
    res.json(response.data.alerts || []);
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
