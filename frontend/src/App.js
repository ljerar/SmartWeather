import React, { useState } from 'react';
import axios from 'axios';
import cities from './data/cities.json';

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [alert, setAlert] = useState(null);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getFeelsLikeIcon = (temp) => {
    if (temp < 5) return '❄️';
    if (temp < 15) return '🌬️';
    if (temp < 25) return '🙂';
    return '🔥';
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setCity(val);
    if (val.length > 1) {
      const match = cities.filter(c =>
        c.name.toLowerCase().startsWith(val.toLowerCase())
      );
      setSuggestions(match.slice(0, 10));
    } else {
      setSuggestions([]);
    }
  };

  const fetchAlerts = async (lat, lon) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/alerts?lat=${lat}&lon=${lon}`);
      setAlert(res.data.length > 0 ? res.data[0] : null);
    } catch (err) {
      console.error('Alert fetch error:', err.message);
      setAlert(null);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const [wRes, fRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`),
        axios.get(`http://localhost:5000/api/forecast?lat=${lat}&lon=${lon}`)
      ]);

      setWeather(wRes.data);

      const groupedByDay = {};
      fRes.data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!groupedByDay[date]) {
          groupedByDay[date] = item;
        }
      });

      const dailyArray = Object.values(groupedByDay).slice(0, 5);
      setForecast(dailyArray);

      await fetchAlerts(lat, lon);
      setError('');
    } catch (err) {
      setError('Could not fetch weather data.');
      setWeather(null);
      setForecast([]);
      setAlert(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    }, () => {
      setError('Location access denied.');
    });
  };

  const getWeatherIcon = (desc) => {
    const lower = desc.toLowerCase();
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('rain')) return '🌧';
    if (lower.includes('clear')) return '☀️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('storm') || lower.includes('thunder')) return '⛈';
    return '🌤';
  };

  const dismissAlert = () => setAlert(null);

  const bgColor = darkMode ? '#1e1e1e' : '#f4f4f4';
  const textColor = darkMode ? '#f1f1f1' : '#111';
  const cardBg = darkMode ? '#2c2c2c' : '#ffffff';
  const inputBg = darkMode ? '#333' : '#fff';

  return (
    <div style={{
      background: bgColor,
      color: textColor,
      minHeight: '100vh',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '650px',
        margin: 'auto',
        padding: '2rem',
        fontFamily: 'Segoe UI, Roboto, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>SmartWeather {darkMode ? '🌙' : '☀️'}</h1>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: 'none',
            background: darkMode ? '#444' : '#ccc',
            color: darkMode ? '#eee' : '#000',
            cursor: 'pointer'
          }}>
            {darkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            background: inputBg,
            color: textColor,
            marginTop: '1rem'
          }}
        />

        {suggestions.length > 0 && (
          <ul style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: 0,
            listStyle: 'none',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '0.3rem',
            background: cardBg,
            color: textColor
          }}>
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  setCity(s.name);
                  setSuggestions([]);
                }}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #555'
                }}
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => {
              const match = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
              if (match) {
                fetchWeatherByCoords(match.lat, match.lon);
                setSuggestions([]);
              } else {
                setError('City not found.');
              }
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              background: '#2e86de',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Get Weather
          </button>

          <button
            onClick={fetchWeatherByLocation}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              background: '#27ae60',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Use My Location
          </button>
        </div>

        {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>Loading...</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

        {alert && (
          <div style={{
            background: '#e74c3c',
            color: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '2rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            <h4>⚠️ {alert.event}</h4>
            <p><strong>Source:</strong> {alert.sender_name}</p>
            <p>{alert.description}</p>
            <button onClick={dismissAlert} style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.8rem',
              background: '#fff',
              color: '#e74c3c',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>Dismiss</button>
          </div>
        )}

        {weather && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2>{weather.name}</h2>
            <p>🌡 Temp: {weather.main.temp} °C</p>
            <p>{getFeelsLikeIcon(weather.main.feels_like)} Feels Like: {weather.main.feels_like} °C</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>💨 Wind: {weather.wind.speed} m/s</p>
            <p>{getWeatherIcon(weather.weather[0].description)} {capitalize(weather.weather[0].description)}</p>
          </div>
        )}

        {forecast.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ textAlign: 'center' }}>5-Day Forecast</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              {forecast.map((day, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  background: cardBg,
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  <strong>{new Date(day.dt * 1000).toLocaleDateString()}</strong>
                  <p style={{ margin: '0.5rem 0' }}>
                    {getWeatherIcon(day.weather[0].description)} {capitalize(day.weather[0].description)}
                  </p>
                  <p>🌡 {day.main.temp} °C</p>
                  <p>{getFeelsLikeIcon(day.main.feels_like)} Feels Like: {day.main.feels_like} °C</p>
                  <p>💧 {day.main.humidity}%</p>
                  <p>💨 {day.wind.speed} m/s</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
