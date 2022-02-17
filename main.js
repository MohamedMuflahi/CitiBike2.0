// GlOBAL DATA
let stationInfo = [];
let stationStatus = [];
let bigArray = [];
let rowDiv = document.getElementById('deck');
let displayDiv = document.getElementById('display');
let map;
let image; 
let secondImage;
let markersArray = [];
let secondMarkersArray = [];
let searchMarkerArray = [];
let nearestLoc = [];
let isItBikes = true;
let service;
let formInput = document.getElementById('form1');
let button = document.getElementById('button');
let first = false;
let second = false;
let locationMarker;
let previousId;
//let findButton = document.getElementById('find-button')
let touch = document.getElementById('touch');
//touch.addEventListener('click',merge);
// InitMap Invoked in HTML creates Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7052196, lng: -74.0137571 },
    zoom: 14,
    maxZoom: 20,
    minZoom: 12
  });
  const Bikediv = document.createElement("div");
  const LocationDiv = document.createElement("div");
  
  CenterControl(Bikediv);
  CreateLocationButton(LocationDiv);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(Bikediv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(LocationDiv);
  service = new google.maps.places.PlacesService(map);
  map.addListener('zoom_changed', ()=>{
    //console.log('changed');
    let zoomLevel = map.getZoom();
    if(zoomLevel <= 13){
      markersArray.forEach((marker)=>{
        marker.setMap(null);
      })
      secondMarkersArray.forEach(marker=>{
        marker.setMap(map);
      })
    }else{
      secondMarkersArray.forEach(marker=>{
        marker.setMap(null);
      })
      markersArray.forEach((marker)=>{
        marker.setMap(map);
      })
    }
  })
}

// fetches Station_information JSON and grabs name,lat,long,ID for each station into array
fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
.then(response => response.json())
.then(data=>{
    data.data.stations.forEach(e => {
        //grab info from each 
        let station = [e.name,e.lat,e.lon,e.station_id]
        stationInfo.push(station);
        first = true;
        
    });
    console.log('fetched Station Info');
})
// fetches station_status JSON and grabs info on availibilty into an array
fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
.then(response => response.json())
.then(data=>{
    data.data.stations.forEach(e => {
        //grab info from each 
        let station = [e.num_bikes_available,e.num_ebikes_available,e.num_docks_available,e.station_status,e.last_reported]
        stationStatus.push(station);
        second = true
        
    });
    console.log('fetched Station Status');
    
})
async function test() {
  //console.log('start timer');
  await new Promise(resolve => setTimeout(resolve, 2000));
  //console.log('after 1 second');
  if(first&& second){
   merge();
  }
}

