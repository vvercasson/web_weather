let currentDay = 0

function init() {
    // Getting the elements
    const btnDisplay = document.getElementById("btnDisplay")
    const textinputLocation = document.getElementById("inputLocation")
    const btnPrevious = document.getElementById("btnPrevious")
    const btnNext = document.getElementById("btnNext")
    const hourDisplay = document.getElementById("hourDisplay")
    const timeSlider = document.getElementById('timeSlider')
    const selectedTime = document.getElementById('selectedTime')

    // Handling the map
    map = L.map('map').setView([44.837789, -0.57918], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on('click', function(e) {
        console.log("Clicked on map on " + e.latlng.toString())
        requestWeatherByMap(e.latlng.lat, e.latlng.lng)
    });


    // Setting the events listeners
    btnDisplay.addEventListener("click", function() {
        let cityName = textinputLocation.value
        try {
            checkCityName(cityName)
                .then(result => {
                    if (result) {
                        requestWeather(cityName)
                    } else {
                        console.log("City name check failed.")
                    }
                })
                .catch(err => {
                    console.error(err)
                })
        } catch (err) {
            console.error(err)
        }
    })

    btnPrevious.addEventListener("click", loadPreviousDay)

    btnNext.addEventListener("click", loadNextDay)

    timeSlider.addEventListener('input', () => {
        console.log("Hour changed")
        hourDisplay.hidden = false
        selectedTime.textContent = `Heure : ${timeSlider.value}h`
        checkWeatheHourly(hourlyData, currentDay, timeSlider.value)
    })
}

// Check if the city name exists in the API
async function checkCityName(cityName) {
    if (cityName === "") {
        alert("Veuillez entrer un nom de ville")
        return false
    }

    //FIXME: CORS policy me deteste
    // try {
    //     let citiesJson = await fetch("https://www.prevision-meteo.ch/services/json/list-cities", { method: "GET" })
    //     if (!citiesJson.ok) {
    //         console.log("Fetch didn't work correctly ")
    //         return false
    //     }
    //     let cities = await citiesJson.json()
        
    //     // Check if the cityName exists in the list of cities
    //     for (let i = 0; i < cities.length; i++) {
    //         if (cities[i].name.toLowerCase() === cityName.toLowerCase()) {
    //             return true
    //         }
    //     }

    //     alert("Cette ville n'existe pas dans l'API utilisée")
    //     return false
    // } catch (error) {
    //     console.error(error)
    //     return false
    // }

    return true
}

// Load the next day
function loadNextDay(data) {
    if(currentDay == 3) {
        const btnNext = document.getElementById("btnNext")
        btnNext.disabled = true
    }
    const btnPrevious = document.getElementById("btnPrevious")
    btnPrevious.disabled = false

    currentDay++
    fullfillDiv(currentDay)
    console.log("Loading next day" + currentDay)
}

// Load the previous day using the map
function loadPreviousDay(data) {
    if(currentDay == 1) {
        const btnPrevious = document.getElementById("btnPrevious")
        btnPrevious.disabled = true
    }
    const btnNext = document.getElementById("btnNext")
    btnNext.disabled = false

    currentDay--
    fullfillDiv(currentDay)
    console.log("Loading previous day" + currentDay)
}

// Request the weather for a specific location
async function requestWeatherByMap(lat, lng) {
    console.log("Requesting weather for " + lat.toFixed(2) + " " + lng.toFixed(2))
    let ans = await fetch("https://www.prevision-meteo.ch/services/json/lat=" + lat.toFixed(2) + "lng=" + lng.toFixed(2))   
    let data = await ans.json()
    console.log(data)

    if(data.errors) {
        console.log("City name not prout")
        alert("Erreur lors de la requête, verifiez le nom de la ville")
        const dataDiv = document.getElementById("data")
        dataDiv.hidden = true
        return
    }

    forecastData = [data.fcst_day_0, data.fcst_day_1, data.fcst_day_2, data.fcst_day_3, data.fcst_day_4]
    hourlyData = [forecastData[0].hourly_data, forecastData[1].hourly_data, forecastData[2].hourly_data, forecastData[3].hourly_data, forecastData[4].hourly_data]
    
    displayWeatherDiv(data)
}

// Request the weather for a specific location using the text input
async function requestWeather(cityName) {
    let ans = await fetch("https://www.prevision-meteo.ch/services/json/" + cityName)   
    let data = await ans.json()
    console.log(data)

    map.flyTo([data.city_info.latitude, data.city_info.longitude], 13)

    if(data.errors) {
        console.log("City name not found")
        alert("Erreur lors de la requête, verifiez le nom de la ville")
        const dataDiv = document.getElementById("data")
        dataDiv.hidden = true
        return
    }

    forecastData = [data.fcst_day_0, data.fcst_day_1, data.fcst_day_2, data.fcst_day_3, data.fcst_day_4]
    hourlyData = [forecastData[0].hourly_data, forecastData[1].hourly_data, forecastData[2].hourly_data, forecastData[3].hourly_data, forecastData[4].hourly_data]
    
    displayWeatherDiv(data)
}

// Display the weather div in HTML and set the city name
function displayWeatherDiv(data) {
    const dataDiv = document.getElementById("data")
    const textCity = document.getElementById("textCity")

    dataDiv.hidden = false
    textCity.innerHTML = "Voici la méteo de " + data.city_info.name
    fullfillDiv(0)
}

// Fill the weather div with the data
function fullfillDiv(day) {
    const dayText = document.getElementById("textDay")
    const minTemp = document.getElementById("minTemp")
    const maxTemp = document.getElementById("maxTemp")
    const imgWeather = document.getElementById("imgWeather")
    const humidity = document.getElementById("humidity")

    if (day >= 0 && day < forecastData.length) {
        const dataSrc = forecastData[day]
        dayText.innerHTML = dataSrc.day_long
        minTemp.innerHTML = "min:" + dataSrc.tmin + "°C"
        maxTemp.innerHTML = "max:" + dataSrc.tmax + "°C"
        humidity.innerHTML = "Humidité: " + dataSrc.rh + "%"
        imgWeather.src = dataSrc.icon_big
    } else {
        console.log("Jour invalide")
    }
}

// Check the weather for a specific hour
function checkWeatheHourly(data, day, hour) {
    const hourTemp = document.getElementById("hourTemp")
    const hourWeather = document.getElementById("hourWeather")

    if (day >= 0 && day < forecastData.length) {
        hourTemp.innerHTML = data[day][hour + "H00"].TMP2m + "°C"
        hourWeather.src = data[day][hour + "H00"].ICON
        return
    }
}

init()