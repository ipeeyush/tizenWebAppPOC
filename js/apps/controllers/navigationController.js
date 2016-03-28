app.controller('navigationController', function($scope, $interval, GetUserData, SharedDataService) {
	var next = -1, totalPplReached = 0, tracker;
    $scope.targetLocation = SharedDataService.getTargetData();
    
    $scope.arrivedPpl = [];

    var onSuccess = function(response) {
        $scope.userList = response.data;
        $scope.currentUser =  $scope.userList[0]; //assuming userId as "archit.soni@globant.com" 
        $scope.updateCurrentUserPosition();
        
        $scope.getCoordinates();
    };

    var onError = function(response) {
        $scope.userList = [];
    }

    GetUserData.getData().then(onSuccess, onError);

    var bangalore = { lat: 12.9715987, lng: 77.5945627 };
    var curUserMarker, directionsDisplay, directionsService;
    
    var pictureLabel = document.createElement("img");
	pictureLabel.src = "images/user_icon_g.png";

    var map = new google.maps.Map(document.getElementById('map'), {
        center: $scope.targetLocation,
        //scrollwheel: false,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    //set the marker to destination
    var marker = new google.maps.Marker({
        position: $scope.targetLocation,
        map: map,
    });
    
    $scope.updateCurrentUserPosition = function(){
	    //set current user position according to source
	    curUserMarker = new MarkerWithLabel({
	        position: $scope.currentUser.source,
	        map: map,
	        labelContent: "You",
			labelAnchor: new google.maps.Point(35, 60),
			labelClass: "labels",
			labelInBackground: false,
			icon: pinSymbol('#00387B')
	    });
    };
    
    
    //to show Directions button on map
    var directionBtn = document.createElement('div');
    directionBtn.style.padding = "0px 0px 20px 0px";
    var directopnControl =  new createCustomBtn(directionBtn, map);
    //directopnControl .index = 1;
    
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(directionBtn);
    
    function createCustomBtn(controlDiv, map) {
	  // Set CSS for the control border.
	  var controlUI = document.createElement('div');
	  controlUI.setAttribute('id', 'mapdirectionBtn');
	  controlUI.style.backgroundColor = '#493073';
	  controlUI.style.border = '2px solid #493073';
	  controlUI.style.borderRadius = '10px';
	  controlUI.style.textAlign = 'center';
	  controlDiv.appendChild(controlUI);

	  // Set CSS for the control interior.
	  var controlText = document.createElement('div');
	  controlText.style.color = 'white';
	  //controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
	  controlText.style.fontSize = '16px';
	  controlText.style.lineHeight = '32px';
	  controlText.style.paddingLeft = '5px';
	  controlText.style.paddingRight = '5px';
	  controlText.innerHTML = 'Directions';
	  controlUI.appendChild(controlText);

	  // Setup the click event listeners: simply set the map to Chicago.
	  controlUI.addEventListener('click', function() {
		  $scope.getDirections();
	  });

	};

    $scope.getCoordinates = function() {
    	var userList = $scope.userList;
	    var  currentUser = $scope.currentUser;
    	userList.forEach(function(value,index){
    	
    		directionsDisplay = new google.maps.DirectionsRenderer({
	            map: map,
	            suppressMarkers: true,
	            //polylineOptions:{strokeColor:"#493073",strokeWeight:2}
	        });
	
	        // Set destination, origin and travel mode.
	        var request = {
	            origin: userList[index].source,
	            destination: $scope.targetLocation,
	            travelMode: google.maps.TravelMode.DRIVING
	        };
	
	        // Pass the directions request to the directions service.
	        directionsService = new google.maps.DirectionsService();
	        directionsService.route(request, function(response, status) {
	            if (status == google.maps.DirectionsStatus.OK) {
	                // Display the route on the map.
	                //directionsDisplay.setDirections(response);
	            	// saving this in currentUser to show directions, once he clicks 'Directions' btn
	            	if((currentUser.source.lat == response.request.origin.lat) && (currentUser.source.lng == response.request.origin.lng))
	            		$scope.currentUser.route = response;
	                userList[index].destination =  $scope.targetLocation;
	                userList[index].positions = response.routes[0].overview_path; //gives intermediate coordinates to destination
//	                if(index == (userList.length-1)) //call this method once every user's intermediate coordinates are available 
//	                	$scope.trackUserPosition();
	            }
	        });
    	});
    };
    
    $scope.updateUserPosition = function() {
    	var userList =  $scope.userList;
    	var target = $scope.targetLocation;
    	//var imageUrl = "images/user_icon_g.png";
		userList.forEach(function(val,index){
			var person = val;
			var coOrdinates =  person.positions;
			if(coOrdinates[next]){
				
				var curLat = coOrdinates[next].lat();
				var curLong =  coOrdinates[next].lng();
				var newPoint = new google.maps.LatLng(curLat, curLong);

				if(person.marker){
					//to clear older marker
					//person.marker.setMap(null);
					person.marker.setPosition(newPoint);
				}
				else{
					//var splittedName = person.name.split(' ');
					//var labelName = (splittedName.length > 1 ) ? (splittedName[0].charAt(0) + splittedName[1].charAt(0)) : (splittedName[0].charAt(0));
					
					if(person.id == $scope.currentUser.id){
						person.marker = new MarkerWithLabel({
							position : newPoint,
							map: map,
							labelContent: "You",
							labelAnchor: new google.maps.Point(35, 60),
							labelClass: "labels",
							labelInBackground: false,
							icon: pinSymbol('#00387B'),
						});
					}
					else{
						person.marker = new MarkerWithLabel({
							position : newPoint,
							map: map,
							//title: person.name,
							labelContent: pictureLabel,//labelName,
							labelAnchor: new google.maps.Point(35, 60),
							labelClass: "labels",
							labelInBackground: false,
							//map_icon_label: '<span class="map-icon map-icon-male"></span>',
							icon: pinSymbol('#493073'),
							//labelStyle: {opacity: 1}
							//icon: imageUrl,
							//draggable: true
						});
					}
				}
				//person.marker.setMap(map);
				//map.setCenter(newPoint);
			}
			else{
				if ((target.lat === person.destination.lat && target.lng === person.destination.lng) && (!person.reached)) {
						person.reached = true;
						totalPplReached++;
						var personName = {name: person.name};
						$scope.arrivedPpl.push(personName);
						person.marker.setMap(null);
						//all people reached destinamtion;
						if(totalPplReached == userList.length){
							next = -1;
							$interval.cancel(tracker);
						}
				}	
			}
		});
    };
    
    function pinSymbol(color) {
        return {
            path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#000',
            strokeWeight: 1,
            scale: 2,
            //url: "images/user_icon_g.png",
        };
    };
    
    $scope.trackUserPosition = function(){
    	tracker = $interval(function(){
			next++;
			$scope.updateUserPosition();
		},1000);
    };
    
    $scope.trackUsers = function(){
    	var el = document.getElementById("mapdirectionBtn");
    	if(el){
    		el.style.display = "none";
    	}
    	$scope.trackUserPosition();
    	
    	//reset current user direction and marker
    	directionsDisplay.setMap(null);
    	curUserMarker.setMap(null);
    	
    };
    
    $scope.getDirections = function(){
    	
    	directionsDisplay.setDirections($scope.currentUser.route);
    };
});