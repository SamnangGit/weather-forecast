const baseEndpoint = "http://api.openweathermap.org/";
const apiKey = "f9a5203cbf432d2c17301894dbf366bf";

// GETTING TODAY DATA

$("#fiveDaysForecast").visibility = "none";
const length = 6;
let initialCity;
let j = 0;

function defaultScreen() {
  document.getElementById("fiveDaysForecast").style.display = "none";
  document.getElementById("404Error").style.display = "none";
  document.getElementById("btnSearch").click() == true;
}

let reqCurrent = new XMLHttpRequest();
let reqHours = new XMLHttpRequest();

$("#btnSearch").click(() => {
  if ($("input").val() == "") {
    alert("Please enter a city name!!!");
    return;
  } else {
    if (initialCity != $("input").val()) {
      j = 0;
    }
    checkResponseCode();
    reqCurrent.open("GET", endpointCurrent());
    reqCurrent.onload = () => {
      bindCurrentWeatherData();
    };
    reqCurrent.send();

    // Request hourly weather data
    reqHours.open("GET", endpointHours());
    reqHours.onload = () => {
      // current forcast by hours binding
      bindHoursWeatherData();
      // five days forecast binding
      addDateDataSetAndDateID();
      BindHoursFiveDaysData();
      addDataToHourlyDiv();
    };
    reqHours.send();
  }
});

function endpointCurrent() {
  let cityName = $("input").val();
  return `${baseEndpoint}data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
}

function endpointHours() {
  let cityName = $("input").val();
  return `${baseEndpoint}data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
}

function bindCurrentWeatherData() {
  $("#date").html("<b>" + new Date().toDateString() + "</b>");
  let response = JSON.parse(reqCurrent.responseText);
  let resCode = response["cod"];
  if (resCode == "200") {
    condition = response["weather"][0]["main"];
    if (condition === "Clouds") {
      $("#iCondition").toggleClass("fa-solid fa-cloud-meatball");
    } else if (condition === "Rain") {
      $("#iCondition").toggleClass("fa-solid fa-cloud-rain");
    } else if (condition === "Clear") {
      $("#iCondition").toggleClass("fa-solid fa-sun");
    }

    let temp = response["main"]["temp"];
    let tempLike = response["main"]["feels_like"];
    let sunriseHours = String(
      convertTo12Hour(new Date(response["sys"]["sunrise"] * 1000).getHours())
    ).padStart(2, "0");
    let sunriseMinutes = String(
      new Date(response["sys"]["sunrise"] * 1000).getMinutes()
    ).padStart(2, "0");
    let sunsetHours = String(
      convertTo12Hour(new Date(response["sys"]["sunset"] * 1000).getHours())
    ).padStart(2, "0");
    let sunsetMinutes = String(
      new Date(response["sys"]["sunset"] * 1000).getMinutes()
    ).padStart(2, "0");

    let sunset;
    let sunrise;

    if (new Date(response["sys"]["sunrise"] * 1000).getHours() > 12) {
      sunrise = sunriseHours + ":" + sunriseMinutes + " PM";
      sunset = sunsetHours + ":" + sunsetMinutes + " AM";
    } else {
      sunrise = sunriseHours + ":" + sunriseMinutes + " AM";
      sunset = sunsetHours + ":" + sunsetMinutes + " PM";
    }

    let duration =
      getDuration(sunriseHours, sunsetHours, sunriseMinutes, sunsetMinutes) +
      " hrs";

    $("#lbCondition").text(condition);
    $("#lbDegree").html(Math.round(temp) + "&#8451;");
    $("#lbRealFeel").html("Real feel " + Math.round(tempLike) + "&#8451;");

    $("#lbSunrise").text(sunrise);
    $("#lbSunset").text(sunset);
    $("#lbDuration").text(duration);
  }
}

function bindHoursWeatherData() {
  let response = JSON.parse(reqHours.responseText);
  let resCode = response["cod"];
  if (resCode == "200") {
    for (i = 0; i < length; i++) {
      let hour = parseInt(
        response["list"][i]["dt_txt"].split(" ")[1].split(":")[0]
      );
      $(`#lbH${i + 1}`).text(addTimeIdentifier(hour));

      let forecast = response["list"][i]["weather"][0]["main"];
      $(`#lbForecastH${i + 1}`).text(forecast);

      if (forecast === "Clouds") {
        $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-cloud-meatball");
      } else if (forecast === "Rain") {
        $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-cloud-rain");
      } else if (forecast === "Clear") {
        $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-sun");
      }

      let temp = response["list"][i]["main"]["temp"];
      $(`#lbTempH${i + 1}`).html(Math.round(temp) + "&#8451;");

      let tempLike = response["list"][i]["main"]["feels_like"];
      $(`#lbRealFeelH${i + 1}`).html(Math.round(tempLike) + "&#8451;");

      let WindDirection = degreeToCompass(response["list"][i]["wind"]["deg"]);

      let windSpeed = Math.round(response["list"][i]["wind"]["speed"] * 3.6);
      $(`#lbWindSpeedH${i + 1}`).text(windSpeed + " " + WindDirection);
    }
  }
}

