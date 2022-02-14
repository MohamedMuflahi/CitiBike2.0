let rowDiv = document.getElementById('row');
let map;
let markersArray = [];
let nearestLoc = [];
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.76727216, lng: -73.99392888 },
    zoom: 14,
  });
}
function addMarker(location, map,element) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    let image = 'marker.png'
    let contentString = `
    ${element[0]}
    <br>
    ${element[4]} Bikes
    <br>
    ${element[5]} E-Bikes
    <br>
    ${element[6]} Docks
    ` 
    let marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: image,
      
    });
    const infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 200,
      });
      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
          shouldFocus: false,
        });
  });
  markersArray.push(marker);
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
    drop();
    
}

function drop() {
    bigArray.forEach(e=>{
        let location = { lat: e[1], lng: e[2]}
        
        addMarker(location,map,e);
        
        
    })
    navigator.geolocation.getCurrentPosition(success, error, options);
  } 
  function nearestLocation(poslat,poslng){
    
    //console.log(nearestFive);
      bigArray.forEach(e=>{
          if(nearestLoc.length < 4){
            if (distance(poslat, poslng, e[1], e[2], "K") <= 0.5) {
                nearestLoc.push(e);
            }
          }
            
      })
      if(rowDiv.children.length <= 0){
        nearestLoc.forEach(e=>{
            let obj = document.createElement('div');
              obj.innerHTML = `
            <div class="col-sm-2">
              <div class="card" style="width: 250px;">
                  <div class="row no-gutters">
                      <div class="col-sm-12">
                          <div class="card-body">
                              <h5 class="card-title" id="card-title">${e[0]}</h5>
                              <p class="card-text" id="card-title" >${e[4]} Bikes<br>${e[5]} E-Bikes<br>${e[6]} Docks</p>
                              <a href="#" class="btn btn-primary">View Location</a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>`;
          rowDiv.appendChild(obj);
              })
      }
      
      
      
  }
  function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  
  function success(pos) {
    var crd = pos.coords;
  
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    let center = {lat: crd.latitude, lng: crd.longitude};
    map.setCenter(center);
    nearestLocation(crd.latitude,crd.longitude);

  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  
/* <div class="col-sm-3">
                    <div class="card" style="width: 200px;">
                        <div class="row no-gutters">
                            <div class="col-sm-12">
                                <div class="card-body">
                                    <h5 class="card-title" id="card-title">Street Name</h5>
                                    <p class="card-text" id="card-title" ></p>
                                    <a href="#" class="btn btn-primary">View Location</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */
    // if this location is within 0.1KM of the user, add it to the list
