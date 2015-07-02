angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})
.controller('LoginCtrl', function($scope, $state, $localForage, $http, $ionicLoading) {
    //$scope.signIn
    $scope.user = {username: '', password: ''}
    $scope.signIn = function (user) {
        $localForage.getItem('pruser').then(function(data){
            if(!data) {
                alert('data unavailable. please sync the database first');
            }
            else {
                for(var i=0;i<data.length;i++)
                {
                    if(data[i].USERNAME==user.username&&data[i].USERPASSWORD==md5(user.password))
                    {
                        $state.go('patient');
                        $scope.error_message = null;

                        return true;
                    }
                }
                console.log('invalid username or password');
                $scope.error_message = "Invalid username or password";

            }
        });

    }

    $scope.sync = function (argument) {
        // body...
        var url = 'http://112.137.162.30/pcis/api_generator.php?api_name=API_SYNC_MOBILE';
        $ionicLoading.show({
            template: 'Loading... <ion-spinner class="spinner-energized"></ion-spinner>'
        });

        $http.get(url).success(function(data){
            $localForage.clear();
            $ionicLoading.hide();

            $localForage.setItem("patients", reorder(data.patients, 'PATIENT_ID'));
            $localForage.setItem("pruser", data.pruser);
        });

    }

    //need to reorder data if by key
    function reorder(data, key){
        for (var i = 0, emp, array = []; i < data.length; i++) {
            emp = data[i];
            array[ emp[key] ] = emp;
        }

        return array;
    }

})
.controller('FirstTimeCtrl', function($scope) {})
.controller('TabGalleryCtrl', function($scope, Camera) {
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

    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPhoto().then(function(data){
            console.log(data);
        }, function(){

        })
    }
})
.controller('TabCtrl', function($scope, $stateParams, $localForage, $rootScope, $ionicModal) {
    $scope.patientID = $stateParams.patientID;
    // $scope.patient = RandomUser.getPatientById($stateParams.patientID);

    $localForage.getItem('patients').then(function(dataf){
        $scope.patients = dataf;
        $scope.patient = $scope.patients[parseInt($stateParams.patientID)];
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if(fromState.name=="patient")
        {
            $scope.patient = $scope.patients[parseInt(toParams.patientID)];
        }
    });

    $scope.setting = {eol: false};

    $ionicModal.fromTemplateUrl('templates/forms/modal-glassgow.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
        return false;
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });
})

.controller('PatientCtrl', function($scope, RandomUser, $http, $localForage) {

    $localForage.getItem('patients').then(function(dataf){
        if(!dataf)
        {
            $http.get('http://api.randomuser.me/', {params: {'results': 10}}).success(function(data){
                $scope.patients = data.results;
                $localForage.setItem("patients", data.results);
            });
            console.log('data taken from random');
        }
        else {
            $scope.patients = dataf;
        }

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
.controller('PointCtrl', function($scope, $state) {
    $scope.p01next = function(){
        if($scope.radio.p1 == 'GSC')
        {
            $scope.$parent.openModal();
        }
        else {
            $state.go('tab.p02');
        }
    }
    $scope.radio = {
        p1: null
    }
})
.controller('f10Controller', function($scope, $stateParams) {
    $scope.editImage = function(){
        handdrawing.openDraw('www/img/f10.png');
    };
})
.controller('f07Controller', function($scope, $stateParams, $state, $localForage) {
    $scope.editImage = function(){
        handdrawing.openDraw('www/img/f10.png');
    };

    $scope.initial_assessment = {};

    $scope.saveAndNext = function(){
        $localForage.getItem('upload_data').then(function(data){
            if(!data) data = {};
            if(!data['V_INITIAL_ASSESSMENT']) data['V_INITIAL_ASSESSMENT'] = {};
            data['V_INITIAL_ASSESSMENT'][$stateParams.patientID] = $scope.initial_assessment;
            $localForage.setItem('upload_data', data);
            $state.go('tab.f08');
        });
    }
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