function getDuration(h1, h2, m1, m2) {
  if (m2 < m1) {
    let Hduration = 12 + (+h2 - +h1 - 1);
    let Mduration = 60 - +m1 + +m2;
    return Hduration + ":" + Mduration;
  } else if (m2 > m1) {
    let Hduration = 12 + (+h2 - +h1);
    let Mduration = +m2 - +m1;
    return (
      String(Hduration).padStart(2, "0") +
      ":" +
      String(Mduration).padStart(2, "0")
    );
  }
}

function convertTo12Hour(hour) {
  if (hour > 12) {
    return hour - 12;
  } else if (hour <= 12 && hour > 0) {
    return hour;
  } else if (hour == 0) {
    return 12;
  }
}

function addTimeIdentifier(hour) {
  if (hour > 12) {
    return hour - 12 + "pm";
  } else if (hour < 12) {
    return hour + "am";
  } else if (hour == 12) {
    return hour + "pm";
  } else if (hour == 0) {
    return hour + "am";
  }
}

function degreeToCompass(degree) {
  let val = Math.floor(degree / 22.5 + 0.5);
  let arr = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return arr[val % 16];
}

$("#btnToday").click(() => {
  document.getElementById("404Error").style.display = "none";
  $("#todayWeather").show();
  $("#nearbyPlaces").show();
  $("#fiveDaysForecast").hide();

  reqHours.open("GET", endpointHours());
  reqHours.onload = () => {
    // current forcast by hours binding
    bindHoursWeatherData();
    $("#lbFiveDaysDayofWeek").html("<b>TODAY</b>");
  };
  reqHours.send();
});

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

// 5 DAYS FORECAST

$("#btnFiveDays").click(() => {
  document.getElementById("404Error").style.display = "none";
  $("#fiveDaysForecast").show();
  $("#todayWeather").hide();
  $("#nearbyPlaces").hide();

  document.querySelectorAll(".margin-fiveDays")[2].click() == true;
});

let fiveDaysData;

let months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

let weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getMonth() {
  let month = new Date().getMonth();
  return month;
}

function getDay() {
  let day = String(new Date().getDate()).padStart(2, "0");
  return day;
}

function unixToDateTime(unix) {
  let months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  let date = new Date(unix * 1000);
  return (
    months[date.getMonth()] + " " + String(date.getDate()).padStart(2, "0")
  );
}

function checkDay(day) {
  let d = new Date();

  if (day + d.getDay() > 6) {
    return day + d.getDay() - 7;
  } else {
    return day + d.getDay();
  }
}

function addDateDataSetAndDateID() {
  for (i = 0; i < 5; i++) {
    document.getElementById("lbFiveDaysDate" + (i + 1)).innerHTML =
      weekDays[checkDay(i)];

    let today = new Date();
    today.setDate(today.getDate() + i);
    document.getElementById(
      "lbFiveDaysDate" + (i + 1)
    ).parentElement.dataset.date = today.toLocaleDateString();
    document.getElementById("lbFiveDaysDate" + (i + 1)).parentElement.id =
      today.toLocaleDateString();
  }
}

function BindHoursFiveDaysData() {
  let cityName = $("input").val();
  fetch(
    `${baseEndpoint}data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
  )
    .then((respone) => respone.json())
    .then((data) => {
      if (data.cod === "200") {
        fiveDaysData = data;

        for (i = 0; i < 5; i++) {
          let currentDay = new Date();
          currentDay.setDate(currentDay.getDate() + i);

          let tempData = getDataByDate(currentDay.toLocaleDateString());
          $("#lbFiveDaysMandD" + (i + 1)).text(
            months[new Date(tempData[0].dt_txt).getMonth()] +
              " " +
              String(new Date(tempData[0].dt_txt).getDate()).padStart(2, "0")
          );
          $("#lbFiveDaysDegree" + (i + 1)).text(
            Math.round(tempData[0].main.temp) + "°C"
          );
          $("#lbFiveDaysCondition" + (i + 1)).text(
            tempData[0].weather[0].main +
              ", " +
              tempData[0].weather[0].description
          );
          if (tempData[0].weather[0].main === "Clouds") {
            $(`#iConditionFiveDays${i + 1}`).toggleClass(
              "fa-solid fa-cloud-meatball"
            );
          } else if (tempData[0].weather[0].main === "Rain") {
            $(`#iConditionFiveDays${i + 1}`).toggleClass(
              "fa-solid fa-cloud-rain"
            );
          } else if (tempData[0].weather[0].main === "Clear") {
            $(`#iConditionFiveDays${i + 1}`).toggleClass("fa-solid fa-sun");
          }
        }
      }
    });
}

