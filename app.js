function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    this.cityInput = document.getElementById('city-input');
    this.searchBtn = document.getElementById('search-btn');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

/* ======================
   Init Method
====================== */

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        'click',
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });
};

/* ======================
   Handle Search
====================== */

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }

    if (city.length < 2) {
        this.showError('City name too short.');
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};

/* ======================
   Get Weather + Forecast
====================== */

WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error(error);

        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
        this.cityInput.focus();
    }
};

/* ======================
   Get Forecast
====================== */

WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

/* ======================
   Display Current Weather
====================== */

WeatherApp.prototype.displayWeather = function (data) {
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

    this.weatherDisplay.innerHTML = weatherHTML;
};

/* ======================
   Process Forecast Data
====================== */

WeatherApp.prototype.processForecastData = function (data) {
    const daily = data.list.filter(item =>
        item.dt_txt.includes('12:00:00')
    );

    return daily.slice(0, 5);
};

/* ======================
   Display Forecast
====================== */

WeatherApp.prototype.displayForecast = function (data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        return `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
                     class="forecast-icon">
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <div class="forecast-desc">${day.weather[0].description}</div>
            </div>
        `;
    }).join('');

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
};

/* ======================
   Loading State
====================== */

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
};

/* ======================
   Error Handling
====================== */

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
};

/* ======================
   Create App Instance
====================== */

const app = new WeatherApp('1245acf8ed4d3ea9439c175c68093bd0');