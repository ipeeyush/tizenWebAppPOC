app.controller('homeController', ['$scope', '$state', 'SharedDataService', function($scope, $state, SharedDataService) {

    function customiseInviteeList(inviteeList){
        var customInviteeList = "";
        var str = "";
        //doing this for customizing invitee list
        for (var i = 0; i < inviteeList.length; i++) {
            var invitee = inviteeList[i].name;
            if (inviteeList.length == 1) {
                customInviteeList = invitee;
                break;
            }
            if (inviteeList.length <= 4) {
                if (inviteeList[i + 1]) {
                    str += invitee;
                    if (inviteeList[i + 2])
                        str += ", ";
                } else {
                    str += " and " + invitee;
                    customInviteeList = str;
                    break;
                }
            } else {
                if (i <= 3) {
                    str += invitee;
                    if (i < 3)
                        str += ", ";
                } else {
                    var remainingPpl = inviteeList.length - i;
                    str += " and " + remainingPpl + " more";
                    customInviteeList = str;
                    break;
                }
            }
        }
        return customInviteeList;
    };

    $scope.currentUser = SharedDataService.getCurrentUser();
    $scope.upcomingEvents = [];
    $scope.allEvents = [];
    SharedDataService.getEventsFromDb($scope.currentUser.user_id, function(response){
       var userId = $scope.currentUser.user_id;
       var allEventList = [], upcomingEventList = [];
        angular.forEach(response, function(event, key){
            var inviteeList = event.invitee_list;
            for (var i=0; i<inviteeList.length; i++){
                if(userId == inviteeList[i].user_id){
                     if (inviteeList[i].status == "ACCEPTED") {
                        event.statusClass = "accepted";// this field is css class name
                        event.status = "accepted"; 
                    } else if ($inviteeList[i].status == "PENDING") {
                        event.statusClass = "pending";
                        event.status = "pending";
                        event.customisedInviteeList = customiseInviteeList(event.inviteeList);
                    } else {
                        event.statusClass = "rejected";
                        event.status = "rejected";
                    }
                }
            }
           
            //push upcoming event list
            var eventDate = new Date(event.event_date);
            if (eventDate >= new Date()) {
                upcomingEventList.push(event);
            }
            var curDate = new Date();
            if ((eventDate.getDate() == curDate.getDate()) && (eventDate.getMonth() == curDate.getMonth()) && (eventDate.getFullYear() == curDate.getFullYear())) {
                event.displayDate = "Today";
            } else {
                event.displayDate = eventDate;
            }

            //push event to allEventList
            allEventList.push(event);   
        });
        //update the model
         $scope.$apply(function(){
            $scope.allEvents = allEventList;
            $scope.upcomingEvents = upcomingEventList;
        });

    }, function(response) {
        
    });

    $scope.getEventDetails = function(eventObj) {
        SharedDataService.setEventData(eventObj);
        $state.go('navigation');
    };

}]);
