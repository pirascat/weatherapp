var express = require('express');
var router = express.Router();
var request = require('sync-request');
var CityModel = require('../models/cities')
var UserModel = require('../models/users')

/* GET home page. */

router.get('/', function(req, res, next) {
  res.redirect('/login')
});

router.get('/login', function(req, res, next){
  res.render("login",{ title: 'Express' })
})

router.post('/sign-up', async function(req, res, next){
  var tableauRechercheUtilisateur = await UserModel.find()
  var existeDansTableau = false
  for (var i = 0; i < tableauRechercheUtilisateur.length; i++){
    if (tableauRechercheUtilisateur[i].email === req.body.email || 
    tableauRechercheUtilisateur[i].username === req.body.username){
      existeDansTableau = true
    }
  }
  if (existeDansTableau){
      req.session.cityList = []
    res.redirect("/login")
    return
  }
  var nouvelUtilisateur = {
    username : req.body.username,
    email : req.body.email,
    password : req.body.password
  }
  var newUserBDD = new UserModel(nouvelUtilisateur)
  var userSaved = await newUserBDD.save()
  req.session.username = req.body.username
  req.session.email = req.body.email
  req.session.password = req.body.password
  req.session.cityList = []
  res.redirect("/weather")
})

router.post('/sign-in', async function(req, res, next){
  var tableauRechercheUtilisateur = await UserModel.find()
  var existeDansTableau = false
  for (var i = 0; i < tableauRechercheUtilisateur.length; i++){
    if (tableauRechercheUtilisateur[i].email === req.body.email && 
    tableauRechercheUtilisateur[i].password === req.body.password){
      existeDansTableau = true
    }
  }
  if (existeDansTableau){
    req.session.email = req.body.email
    req.session.password = req.body.password
    req.session.cityList = []
    res.redirect("/weather")
    return
  }
  res.redirect("/login")
})

router.get('/weather', async function(req, res, next) {
  // var cityList = await CityModel.find()
  if(req.session.cityList === undefined){
    res.redirect('/login')
  }
  res.render('weather', { cityList : req.session.cityList, erreur : "" });
});


router.get('/delete-city', async function(req,res,next){
  if(req.session.cityList === undefined){
    res.redirect('/login')
  }
  req.session.cityList.splice(req.query.index,1)
  res.render("weather",{ cityList : req.session.cityList, erreur : "" })
})

router.post('/add-city', async function(req, res, next){
  // POUR QUAND Y'A PAS DE SESSION
  if(req.session.cityList === undefined){
    res.redirect('/login')
  }
  // POUR LA SESSION
  var existeDansSession = false
  for (var i =0; i< req.session.cityList.length; i++){
    if (req.session.cityList[i].cityName === req.body.cityName){
      existeDansSession = true
    }
  }
  if (!existeDansSession){
    var existeDansBDD = await CityModel.findOne( { cityName : req.body.cityName } );
    if (!existeDansBDD){
      var newCity = {
        cityName : req.body.cityName, 
        image : "/images/picto-1.png", 
        meteo : donneesVille.weather[0].description, 
        tempMin : donneesVille.main.temp_min, 
        tempMax : donneesVille.main.temp_max,
        latitude : donneesVille.coord.lat,
        longitude : donneesVille.coord.lon
      }
      var newCityMDB = new CityModel (newCity)
      var citySaved = await newCityMDB.save()
      req.session.cityList.push(citySaved)
      res.render('weather', {cityList : req.session.cityList, erreur : ""})
      return
    }
    var tableauRechercheBDD = await CityModel.find()
    for (var i = 0; i < tableauRechercheBDD.length; i++){
      if (tableauRechercheBDD[i].cityName === req.body.cityName){
        req.session.cityList.push(tableauRechercheBDD[i])
      }
    }
    res.render('weather', {cityList : req.session.cityList, erreur : ""})
    return
  }
  res.render('weather', {cityList : req.session.cityList, erreur : ""})
})

router.get('/update-data', async function(req, res, next) {
  if(req.session.cityList === undefined){
    res.redirect('/login')
  }
  for (var i = 0; i< req.session.cityList.length; i ++){
    var requete = request('GET', `http://api.openweathermap.org/data/2.5/weather?q=${req.session.cityList[i].cityName}&units=metric&lang=fr&appid=5fffcf5172468a05b678bf437aca6784`)
    var donneesVille = JSON.parse(requete.body)
    req.session.cityList[i].meteo = donneesVille.weather[0].description
    req.session.cityList[i].tempMin = donneesVille.main.temp_min
    req.session.cityList[i].tempMax = donneesVille.main.temp_max
    await CityModel.updateOne(
      {_id : req.session.cityList[i]._id},
      {
        meteo : donneesVille.weather[0].description, 
        tempMin : donneesVille.main.temp_min, 
        tempMax : donneesVille.main.temp_max
      }
      )
  }
  res.render('weather', {cityList : req.session.cityList, erreur : ""})
});

module.exports = router;
