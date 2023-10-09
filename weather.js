
function init() {
    const btnDisplay = document.getElementById("btnDisplay")
    const textinputLocation = document.getElementById("inputLocation")

    btnDisplay.addEventListener("click", function() {
        let cityName = textinputLocation.value
        // Could add a function to check if the city name is valid using https://www.prevision-meteo.ch/services/json/list-cities
        requestWeather(cityName)
    })
}

async function requestWeather(cityName) {

    let ans = await fetch("https://www.prevision-meteo.ch/services/json/" + cityName)
    if(!ans.ok) {
        console.log("fack")
    }
    let data = await ans.json()
    console.log(data.current_condition.tmp)

    displayWeatherDiv(data)
}

function displayWeatherDiv(data) {
    const dataDiv = document.getElementById("data")
    const textCity = document.getElementById("textCity")
    const dayText = document.getElementById("textDay")
    dataDiv.hidden = false;
    textCity.innerHTML = "Voici la méteo de " + data.city_info.name
    dayText.innerHTML = "J1"
    fullfillDiv(data)
}

function fullfillDiv(data) {

}



init()