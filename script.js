const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const message = document.getElementById("message");
const result = document.getElementById("result");

const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Turns "2026-11-14 10:42" into "Sat 14 Nov, 10:42"
function formatLocalTime(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})$/.exec(text);
  if (!match) {
    return text;
  }
  const [, year, month, day, hour, minute] = match.map(Number);
  const weekday = DAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return weekday + " " + day + " " + MONTHS[month - 1] + ", " + String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
}

function showMessage(text) {
  result.hidden = true;
  message.textContent = text;
  message.hidden = false;
}

function showWeather(data) {
  message.hidden = true;
  document.getElementById("place").textContent = data.city + ", " + data.country;
  document.getElementById("time").textContent = formatLocalTime(data.localTime);
  const icon = document.getElementById("icon");
  icon.src = data.icon;
  icon.alt = data.description;
  document.getElementById("temp").textContent = Math.round(data.temperatureC) + "°C";
  document.getElementById("desc").textContent = data.description;
  document.getElementById("feels").textContent = Math.round(data.feelsLikeC) + "°C";
  document.getElementById("humidity").textContent = data.humidity + "%";
  document.getElementById("wind").textContent = Math.round(data.windKph) + " km/h " + data.windDirection;
  result.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch("/api/weather?city=" + encodeURIComponent(input.value));
    const data = await response.json();
    if (response.ok) {
      showWeather(data);
    } else {
      showMessage(data.error);
    }
  } catch (error) {
    showMessage(UNAVAILABLE_MESSAGE);
  }
});
