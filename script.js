// Dette er adressen til vær-API-et og din personlige nøkkel
let url = 'https://api.openweathermap.org/data/2.5/weather';
let apiKey = '5c7bb2b7d446a70ee1086e6e1f7dc03d';

// Når nettsiden er ferdig lastet, vis været for Oslo
$(document).ready(function () {
    weatherFn('Oslo');           // Viser dagens vær
    showThreeDaysForecast('Oslo'); // Viser vær for de neste tre dagene
});

// Funksjon som henter og viser dagens vær for en by
async function weatherFn(cName) {
    // Lager en adresse til API-et med valgt by og norsk språk
    let fullUrl = url + '?q=' + cName + '&appid=' + apiKey + '&units=metric&lang=no';

    try {
        // Henter data fra internett
        let response = await fetch(fullUrl);
        let data = await response.json();

        if (response.ok) {
            weatherShowFn(data);            // Viser værdata på nettsiden
            showThreeDaysForecast(cName);   // Oppdaterer også 3-dagersvarsel




            
            // Fetch UV index from new API
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let uvIndex = await getUVIndex(lat, lon);
            showUVIndex(uvIndex); // You can reuse your existing showUVIndex function







        } else {
            alert('Fant ikke byen. Sjekk skrivemåten og prøv igjen.');
        }
    } catch (error) {
        console.error('Noe gikk galt under henting av værdata:', error);
    }
}







function weatherShowFn(data) {
    moment.locale('nb'); // Setter norsk datoformat

    // Viser informasjonen i de riktige HTML-elementene
    document.querySelector('#city-name').textContent = data.name;

    // Vis landkode etter bynavnet (for eksempel: Oslo, NO)
    document.querySelector('#country').textContent = data.sys.country;

    document.querySelector('#date').textContent = moment().format('D. MMMM YYYY, HH:mm:ss') + " (GMT+2)";
    document.querySelector('#temperature').innerHTML = data.main.temp + '°C';
    document.querySelector('#description').textContent = data.weather[0].description;
    document.querySelector('#wind-speed').innerHTML = 'Vindhastighet: ' + data.wind.speed + ' m/s';

    // Henter værikon fra OpenWeather
    document.querySelector('#weather-icon').src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';

    // Viser vær-informasjonen
    document.querySelector('#weather-info').style.display = "block";

    // Henter værvarsel for de neste timene
    weatherForecastFn(data.name);
}







// Funksjon som viser værmelding for de neste timene (neste 9 timer)
async function weatherForecastFn(city) {
    let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey + '&units=metric&lang=no';

    try {
        let response = await fetch(forecastUrl);
        let data = await response.json();

        if (response.ok) {
            let html = '<h3>Værvarsel neste timer:</h3>';

            // Henter de tre første tidspunktene (neste 9 timer)
            for (let i = 0; i < 3; i++) {
                let forecast = data.list[i];
                html = html + '<div style="margin-bottom:10px;">';
                html = html + '<strong>' + moment(forecast.dt_txt).format('D. MMM HH:mm') + '</strong><br>';
                html = html + forecast.main.temp + '°C, ' + forecast.weather[0].description;
                html = html + ' <img src="https://openweathermap.org/img/wn/' + forecast.weather[0].icon + '@2x.png" style="vertical-align:middle;" />';
                html = html + '</div>';
            }

            document.querySelector('#forecast').innerHTML = html; // Vis varselet
                    } else {
                        document.querySelector('#forecast').innerHTML = 'Fant ikke værvarsel.';
                }
            } catch (error) {
                document.querySelector('#forecast').innerHTML = 'Feil ved henting av værvarsel.';
            }
}









// Funksjon som henter det klokkeslettet brukeren har valgt
function hentKlokkeslett() {
    let valgtKlokkeslett = document.getElementById('klokkeslett').value;
    if (valgtKlokkeslett === '00:00') {
        return '00';
    } else if (valgtKlokkeslett === '03:00') {
        return '03';
    } else if (valgtKlokkeslett === '06:00') {
        return '06';
    } else if (valgtKlokkeslett === '09:00') {
        return '09';
    } else if (valgtKlokkeslett === '12:00') {
        return '12';
    } else if (valgtKlokkeslett === '15:00') {
        return '15';
    } else if (valgtKlokkeslett === '18:00') {
        return '18';
    } else if (valgtKlokkeslett === '21:00') {
        return '21';
    } else {
        return '00';
    }
}

