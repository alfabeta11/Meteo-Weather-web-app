import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { format } from "date-fns";

// Create our app;
const app = express();
const port = 3000;
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const SEARCH_API = "https://geocoding-api.open-meteo.com/v1/search";
const GEO_API = "https://get.geojs.io/v1/ip/geo.json";

// public;
app.use(express.static("public"));

// Parse form body;
app.use(bodyParser.urlencoded({ extended: true }));

// Home page;
app.get("/", async (req, res)=> {
    try {
        // Get the latitude/longitude and city of the user.
        const location = await axios.get(GEO_API);
        const userLatitude = location.data.latitude;
        const userLongitude = location.data.longitude;
        const userCity = location.data.city;
        // console.log(res.status(200));
        // Get the location's weather informations;
        const weather = await axios.get(WEATHER_API, {
            params: {
                latitude: userLatitude,
                longitude: userLongitude,
                current: "temperature_2m,relativehumidity_2m",
                daily: "temperature_2m_max,temperature_2m_min",
                timezone: "auto"
            }
        });
        
        const result = weather.data;
        // forecast days temperature infos;
        const days = result.daily.time;
        const mins = result.daily.temperature_2m_min;
        const maxs = result.daily.temperature_2m_max;

        // Time formats
        const date = new Date();
        const now = format(date, "HH:mm"); // 12:39
        const weekDay = format(date, "EEEE"); // Monday, Tuesday...

        // Data to pass to our index.ejs;
        const data = {
            city: userCity,
            temperature: result["current"]["temperature_2m"],
            humidity: result["current"]["relativehumidity_2m"],
            minday: "temperature_2m_min",
            maxday: "temperature_2m_max,",
            time: now,
            dayOfWeek: weekDay,
            days: days,
            minTemps: mins,
            maxTemps: maxs
        }
        // console.log(data);
        // Render index.ejs with the weather data;
        res.render("index.ejs", data);
    } catch (error){
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);
          res.redirect("/")
    }
})

// When user search for a city;
app.post("/search", async (req, res)=> {
    try {
        const cityName = req.body.cityName;
        const searchCity = await axios.get(SEARCH_API, {
            params: {
                name: cityName
            }
        });
        const city = searchCity.data.results[0];

        const cityLatitude = city.latitude;
        const cityLongitude = city.longitude;
        
        const weather = await axios.get(WEATHER_API, {
            params: {
                latitude: cityLatitude,
                longitude: cityLongitude,
                current: "temperature_2m,relativehumidity_2m",
                daily: "temperature_2m_max,temperature_2m_min",
                timezone: "GMT"
            }
        });
        
        const result = weather.data;
        // forecast days temperature infos;
        const days = result.daily.time;
        const mins = result.daily.temperature_2m_min;
        const maxs = result.daily.temperature_2m_max;

        // Time formats
        const date = new Date();
        const now = format(date, "hh:mm"); // 12:39
        const weekDay = format(date, "EEEE"); // Monday, Tuesday...

        // Data to pass to our index.ejs;
        const data = {
            city: cityName,
            temperature: result["current"]["temperature_2m"],
            humidity: result["current"]["relativehumidity_2m"],
            minday: "temperature_2m_min",
            maxday: "temperature_2m_max,",
            time: now,
            dayOfWeek: weekDay,
            days: days,
            minTemps: mins,
            maxTemps: maxs
        }
        // console.log(data);
        // Render index.ejs with the weather data;
        res.render("index.ejs", data);
    } catch(error){
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);
          res.redirect("/")
    }
})

// App listens
app.listen(port, ()=> {
    console.log("Server running on port " + port);
})