let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.76727216, lng: -73.99392888 },
    zoom: 12,
  });
}
function addMarker(location, map) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    new google.maps.Marker({
      position: location,
      map: map,
    });
  }
  
let stationInfo = [];
let stationStatus = [];
let bigArray = [];
fetch('http://localhost:3000/station_information.json')
.then(response => response.json())
.then(data=>{
    //console.log(data.data.stations);
    data.data.stations.forEach(e => {
        //grab info from each 
        let station = [e.name,e.lat,e.lon,e.station_id]
        stationInfo.push(station);
        //FetchStatus(station)
    });
    console.log('fetched Station Info');
    //console.log(stationInfo.length);
})

fetch('http://localhost:3000/station_status.json')
.then(response => response.json())
.then(data=>{
    //console.log(data.data.stations);
    data.data.stations.forEach(e => {
        //grab info from each 
        let station = [e.num_bikes_available,e.num_ebikes_available,e.num_docks_available,e.station_status]
        stationStatus.push(station);
    });
    //console.log(stationStatus.length);
    console.log('fetched Station Status');
    
})
document.addEventListener('click',merge);
function merge(){
    for (let i = 0; i < stationInfo.length; i++) {
        bigArray[i] = stationInfo[i].concat(stationStatus[i]);
        
    }
    bigArray.forEach(e=>{
        let location = { lat: e[1], lng: e[2]}
        //console.log(location);
        addMarker(location,map);
    })
}
