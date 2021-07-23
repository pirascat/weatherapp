var mymap = L.map('mapid').setView([48.866667, 2.333333], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

var listeVilles = document.getElementsByTagName("li")

var customIcon = L.icon({
    iconUrl: '/images/leaf-green.png',
    shadowUrl: '/images/leaf-shadow.png',
   
    iconSize:   [38, 95],
    shadowSize:  [50, 64],
   
    iconAnchor:  [22, 94],
    shadowAnchor: [4, 62],  
   
    popupAnchor: [-3, -76]
   });
   

for (var i = 0; i< listeVilles.length; i++){
    L.marker([listeVilles[i].dataset.latitude,listeVilles[i].dataset.longitude],{icon: customIcon})
    .addTo(mymap)
    .bindPopup(listeVilles[i].dataset.cityname)
}