test();
// Merge both arrays to make one array for each station of all the info we need called BIGARRAY
function merge(){
    for (let i = 0; i < stationInfo.length; i++) {
        bigArray[i] = stationInfo[i].concat(stationStatus[i]);
        
    }
    drop();
    
}
// Adds Markers for each station in bigArray using lat and long
function drop() {
    bigArray.forEach(e=>{
        let location = { lat: e[1], lng: e[2]}
        
        addMarker(location,map,e);
        
        
    })
    // grabs GEOLOCATIONS and runs the callback functions Success,Error based on result
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
  // Creates a Marker based on infomation passed in
  function addMarker(location, map,element,zoomedOut) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    
    let date = new Date(element[8] * 1000);
    let minutes = date.getMinutes();
    let contentString = `
    <div class="card">
        <div class="card-body">
          <img id="${element[3]}"class="icon" onclick="CreatePinDisplay('${element[0]}','${element[4]}','${element[5]}','${element[6]}','${minutes}','${element[3]}')" src="thumbtack.png"/
          <h5 class="card-title">${element[0]} </h5>
          <p class="card-text text-center">${element[4]}&nbsp&nbsp&nbsp&nbsp&nbsp | &nbsp&nbsp&nbsp&nbsp&nbsp ${element[5]}  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${element[6]}</p>
          <p class="card-text">Classic ⚡Electric &nbspDocks</p>
          <p class="card-text"><small class="text-muted">Last updated ${minutes} mins ago</small></p>
        </div>
        </div>
    ` ;
    
    if(element[4] > 10){
      image = 'logoGreen.png'
      secondImage = 'Greenicon.png';
    }else if(element[4] >= 1){
      image = 'logoOrange.png'
      secondImage = 'Orangeicon.png';
    }else if(element[4] <= 0){
      image = 'logoRed.png'
      secondImage = 'Redicon.png';
    }
    else{
      image = 'marker.png'
    }
    if(element[7] != 'active'){
      contentString = `
      <div class="card">
        <div class="card-body">
          <button onclick="CreatePinDisplay(${element},${minutes})"><img class="icon" src="thumbtack.png"/></button>
          <h5 class="card-title">${element[0]}</h5>
          <p>This station isn't up and running yet, but it will be soon. In the meantime, try a different one.</p>
          <p class="card-text"><small class="text-muted">Last updated ${minutes} mins ago</small></p>
        </div>
        </div>
      `
      
      image = 'logoGrey.png'
      secondImage = 'Greyicon.png';
    }
    
    
    
    let marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: image,
      
    });
    let smallMarker = new google.maps.Marker({
      position:location,
      map:null,
      icon:secondImage,
    })
    const infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 220,
      });
      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
          shouldFocus: false,
        });
    
  });
  //console.log(infowindow.myValue);
  secondMarkersArray.push(smallMarker);
  markersArray.push(marker);
} 
// finds nearest location using location passed in by geolocations sucess
  function nearestLocation(poslat,poslng){
      bigArray.forEach(e=>{
          if(nearestLoc.length < 4){
            if (distance(poslat, poslng, e[1], e[2], "K") <= 0.5) {
                nearestLoc.push(e);
            }
          }
            
      })
      CreateLocationCards();
  }
  // createsCards for nearest Spots
  function CreateLocationCards(){
    if(rowDiv.children.length <= 0){
      nearestLoc.forEach(e=>{
        let date = new Date(e[8] * 1000);
        let minutes = date.getMinutes();
        let obj = document.createElement('div');
        
        obj.innerHTML = `
        <div class="card">
        <div class="card-body">
          <h5 class="card-title">${e[0]} </h5>
          <p class="card-text text-center">${e[4]}&nbsp&nbsp&nbsp&nbsp&nbsp | &nbsp&nbsp&nbsp&nbsp&nbsp ${e[5]}  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${e[6]}</p>
          <p class="card-text">Classic ⚡Electric  &nbsp&nbspDocks</p>
          <p class="card-text"><small class="text-muted">Last updated ${minutes} mins ago</small></p>
        </div>
        </div>
        `;
        // grabs nested SVG pushPin icon and adds event Listener
        // obj.children[0].children[0].children[0].children[0].addEventListener('click',()=>{
        //   console.log('clicked', e[3]);
        // })
        
        rowDiv.appendChild(obj);

      })
    }
    
  }
  function distance(lat1, lon1, lat2, lon2, unit) {
    let radlat1 = Math.PI * lat1/180
    let radlat2 = Math.PI * lat2/180
    let theta = lon1-lon2
    let radtheta = Math.PI * theta/180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
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

let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 2000
  };
  
  function success(pos) {
    let crd = pos.coords;
  
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    let center = {lat: crd.latitude, lng: crd.longitude};
    map.setCenter(center);
    map.setZoom(17);
    locationMarker = undefined;
    locationMarker = new google.maps.Marker({
      position: center,
      map: map,
      icon: 'LocationLogo.png',
    });
    nearestLocation(crd.latitude,crd.longitude);

  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
    // if this location is within 0.1KM of the user, add it to the list

  function CenterControl(controlDiv) {
      // Set CSS for the control border.
  const controlUI = document.createElement("div");

  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.marginRight = "10px";
  controlUI.style.textAlign = "center";
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  const controlText = document.createElement("div");

  controlText.style.color = "rgb(25,25,25)";

  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.className = 'disable-select'
  controlUI.className = 'disable-select'
  controlText.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'><!--! Font Awesome Pro 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d='M347.2 32C358.1 32 369.8 38.44 375.4 48.78L473.3 229.1C485.5 226.1 498.5 224 512 224C582.7 224 640 281.3 640 352C640 422.7 582.7 480 512 480C441.3 480 384 422.7 384 352C384 311.1 402.4 276.3 431.1 252.8L409.4 212.7L324.7 356.2C320.3 363.5 312.5 368 304 368H255C247.1 431.1 193.3 480 128 480C57.31 480 0 422.7 0 352C0 281.3 57.31 224 128 224C138.7 224 149.2 225.3 159.2 227.8L185.8 174.7L163.7 144H120C106.7 144 96 133.3 96 120C96 106.7 106.7 96 120 96H176C183.7 96 190.1 99.71 195.5 105.1L222.9 144H372.3L337.7 80H311.1C298.7 80 287.1 69.25 287.1 56C287.1 42.75 298.7 32 311.1 32H347.2zM440 352C440 391.8 472.2 424 512 424C551.8 424 584 391.8 584 352C584 312.2 551.8 280 512 280C508.2 280 504.5 280.3 500.8 280.9L533.1 340.6C539.4 352.2 535.1 366.8 523.4 373.1C511.8 379.4 497.2 375.1 490.9 363.4L458.6 303.7C447 316.5 440 333.4 440 352V352zM108.8 328.6L133.1 280.2C131.4 280.1 129.7 280 127.1 280C88.24 280 55.1 312.2 55.1 352C55.1 391.8 88.24 424 127.1 424C162.3 424 190.9 400.1 198.2 368H133.2C112.1 368 99.81 346.7 108.8 328.6H108.8zM290.3 320L290.4 319.9L217.5 218.7L166.8 320H290.3zM257.4 192L317 274.8L365.9 192H257.4z'/></svg>";
  controlText.style.width = '35px';
  controlText.style.height = '35px';


  
  controlUI.appendChild(controlText);

      controlUI.addEventListener("click", () => {
        
        
        if(isItBikes == true){
          isItBikes = false;
          controlText.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M352 176C369.7 176 384 190.3 384 208C384 225.7 369.7 240 352 240H320V448H368C421 448 464 405 464 352V345.9L456.1 352.1C447.6 362.3 432.4 362.3 423 352.1C413.7 343.6 413.7 328.4 423 319L479 263C488.4 253.7 503.6 253.7 512.1 263L568.1 319C578.3 328.4 578.3 343.6 568.1 352.1C559.6 362.3 544.4 362.3 535 352.1L528 345.9V352C528 440.4 456.4 512 368 512H208C119.6 512 48 440.4 48 352V345.9L40.97 352.1C31.6 362.3 16.4 362.3 7.029 352.1C-2.343 343.6-2.343 328.4 7.029 319L63.03 263C72.4 253.7 87.6 253.7 96.97 263L152.1 319C162.3 328.4 162.3 343.6 152.1 352.1C143.6 362.3 128.4 362.3 119 352.1L112 345.9V352C112 405 154.1 448 208 448H256V240H224C206.3 240 192 225.7 192 208C192 190.3 206.3 176 224 176H234.9C209 158.8 192 129.4 192 96C192 42.98 234.1 0 288 0C341 0 384 42.98 384 96C384 129.4 366.1 158.8 341.1 176H352zM288 128C305.7 128 320 113.7 320 96C320 78.33 305.7 64 288 64C270.3 64 256 78.33 256 96C256 113.7 270.3 128 288 128z"/></svg>'
        }else{
          isItBikes = true;
          controlText.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'><!--! Font Awesome Pro 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d='M347.2 32C358.1 32 369.8 38.44 375.4 48.78L473.3 229.1C485.5 226.1 498.5 224 512 224C582.7 224 640 281.3 640 352C640 422.7 582.7 480 512 480C441.3 480 384 422.7 384 352C384 311.1 402.4 276.3 431.1 252.8L409.4 212.7L324.7 356.2C320.3 363.5 312.5 368 304 368H255C247.1 431.1 193.3 480 128 480C57.31 480 0 422.7 0 352C0 281.3 57.31 224 128 224C138.7 224 149.2 225.3 159.2 227.8L185.8 174.7L163.7 144H120C106.7 144 96 133.3 96 120C96 106.7 106.7 96 120 96H176C183.7 96 190.1 99.71 195.5 105.1L222.9 144H372.3L337.7 80H311.1C298.7 80 287.1 69.25 287.1 56C287.1 42.75 298.7 32 311.1 32H347.2zM440 352C440 391.8 472.2 424 512 424C551.8 424 584 391.8 584 352C584 312.2 551.8 280 512 280C508.2 280 504.5 280.3 500.8 280.9L533.1 340.6C539.4 352.2 535.1 366.8 523.4 373.1C511.8 379.4 497.2 375.1 490.9 363.4L458.6 303.7C447 316.5 440 333.4 440 352V352zM108.8 328.6L133.1 280.2C131.4 280.1 129.7 280 127.1 280C88.24 280 55.1 312.2 55.1 352C55.1 391.8 88.24 424 127.1 424C162.3 424 190.9 400.1 198.2 368H133.2C112.1 368 99.81 346.7 108.8 328.6H108.8zM290.3 320L290.4 319.9L217.5 218.7L166.8 320H290.3zM257.4 192L317 274.8L365.9 192H257.4z'/></svg>";
        }
        change();
      });
    }  
    function change(){
      if(isItBikes){
        for(let i = 0;i<= bigArray.length;i++){
          let x = bigArray[i][4];
          if(x > 10){
            image = 'logoGreen.png'
            secondImage = 'Greenicon.png';
          }else if(x >= 1){
            image = 'logoOrange.png'
            secondImage = 'Orangeicon.png';
          }else if(x <= 0){
            image = 'logoRed.png'
            secondImage = 'Redicon.png';
          }
          if(bigArray[i][7] != 'active'){
            image = 'logoGrey.png'
            secondImage = 'Greyicon.png';
          }
          markersArray[i].setIcon(image)
          secondMarkersArray[i].setIcon(secondImage);
        }
      }else{
        for(let i = 0;i<= bigArray.length;i++){
          let x = bigArray[i][6];
          if(x > 10){
            image = 'logoGreen.png'
            secondImage = 'Greenicon.png';
          }else if(x >= 1){
            image = 'logoOrange.png'
            secondImage = 'Orangeicon.png';
          }else if(x <= 0){
            image = 'logoRed.png'
            secondImage = 'Redicon.png';
          }
          if(bigArray[i][7] != 'active'){
            image = 'logoGrey.png'
            secondImage = 'Greyicon.png';
          }
          markersArray[i].setIcon(image)
          secondMarkersArray[i].setIcon(secondImage);
      }
    }
  }
  
button.addEventListener('click',()=>{
  
  let request = {
    query: formInput.value,
    fields: ["name","geometry"],
  };
  service.findPlaceFromQuery(request, (results, status) => {
    console.log(results);
    console.log(status);
    console.log(request);
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }

      map.setCenter(results[0].geometry.location);
    }
  });
})


