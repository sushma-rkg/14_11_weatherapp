const NOT_FOUND_MESSAGE = "We couldn't find that city. Please check the spelling and try again.";
const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";

module.exports = async function handler(req, res) {
  const city = String(req.query.city || "").trim();

  if (!city || city.length > 100) {
    return res.status(404).json({ error: NOT_FOUND_MESSAGE });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
  }

  try {
    const url =
      "https://api.weatherapi.com/v1/current.json?key=" +
      encodeURIComponent(apiKey) +
      "&q=" +
      encodeURIComponent(city);

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    if (data.error) {
      // 1003 = no city given, 1006 = city not found
      if (data.error.code === 1003 || data.error.code === 1006) {
        return res.status(404).json({ error: NOT_FOUND_MESSAGE });
      }
      return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
    }

    const icon = data.current.condition.icon;

    return res.status(200).json({
      city: data.location.name,
      country: data.location.country,
      localTime: data.location.localtime,
      description: data.current.condition.text,
      icon: icon.startsWith("//") ? "https:" + icon : icon,
      temperatureC: data.current.temp_c,
      feelsLikeC: data.current.feelslike_c,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      windDirection: data.current.wind_dir,
    });
  } catch (error) {
    return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
  }
};
