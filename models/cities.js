var mongoose = require('mongoose')

var citySchema = mongoose.Schema({
    cityName : String, 
    image : String, 
    meteo : String, 
    tempMin : Number, 
    tempMax : Number,
    latitude : Number,
    longitude : Number
})

var CityModel = mongoose.model('cities', citySchema)

module.exports = CityModel