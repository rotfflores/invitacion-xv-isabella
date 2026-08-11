const targetDate = new Date("2026-11-14T18:00:00-06:00");

function updateCountdown() {
  const distance = Math.max(0, targetDate.getTime() - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };

  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(id === "days" ? 3 : 2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

// Elegant ambient movement and reading progress.
const hero = document.querySelector(".hero");
["✦", "·", "✧", "✦", "·", "✧", "✦"].forEach((symbol, index) => {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.textContent = symbol;
  sparkle.style.left = `${8 + ((index * 14) % 88)}%`;
  sparkle.style.top = `${18 + ((index * 19) % 68)}%`;
  sparkle.style.setProperty("--duration", `${5 + (index % 4)}s`);
  sparkle.style.setProperty("--delay", `${index * -.8}s`);
  hero.appendChild(sparkle);
});

window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.getElementById("scrollProgress").style.width = `${progress}%`;
}, { passive: true });

// QR generated entirely in the browser; the phone number is not sent to a QR service.
const whatsappUrl = "https://wa.me/526182051723?text=Hola%2C%20quiero%20unirme%20al%20grupo%20para%20compartir%20las%20fotos%20de%20los%20XV%20de%20Isabella.";
new QRCode(document.getElementById("photoQr"), {
  text: whatsappUrl,
  width: 420,
  height: 420,
  colorDark: "#312a28",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H,
});

// Forecast app: Open-Meteo supports this request once the event enters its forecast window.
const EVENT_DATE = "2026-11-14";
const eventDay = new Date(`${EVENT_DATE}T12:00:00-06:00`);
const daysUntilEvent = Math.ceil((eventDay - new Date()) / 86400000);
const weatherStatus = document.getElementById("weatherStatus");
const forecastBadge = document.getElementById("forecastBadge");

const weatherDescriptions = {
  0: ["Despejado", "☀"], 1: ["Mayormente despejado", "◐"], 2: ["Parcialmente nublado", "◐"],
  3: ["Nublado", "☁"], 45: ["Con niebla", "≋"], 48: ["Con niebla", "≋"],
  51: ["Llovizna ligera", "☂"], 53: ["Llovizna", "☂"], 55: ["Llovizna intensa", "☂"],
  61: ["Lluvia ligera", "☂"], 63: ["Lluvia", "☂"], 65: ["Lluvia intensa", "☂"],
  80: ["Chubascos", "☂"], 81: ["Chubascos", "☂"], 82: ["Chubascos fuertes", "☂"],
  95: ["Tormentas", "ϟ"], 96: ["Tormentas", "ϟ"], 99: ["Tormentas", "ϟ"],
};

async function loadEventWeather() {
  if (daysUntilEvent > 16) {
    const activationDate = new Date(eventDay);
    activationDate.setDate(activationDate.getDate() - 16);
    weatherStatus.textContent = `El pronóstico diario aún no está disponible. Esta aplicación comenzará a consultarlo automáticamente desde el ${activationDate.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}.`;
    forecastBadge.textContent = "Recomendación estacional";
    return;
  }

  if (daysUntilEvent < -1) {
    weatherStatus.textContent = "El evento ya se realizó. Gracias por haber celebrado con nosotros.";
    forecastBadge.textContent = "Evento finalizado";
    return;
  }

  try {
    const params = new URLSearchParams({
      latitude: "19.4333", longitude: "-99.1333", timezone: "America/Mexico_City",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      start_date: EVENT_DATE, end_date: EVENT_DATE,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error("Pronóstico no disponible");
    const data = await response.json();
    const code = data.daily.weather_code[0];
    const [description, icon] = weatherDescriptions[code] || ["Condiciones variables", "◐"];
    const max = Math.round(data.daily.temperature_2m_max[0]);
    const min = Math.round(data.daily.temperature_2m_min[0]);
    const rain = Math.round(data.daily.precipitation_probability_max[0]);
    document.getElementById("weatherTitle").textContent = description;
    document.getElementById("weatherIcon").textContent = icon;
    document.getElementById("tempMax").textContent = `${max}°`;
    document.getElementById("tempMin").textContent = `${min}°`;
    document.getElementById("rainChance").textContent = `${rain}%`;
    document.getElementById("forecastValues").hidden = false;
    weatherStatus.textContent = "Pronóstico para el 14 de noviembre, actualizado automáticamente.";
    forecastBadge.textContent = "Pronóstico disponible";
    document.getElementById("recTemperature").textContent = min <= 14 ? "La noche será fresca. Lleva un chal o saco para mantenerte cómoda." : "Se espera una noche templada; una capa ligera será suficiente.";
    document.getElementById("recRain").textContent = rain >= 35 ? "Hay posibilidad de lluvia. Lleva paraguas y considera calzado resistente al agua." : "La probabilidad de lluvia es baja, pero revisa esta sección nuevamente antes de salir.";
  } catch (error) {
    weatherStatus.textContent = "No pudimos consultar el pronóstico en este momento. Intentaremos de nuevo cuando vuelvas a abrir la invitación.";
    forecastBadge.textContent = "Actualización pendiente";
  }
}

loadEventWeather();