function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  searchMarkerArray.forEach((e)=>{
    e.setMap(null);
  })
  
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: 'searchLogo.png',
  });
  searchMarkerArray.push(marker);
  removeAllChildNodes(rowDiv);
  console.log(marker.getPosition().lng());
  nearestLoc = [];
  nearestLocation(marker.getPosition().lat(),marker.getPosition().lng());
}
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}
function CreateLocationButton(div){
  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.marginRight = "10px";
  controlUI.style.textAlign = "center";
  div.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlImage = document.createElement("div");
  controlUI.appendChild(controlImage);

  controlUI.appendChild(controlImage);
  controlImage.style.lineHeight = "38px";
  controlImage.style.paddingLeft = "5px";
  controlImage.style.paddingRight = "5px";
  controlImage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M176 256C176 211.8 211.8 176 256 176C300.2 176 336 211.8 336 256C336 300.2 300.2 336 256 336C211.8 336 176 300.2 176 256zM256 0C273.7 0 288 14.33 288 32V66.65C368.4 80.14 431.9 143.6 445.3 224H480C497.7 224 512 238.3 512 256C512 273.7 497.7 288 480 288H445.3C431.9 368.4 368.4 431.9 288 445.3V480C288 497.7 273.7 512 256 512C238.3 512 224 497.7 224 480V445.3C143.6 431.9 80.14 368.4 66.65 288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H66.65C80.14 143.6 143.6 80.14 224 66.65V32C224 14.33 238.3 0 256 0zM128 256C128 326.7 185.3 384 256 384C326.7 384 384 326.7 384 256C384 185.3 326.7 128 256 128C185.3 128 128 185.3 128 256z"/></svg>';
  controlImage.style.width = '35px';
  controlImage.style.height = '35px';
      controlUI.addEventListener("click", () => {
        removeAllChildNodes(rowDiv);
        nearestLoc = [];
        navigator.geolocation.getCurrentPosition(success, error, options);
      });
}
const CreatePinDisplay = (name,bikes,eBikes,docks,minutes,id) =>{
  console.log('clicked');
  // let e = event.target.getAttribute('data-arg1');
  // let minutes = event.target.getAttribute('data-arg2');
  let iconimage = document.getElementById(id);
  previousId = document.getElementById(previousId);
  if(previousId){
    iconimage.src = 'fullthumbtack.png';
    previousId.src = 'thumbtack.png';
  }else{
    iconimage.src = 'fullthumbtack.png';
  }
  previousId = id;
  let emptydiv = document.createElement('div');
  emptydiv.innerHTML = `
  <div id='pinned' class="card text-center">   
    <div class="card-body">
      <img class="icon" src="fullthumbtack.png"/>
      <h5 class="card-title">${name}</h5>
      <p class="card-text text-center">${bikes}&nbsp&nbsp&nbsp&nbsp&nbsp | &nbsp&nbsp&nbsp&nbsp&nbsp ${eBikes}  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${docks}</p>
      <p class="card-text">Classic ⚡Electric  &nbsp&nbspDocks</p>
      <p class="card-text"><small class="text-muted">Last updated ${minutes} mins ago</small></p>
    </div>
  </div>
  `;
  if(displayDiv.children.length <= 0){
    // empty 
    displayDiv.appendChild(emptydiv);
  }else{
    removeAllChildNodes(displayDiv);
    displayDiv.appendChild(emptydiv);
  }
}