function getDataByDate(date) {
  let tempData = fiveDaysData.list.filter((item) => {
    let temp = new Date(item.dt_txt).toLocaleDateString();
    return temp == date;
  });
  return tempData;
}


function addDataToHourlyDiv() {
  document.querySelectorAll(".margin-fiveDays").forEach((item) => {
    item.addEventListener("click", function () {
      let data = getDataByDate(this.dataset.date);

      document.querySelectorAll(".margin-fiveDays").forEach((item) => {
        item.classList.remove("active");
      });
      document.getElementById(this.id).classList.add("active");
      let i = 0;
      data.forEach((item) => {
        $("#lbFiveDaysDayofWeek").html(
          "<b>" +
            weekDays[new Date(item.dt_txt).getDay()].toUpperCase() +
            "</b>"
        );

        if (item.weather[0].main === "Clouds") {
          $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-cloud-meatball");
        } else if (item.weather[0].main === "Rain") {
          $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-cloud-rain");
        } else if (item.weather[0].main === "Clear") {
          $(`#lbConditionH${i + 1}`).toggleClass("fa-solid fa-sun");
        }

        $("#lbH" + (i + 1)).text(
          addTimeIdentifier(new Date(item.dt_txt).getHours())
        );
        $("#lbTempH" + (i + 1)).text(Math.round(item.main.temp) + "°C");
        $("#lbForecastH" + (i + 1)).text(item.weather[0].main);
        $("#lbRealFeelH" + (i + 1)).text(
          Math.round(item.main.feels_like) + "°C"
        );
        $("#lbWindSpeedH" + (i + 1)).text(
          Math.round(item.wind.speed * 3.6) +
            " " +
            degreeToCompass(item.wind.deg)
        );

        if (
          document
            .querySelectorAll(".margin-fiveDays")[0]
            .classList.contains("active")
        ) {
          // take only the first 6 hours (this function is called 2 times)
          if (j < 6) {
            initialCity = $("input").val();
            // check if initail input value is the same as new input value or not; if the same then run below statements
            if (j == 0) {
              switch (new Date(item.dt_txt).getHours()) {
                case 9:
                  checkTimeToHide(6);
                  break;
                case 12:
                  checkTimeToHide(5);
                  break;
                case 15:
                  checkTimeToHide(4);
                  break;
                case 18:
                  checkTimeToHide(3);
                  break;
                case 21:
                  checkTimeToHide(2);
                  break;
                default:
                  break;
              }
            }
          }
          j++;
        } else {
          checkTimeToShowAll();
          j = 0;
        }
        i++;
      });
    });
  });
}

addDateDataSetAndDateID();
BindHoursFiveDaysData();
addDataToHourlyDiv();

function checkResponseCode() {
  let reqCheck = new XMLHttpRequest();
  reqCheck.open("GET", endpointCurrent());
  reqCheck.onload = () => {
    let response = JSON.parse(reqCheck.responseText);
    let resCode = response["cod"];
    if (resCode == "404") {
      hideContentStartup();
    } else {
      // $("#btnToday").click() == true;
      showContentStartup();
    }
  };
  reqCheck.send();
}

function hideContentStartup() {
  document.getElementById("404Error").style.display = "block";
  document.getElementById("fiveDaysForecast").style.display = "none";
  $("#hourslyWeather").hide();
  $("#todayWeather").hide();
  $("#nearbyPlaces").hide();
  $("#btnToday").hide();
  $("#btnFiveDays").hide();
}

function showContentStartup() {
  $("#lbFiveDaysDayofWeek").html("<b>TODAY</b>");
  document.getElementById("404Error").style.display = "none";
  document.getElementById("fiveDaysForecast").style.display = "none";
  $("#hourslyWeather").show();
  $("#todayWeather").show();
  $("#nearbyPlaces").show();
  $("#btnToday").show();
  $("#btnFiveDays").show();
}

// console.log(listTime);

function checkTimeToHide(start) {
  for (let i = start; i <= 6; i++) {
    $("#divH" + i).hide();
    $("#divConditionH" + i).hide();
    $("#divForecastH" + i).hide();
    $("#divTempH" + i).hide();
    $("#divRealFeelH" + i).hide();
    $("#divWindSpeedH" + i).hide();
  }
}

function checkTimeToShowAll() {
  for (let i = 1; i <= 6; i++) {
    $("#divH" + i).show();
    $("#divConditionH" + i).show();
    $("#divForecastH" + i).show();
    $("#divTempH" + i).show();
    $("#divRealFeelH" + i).show();
    $("#divWindSpeedH" + i).show();
  }
}
