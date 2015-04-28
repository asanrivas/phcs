angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
    $scope.patient = $scope.$parent.patient;
})
.controller('LoginCtrl', function($scope, $state) {
    //$scope.signIn
    $scope.signIn = function () {
        $state.go('patient');
    }
})
.controller('FirstTimeCtrl', function($scope) {})
.controller('TabGalleryCtrl', function($scope) {
    $scope.items = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
        { id: 15 },
        { id: 16 },
        { id: 17 },
        { id: 18 },
        { id: 19 },
        { id: 20 },
        { id: 21 },
        { id: 22 },
        { id: 23 },
        { id: 24 },
        { id: 25 },
        { id: 26 },
        { id: 27 },
        { id: 28 },
        { id: 29 },
        { id: 30 },
        { id: 31 },
        { id: 32 },
        { id: 33 },
        { id: 34 },
        { id: 35 },
        { id: 36 },
        { id: 37 },
        { id: 38 },
        { id: 39 },
        { id: 40 },
        { id: 41 },
        { id: 42 },
        { id: 43 },
        { id: 44 },
        { id: 45 },
        { id: 46 },
        { id: 47 },
        { id: 48 },
        { id: 49 },
        { id: 50 }
    ];
})
.controller('TabCtrl', function($scope, $stateParams, RandomUser, $rootScope) {
    $scope.patientID = $stateParams.patientID;
    $scope.patient = RandomUser.getPatientById($stateParams.patientID);

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if(fromState.name=="patient")
        {
            $scope.patient = RandomUser.getPatientById(toParams.patientID);
        }
    });

    $scope.setting = {eol: false};
})

.controller('PatientCtrl', function($scope, RandomUser, $http) {
    $http.get('http://api.randomuser.me/', {params: {'results': 10}}).success(function(data){
        $scope.patients = data.results;
        RandomUser.setPatients(data.results);
    });
    $scope.remove = function(chat) {
        Chats.remove(chat);
    }

    $scope.ExcelDateToJSDate =  function (serial) {
        return serial/65536%100;
    }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
