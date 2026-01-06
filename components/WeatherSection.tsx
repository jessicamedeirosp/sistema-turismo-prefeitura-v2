interface WeatherData {
  temperature_2m: number
  relative_humidity_2m: number
  weather_code: number
  wind_speed_10m: number
}

interface WeatherSectionProps {
  weather: WeatherData | null
}

export default function WeatherSection({ weather }: WeatherSectionProps) {
  const getWeatherDescription = (code: number) => {
    if (code === 0) return { text: 'Ensolarado', emoji: '☀️', good: true }
    if (code <= 3) return { text: 'Parcialmente Nublado', emoji: '⛅', good: true }
    if (code <= 48) return { text: 'Nublado', emoji: '☁️', good: false }
    if (code <= 67) return { text: 'Chuva', emoji: '🌧️', good: false }
    if (code <= 77) return { text: 'Neve', emoji: '❄️', good: false }
    if (code <= 99) return { text: 'Tempestade', emoji: '⛈️', good: false }
    return { text: 'Bom tempo', emoji: '☀️', good: true }
  }

  if (!weather) return null

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400">
      <div className="container mx-auto px-4">
        <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="text-center">
              <div className="text-8xl mb-4">{getWeatherDescription(weather.weather_code).emoji}</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {getWeatherDescription(weather.weather_code).text}
              </h3>
              <p className="text-white/80 text-sm">Condição atual em São Sebastião</p>
            </div>
            <div className="text-center">
              <div className="text-7xl font-bold text-white mb-2">{Math.round(weather.temperature_2m)}°C</div>
              <p className="text-white/90 text-lg">Temperatura</p>
            </div>
            <div className="text-center space-y-4">
              <div>
                <div className="text-4xl font-bold text-white">{weather.relative_humidity_2m}%</div>
                <p className="text-white/90 text-sm">Umidade</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">{Math.round(weather.wind_speed_10m)} km/h</div>
                <p className="text-white/90 text-sm">Vento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
