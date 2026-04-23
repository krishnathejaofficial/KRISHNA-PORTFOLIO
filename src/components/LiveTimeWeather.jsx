import { useState, useEffect } from 'react';

export default function LiveTimeWeather() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather based on geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Free Open-Meteo API (No API key required)
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            if (!res.ok) throw new Error('Weather fetch failed');
            const data = await res.json();
            setWeather(data.current_weather);
            setLoadingWeather(false);
          } catch (err) {
            console.error(err);
            setWeatherError(true);
            setLoadingWeather(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setWeatherError(true);
          setLoadingWeather(false);
        }
      );
    } else {
      setWeatherError(true);
      setLoadingWeather(false);
    }
  }, []);

  // Format time (e.g., "10:30:45 AM")
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Map Open-Meteo weather codes to icons
  const getWeatherIcon = (code) => {
    if (code === undefined || code === null) return 'fa-cloud';
    if (code === 0) return 'fa-sun'; // Clear
    if (code >= 1 && code <= 3) return 'fa-cloud-sun'; // Partly cloudy
    if (code >= 45 && code <= 48) return 'fa-smog'; // Fog
    if (code >= 51 && code <= 67) return 'fa-cloud-rain'; // Rain/Drizzle
    if (code >= 71 && code <= 77) return 'fa-snowflake'; // Snow
    if (code >= 80 && code <= 82) return 'fa-cloud-showers-heavy'; // Showers
    if (code >= 95) return 'fa-bolt'; // Thunderstorm
    return 'fa-cloud';
  };

  return (
    <div className="live-time-weather">
      <div className="ltw-time">
        <i className="far fa-clock"></i> {timeString}
      </div>
      <div className="ltw-divider"></div>
      <div className="ltw-weather">
        {loadingWeather ? (
          <span className="ltw-loading"><i className="fas fa-circle-notch fa-spin"></i></span>
        ) : weatherError || !weather ? (
          <span className="ltw-error" title="Location access denied or unavailable"><i className="fas fa-map-marker-alt ltw-slash"></i></span>
        ) : (
          <span title="Current local weather">
            <i className={`fas ${getWeatherIcon(weather.weathercode)}`}></i> {Math.round(weather.temperature)}°C
          </span>
        )}
      </div>
    </div>
  );
}
