$(document).ready(function () {

    // On click make search of city
    $('#getEnteredCityWeather,#past-searches').on('click', function () {
        let clickEvent = $(event.target)[0];
        let location = "";
        if (clickEvent.id === "getEnteredCityWeather") {
            location = $('#cityEntered').val().trim().toUpperCase();
        } else if ( clickEvent.className === ("cityList") ) {
            location = clickEvent.innerText;
        }
        if (location == "") return;

          // updates local storage with city search made by user
        updateLocalStorage (location);
        
          // get current weather for searched location
        getCurrentWeather(location);
        
          // get forecast for searched location
        getWeatherForecast(location);
        });
      // Convert Unix timestamp to MMM DD, YYYY 
    function convertDate(UNIXtimestamp) {
        let convertedDate = "";
        let a = new Date(UNIXtimestamp * 1000);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        convertedDate = month + ' ' + date + ', '+ year;
        return convertedDate;
    }
    function updateLocalStorage(location) {
         // updates City in local storage
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        cityList.push(location); 
        cityList.sort();
         // removes city from saved search if it has already been searched for
        for (let i=1; i<cityList.length; i++) {
            if (cityList[i] === cityList[i-1]) cityList.splice(i,1);
        }
         //stores in local storage
        localStorage.setItem('cityList', JSON.stringify(cityList));
        $('#cityEntered').val("");
    }

      // Get current user location
    function establishCurrLocation() {
        
        // set location to null
        let location = {};
        
          // get longitude and latitude
        function success(position) {
            location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
            }
        
            // Get current conditions for current location
            getCurrentWeather(location);
        
            // Get forecast for local conditions 
            getWeatherForecast(location);
        }
        function error() {
            location = { success: false }
            return location;
        }
        
          // console.log if browswer doesn't support location
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
        }

      // Get weather from user's current location
    function getCurrentWeather(loc) {
        
          // pull city history from local memory
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
          //div for each history location
        $('#past-searches').empty();
        cityList.forEach ( function (city) {  
            let cityHistoryNameDiv = $('<div>');      
            cityHistoryNameDiv.addClass("cityList");         
            cityHistoryNameDiv.attr("value",city);
            cityHistoryNameDiv.text(city);
            $('#past-searches').append(cityHistoryNameDiv);
        });      
          // reset search value to null
        $('#city-search').val("");
        
          // determine if search is based upon city name or lat/lon
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            city = `q=${loc}`;
        }
        
          // Set up Open Weather API Query - weather request 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "0705643b94243fe1abda1ba9766f538a";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;
        
          // Open weather API query - weather request
        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
        
            // load result into weatherObj
        weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: Math.round(response1.main.temp),
        
            // convert date to usable format [1] = MM/DD/YYYY Format
            date: (convertDate(response1.dt)),
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        }
            // remove the current forecast
            $('#forecast').empty(); 
            // render the current search city
            $('#cityName').text(weatherObj.city + " (" + weatherObj.date + ")");
            // render the current search city weather icon
            $('#currWeathIcn').attr("src", weatherObj.icon);
            // render the current search city temp
            $('#currTemp').text("Temperature: " + weatherObj.temp + " " +  "°F");
            // render the current search city humidity
            $('#currHum').text("Humidity: " + weatherObj.humidity + "%");
            // render current city search wind speed
            $('#currWind').text("Windspeed: " + weatherObj.wind + " MPH");      
        
          // get UVI from open weather 
        city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;
          // Initiate API Call to get current weather
        var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
        var apiIdURL = "?appid="
        var apiKey = "0705643b94243fe1abda1ba9766f538a";
        var cityName = city;
        var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;
          // open weather call. UVI request
        $.ajax({
            url: openUviWeatherAPI,
            method: "GET"
        }).then(function(response3) {
              // load respone into UviLevel variable
            let UviLevel = parseFloat(response3.value);
            
              // initiate background as violet
            let backgrdColor = 'violet';        
              // determine backgrouind color depending on value
            if (UviLevel < 3) {backgrdColor = 'green';} 
                else if (UviLevel < 6) { backgrdColor = 'yellow';} 
                else if (UviLevel < 8) { backgrdColor = 'orange';} 
                else if (UviLevel < 11) {backgrdColor = 'red';}     
              // insert UVI Label and value into HTML
            let uviTitle = '<span>UV Index: </span>';
            let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
            $('#currUVI').html(color);            
            });
        });
    }
      // get weather forecast for selected city
    function getWeatherForecast(loc) {

          // determining the type of request.. if an object, we have lat/lon, use it
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;      
          // else call api using city name 
        } else {
            city = `q=${loc}`; }
        
          // Set up Open Weather API Query - weather request 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "0705643b94243fe1abda1ba9766f538a";
        var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;
          // Open weather API query - weather request
        $.ajax({
            url: openCurrWeatherAPI2,
            method: "GET",
        }).then(function (response4) {

          // capture lat/lon for subsequent request
        var cityLon = response4.coord.lon;
        var cityLat = response4.coord.lat;
        
          // set city with lat/long
        city = `lat=${cityLat}&lon=${cityLon}`;
        
          // Get five days of weather history using longitude and latitude
        let weatherArr = [];
        let weatherObj = {};

          // Initiate API Call to get current weather... use onecall request
        var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
        var cityName = city;
        
        var exclHrlURL = "&exclude=hourly";
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid=";
        var apiKey = "0705643b94243fe1abda1ba9766f538a";
        var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;

          // Open weather api
        $.ajax({
            url: openFcstWeatherAPI,
            method: "GET"
        }).then(function (response2) {
            for (let i=1; i < (response2.daily.length-2); i++) {
            let cur = response2.daily[i]
            weatherObj = {
                weather: cur.weather[0].description,
                icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                minTemp: Math.round(cur.temp.min),
                maxTemp: Math.round(cur.temp.max),
                humidity: cur.humidity,
                uvi: cur.uvi,
                date: (convertDate(cur.dt))
            }
              // push day to weatherArr
            weatherArr.push(weatherObj);
            }
            // renders forecast on page
            for (let i = 0; i < weatherArr.length; i++) {
            let $colmx1 = $('<div class="col mx-1">');
            let $cardBody = $('<div class="card-body forecast-card">');
            let $cardTitle = $('<h6 class="card-title">');
            
            $cardTitle.text(weatherArr[i].date);
              // format HTML UL Tag
            let $ul = $('<ul>'); 
              // format HTML LI Tags
            let $iconLi = $('<li>');
            let $iconI = $('<img>');
            let $weathLi = $('<li>');
            let $tempMaxLi = $('<li>');
            let $tempMinLi = $('<li>');
            let $humLi = $('<li>');
              // format html values
            $iconI.attr('src', weatherArr[i].icon);
            $weathLi.text(weatherArr[i].weather);                
            $tempMaxLi.text('Temp High: ' + weatherArr[i].maxTemp + " °F");
            $tempMinLi.text('Temp Low: ' + weatherArr[i].minTemp + " °F");
            $humLi.text('Humidity: ' + weatherArr[i].humidity + "%");
              // append HTML
            $iconLi.append($iconI);
            $ul.append($iconLi);
            $ul.append($weathLi);         
            $ul.append($tempMaxLi);
            $ul.append($tempMinLi);
            $ul.append($humLi);
            $cardTitle.append($ul);
            $cardBody.append($cardTitle);
            $colmx1.append($cardBody);
            $('#forecast').append($colmx1);
            }
        });
        });        
    }
      // will get location when page initializes
    var location = establishCurrLocation();
    });