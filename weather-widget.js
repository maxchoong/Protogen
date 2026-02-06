// Weather code to emoji mapping
const weatherCodeMap = {
  0: '☀️',      // Clear sky
  1: '🌤️',     // Mainly clear
  2: '⛅',     // Partly cloudy
  3: '☁️',     // Overcast
  45: '🌫️',    // Foggy
  48: '🌫️',    // Foggy
  51: '🌧️',    // Light drizzle
  53: '🌧️',    // Moderate drizzle
  55: '🌧️',    // Dense drizzle
  61: '🌧️',    // Slight rain
  63: '🌧️',    // Moderate rain
  65: '⛈️',    // Heavy rain
  71: '❄️',    // Slight snow
  73: '❄️',    // Moderate snow
  75: '❄️',    // Heavy snow
  77: '❄️',    // Snow grains
  80: '🌧️',    // Slight rain showers
  81: '🌧️',    // Moderate rain showers
  82: '⛈️',    // Violent rain showers
  85: '❄️',    // Slight snow showers
  86: '❄️',    // Heavy snow showers
  95: '⛈️',    // Thunderstorm
  96: '⛈️',    // Thunderstorm with hail
  99: '⛈️',    // Thunderstorm with hail
};

const weatherDescriptionMap = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  61: 'Rainy',
  63: 'Rainy',
  65: 'Heavy Rain',
  71: 'Snowy',
  73: 'Snowy',
  75: 'Heavy Snow',
  77: 'Snow',
  80: 'Showers',
  81: 'Heavy Showers',
  82: 'Violent Showers',
  85: 'Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

async function fetchWeather(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.current;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
}

async function fetchLocationName(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding request failed');
    
    const data = await response.json();
    // Try to get city, town, or village name
    return data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown';
  } catch (error) {
    console.error('Location fetch error:', error);
    return 'Unknown';
  }
}

function getWeatherIcon(weatherCode) {
  return weatherCodeMap[weatherCode] || '🌡️';
}

function getWeatherDescription(weatherCode) {
  return weatherDescriptionMap[weatherCode] || 'Unknown';
}

function renderWeather(weatherData, locationName) {
  const widget = document.getElementById('weather-widget');
  const temp = Math.round(weatherData.temperature_2m);
  const condition = getWeatherDescription(weatherData.weather_code);
  const icon = getWeatherIcon(weatherData.weather_code);

  widget.innerHTML = `
    <div class="weather-content">
      <div class="weather-temp">${temp}°</div>
      <div class="weather-details">
        <div class="weather-condition">${condition}</div>
        <div class="weather-location">${locationName}</div>
      </div>
      <div class="weather-icon">${icon}</div>
    </div>
  `;
}

function renderError(message) {
  const widget = document.getElementById('weather-widget');
  widget.innerHTML = `
    <div class="weather-error">
      <p>Unable to load weather</p>
      <p style="font-size: 12px; margin-top: 8px;">${message}</p>
    </div>
  `;
}

function initWeatherWidget() {
  const widget = document.getElementById('weather-widget');
  
  if (!navigator.geolocation) {
    renderError('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeather(latitude, longitude);
        const locationName = await fetchLocationName(latitude, longitude);
        renderWeather(weatherData, locationName);
      } catch (error) {
        renderError('Failed to fetch weather data');
      }
    },
    (error) => {
      let message = 'Permission denied';
      if (error.code === error.TIMEOUT) {
        message = 'Location request timed out';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Location unavailable';
      }
      renderError(message);
    }
  );
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initWeatherWidget);
