var city = $(".city");
var wind = $(".wind");
var humidity = $(".humidity");
var temp = $(".temp");

// Create an array for search items to go to
let searchArr = [];
let APIKey = "&appid=99ec80a16e351615c5026d1ba095cfb8";

// Create page render function
$(document).ready(function () {
    renderSearchList();

    $("#searchBtn").click(function (event) {
        event.preventDefault();
        let searchTerm = $("#search").val().trim();
        startSearch(searchTerm);
    })

    function startSearch(citySearch) {
        // QueryURL key
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            citySearch + APIKey;

        $("<button>").text(citySearch).prepend(".list-group-item");
        //AJAX to obtain weather
        $.ajax({
            type: "GET",
            url: queryURL
        }).then(function (response) {
            let previousCity = JSON.parse(localStorage.getItem("cities"));
            if (previousCity) {
                previousCity.push(response.name);
                localStorage.setItem("cities", JSON.stringify(previousCity));
            } else {
                searchArr.push(response.name)
                localStorage.setItem("cities", JSON.stringify(searchArr));
            }
        //    code to transfer to HTML
            let cityName = $(".jumbotron").addClass("city-weather").text(citySearch);
            let currentDate = moment().format("  MM-DD-YYYY");
            let windData = $("<p>").text("Wind Speed: " + response.wind.speed).addClass("main");
            let humidityData = $("<p>").text("Humidity: " + response.main.humidity + "%").addClass("main");
            var iconcode = response.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
            let weatherImg = $("<img>").attr("src", iconurl);
            let date = $("<p>").text(moment.unix().format("MMM Do YY")).addClass("main");
            $("#five-day").empty();
            // Convert the temp to Celsius
            let tempC = (response.main.temp - 273.15)
            let roundedTemp = Math.floor(tempC);

            // Add temperature data to HTML
            let tempData = $("<p>").text("Temp (K): " + response.main.temp + "°").addClass("main");
            let tempDataC = $("<p>").text("Temp (C): " + roundedTemp + "°").addClass("main");

            //Append items together
            cityName.append(weatherImg, currentDate, windData, humidityData, tempData, tempDataC);
            $("container").append(cityName);

            //AJAX to obtain UV data
            let latitude = response.coord.lat;
            let longitude = response.coord.lon;
            let uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?" + APIKey + "&lat=" + latitude + "&lon=" + longitude;
            $.ajax({
                type: "GET",
                url: uvIndexURL,
            }).then(function (responseUV) {
                let currentUV = $("<div>").addClass('main uv-index').text("UV Index: ");
                let uvValue = $("<span class='badge id='current-uv-level'>").text(responseUV.value);
                currentUV.append(uvValue);
                if (responseUV.value >= 0 && responseUV.value < 3) {
                    $(uvValue).addClass("green");
                } else if (responseUV.value >= 3 && responseUV.value < 6) {
                    $(uvValue).addClass("yellow");
                } else if (responseUV.value >= 6 && responseUV.value < 8) {
                    $(uvValue).addClass("orange");
                } else if (responseUV.value >= 8 && responseUV.value < 11) {
                    $(uvValue).addClass("red");
                } else if (responseUV.value >= 11) {
                    $(uvValue).addClass("purple");
                }
                cityName.append(currentUV);
                renderSearchList();
            })

            //start 5 day forecast ajax
            let day5QueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric" + APIKey;

            for (let i = 1; i < 6; i++) {
                $.ajax({
                    url: day5QueryURL,
                    type: "GET"
                }).then(function (response5Day) {
                    let cardbodyElem = $("<div>").addClass("card-body");

                    let fiveDayCard = $("<div>").addClass(".cardbody");
                    let fiveDate = $("<h5>").text(moment.unix(response5Day.daily[i].dt).format("MM/DD/YYYY"));
                    fiveDayCard.addClass("headline");

                    let fiveDayTemp = $("<p>").text("Temp: " + response5Day.daily[i].temp.max + "°");
                    fiveDayTemp.attr("id", "#fiveDayTemp[i]");

                    let fiveHumidity = $("<p>").attr("id", "humDay").text("Humidity: " + JSON.stringify(response5Day.daily[i].humidity) + "%");
                    fiveHumidity.attr("id", "#fiveHumidity[i]");

                    let iconCode = response5Day.daily[i].weather[0].icon;
                    let iconURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
                    let weatherImgDay = $("<img>").attr("src", iconURL);
                    $("#testImage").attr("src", iconURL);

                    cardbodyElem.append(fiveDate);
                    cardbodyElem.append(weatherImgDay);
                    cardbodyElem.append(fiveDayTemp);
                    cardbodyElem.append(fiveHumidity);
                    fiveDayCard.append(cardbodyElem);
                    $("#five-day").append(fiveDayCard);
                    $("#fiveDayTemp[i]").empty();
                    $(".jumbotron").append(cardbodyElem);
                })
            }
            $("#search").val("");

        })

    }
    $(document).on("click", ".city-btn", function () {
        JSON.parse(localStorage.getItem("cities"));
        let citySearch = $(this).text();
        startSearch(citySearch);
    });

    function renderSearchList() {
        let searchList = JSON.parse(localStorage.getItem("cities"));
        $("#search-list").empty();
        if (searchList) {
            for (i = 0; i < searchList.length; i++) {
                let listBtn = $("<button>").addClass("btn btn-secondary city-btn").attr('id', 'cityname_' + (i + 1)).text(searchList[i]);
                let listElem = $("<li>").attr('class', 'list-group-item');
                listElem.append(listBtn);
                $("#search-list").append(listElem);
            }

        }

    }

})