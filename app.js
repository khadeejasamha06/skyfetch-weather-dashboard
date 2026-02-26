const API_KEY = '1245acf8ed4d3ea9439c175c68093bd0';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');

/* ======================
   Async Weather Function
====================== */

async function getWeather(city) {
    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {
        console.error(error);

        if (error.response && error.response.status === 404) {
            showError('City not found. Please check spelling.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
        cityInput.focus();
    }
}

/* ======================
   Display Weather
====================== */

function displayWeather(data) {
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
                 alt="${data.weather[0].description}"
                 class="weather-icon">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `;

    weatherDisplay.innerHTML = weatherHTML;
}

/* ======================
   Loading State
====================== */

function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
}

/* ======================
   Error Handling
====================== */

function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

/* ======================
   Event Listeners
====================== */

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    if (city.length < 2) {
        showError('City name too short.');
        return;
    }

    getWeather(city);
    cityInput.value = '';
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});