// Funksjon som henter og viser værmelding for de neste 3 dagene på valgt klokkeslett
async function showThreeDaysForecast(city) {
    let klokkeslett = hentKlokkeslett();

    // Lager URL til API-et
    let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey + '&units=metric&lang=no';

    try {
        let response = await fetch(forecastUrl);
        let data = await response.json();

        if (response.ok) {
            moment.locale('nb');
            let today = moment().format('YYYY-MM-DD');
            let dager = [];
            // Går gjennom alle værmeldinger
            for (let i = 0; i < data.list.length; i++) {
                let forecast = data.list[i];
                let dato = forecast.dt_txt.split(' ')[0];
                let klokke = forecast.dt_txt.split(' ')[1].split(':')[0];
                // Sjekker om det er riktig klokkeslett, ikke i dag, og ikke mer enn 3 dager
                if (dato !== today && klokke === klokkeslett && dager.length < 3) {
                    dager.push(forecast);
                }
            }

            // Lager HTML-tekst
            let html = '';
            if (dager.length === 0) {
                html = 'Ingen værdata for de neste dagene.';
            } else {
                for (let i = 0; i < dager.length; i++) {
                    let forecast = dager[i];
                    html = html + '<div style="margin-bottom:10px;">';
                    html = html + '<strong>' + moment(forecast.dt_txt).format('dddd D. MMMM') + '</strong><br>';
                    html = html + forecast.main.temp + '°C, ' + forecast.weather[0].description;
                    html = html + ' <img src="https://openweathermap.org/img/wn/' + forecast.weather[0].icon + '@2x.png" style="vertical-align:middle;" />';
                    html = html + '</div>';
                }
            }
            // Viser resultatet på nettsiden
            document.getElementById('treDager').innerHTML = html;
        } else {
            document.getElementById('treDager').innerHTML = 'Fant ikke værvarsel.';
        }
    } catch (error) {
        document.getElementById('treDager').innerHTML = 'Feil ved henting av værvarsel.';
    }
}

// Her gjør at vi får ny værmelding når brukeren velger et nytt klokkeslett
let klokkeslettElement = document.getElementById('klokkeslett');

klokkeslettElement.onchange = function() {
    // Finn bynavnet fra nettsiden
    let byElement = document.getElementById('city-name');
    let bynavn = byElement.textContent;
    // Hvis det ikke står noe bynavn, bruk Oslo
    if (bynavn === "") {
        bynavn = "Oslo";
    }
    // Hent og vis vær for valgt by og klokkeslett
    showThreeDaysForecast(bynavn);
};

















// Denne funksjonen henter UV-indeks for et sted (bruker breddegrad og lengdegrad)
async function getUVIndex(latitude, longitude) {
  // Lager adressen til UV-API-et med breddegrad og lengdegrad
  let url = "https://currentuvindex.com/api/v1/uvi?latitude=" + latitude + "&longitude=" + longitude;

  try {
    // Henter data fra internett
    let response = await fetch(url);
    // Gjør om svaret til JSON (altså et objekt vi kan bruke i JavaScript)
    let data = await response.json();

    // Sjekker om vi fikk et OK svar fra API-et
    if (data.ok) {
      // Returnerer hele UV-objektet (ikke bare tallet)
      // Eksempel: { uvi: 5.6, timestamp: '2025-06-10T10:00:00Z' }
      return data.now;
    } else {
      // Hvis det var en feil, skriv ut feilmelding i konsollen
      console.error("Feil med UV-data:", data.message);
      return null;
    }
  } catch (error) {
    // Hvis det skjer en feil med fetch, skriv ut feilmelding
    console.error("Klarte ikke hente UV-data:", error);
    return null;
  }
}

// Denne funksjonen viser UV-indeks på nettsiden
function showUVIndex(uvData) {
  // Sjekker om vi har fått UV-data
  if (!uvData) {
    // Hvis ikke, skriv ut feilmelding til brukeren
    document.getElementById("uv-index").textContent = "UV-indeks data ikke tilgjengelig";
  } else {
    // Hvis vi har UV-data, hent ut tallet
    let uvValue = uvData.uvi;
    // Skriv ut UV-indeks på nettsiden
    document.getElementById("uv-index").innerHTML = "UV-indeks nå: <strong>" + uvValue + "</strong>";
  }
}