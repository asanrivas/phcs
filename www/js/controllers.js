angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})
.controller('LoginCtrl', function($scope, $state, $localForage, $http, $ionicLoading, $ionicPopup) {
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
        var url_get = 'http://112.137.162.30/pcis/api_generator.php?api_name=API_SYNC_MOBILE';
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized"></ion-spinner> Loading...'
        });

        $localForage.getItem('upload_data').then(function(data){
            var send_data = {};
            if(data)
            {
                send_data = data;
            }
            $http.post(url_get, send_data).success(function(data){
                $localForage.clear();
                $ionicLoading.hide();
                //success
                if(data)
                {
                    $scope.error_message = false;

                    $localForage.setItem("patients", reorder(data.patients, 'PATIENT_ID'));
                    $localForage.setItem("pruser", data.pruser);
                }
            }).error(function(error){
                $scope.error_message = "Unable to connect the server.";
                $ionicLoading.hide();
                $scope.showConfirm();
                console.log(error);

            });
        });
    }

    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Clear Local Data',
            template: 'Are you sure you want to clear app data?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $localForage.clear();
                console.log('You are sure');
            } else {
                console.log('You are not sure');
            }
        });
    };

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
.controller('TabGalleryCtrl', function($scope, Camera, $localForage, $stateParams) {
    $scope.items = [];
    $localForage.getItem('upload_data').then(function(data){
        if(data && data[$stateParams.patientID].patient_gallery)
            $scope.items.concat(data[$stateParams.patientID].patient_gallery);
    });

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

    $scope.upload_data = [];

    $localForage.getItem('upload_data').then(function(data){
        if(data)
            $scope.upload_data = data;
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
.controller('f04Controller', function($scope, $stateParams, $state, UploadData, Camera) {
    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPhoto().then(function(data){
            $scope.lastPhoto = data.nativeURL;
            $scope.filename = data.name;
        }, function(){

        })
    };
    $scope.patient_gallery = {};
    $scope.first_visit = {};

    $scope.save = function(){
        $scope.patient_gallery.title = 'Consent of Admission Release & Indemity Form';
        $scope.patient_gallery.gallery_type_code = "1";
        $scope.patient_gallery.gallery_status_code = "";
        $scope.patient_gallery.description = "";
        $scope.patient_gallery.image = $scope.lastPhoto;
        $scope.patient_gallery.filename = $scope.filename;

        $scope.first_visit.patient_id = $stateParams.patientID;
        $scope.first_visit.image_form = $scope.filename;
        $scope.first_visit.category_form = 1;


        UploadData.save_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
            UploadData.save_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function(){
                $state.go('tab.firsttime');
            });
        });

    };
})
.controller('f05Controller', function($scope, $stateParams, $state, UploadData, Camera) {
    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPhoto().then(function(data){
            $scope.lastPhoto = data.nativeURL;
            $scope.filename = data.name;
        }, function(){

        })
    };
    $scope.patient_gallery = {};
    $scope.first_visit = {};

    $scope.save = function(){
        $scope.patient_gallery.title = 'Declaration of Photographic/Media Consent';
        $scope.patient_gallery.gallery_type_code = "2";
        $scope.patient_gallery.gallery_status_code = "";
        $scope.patient_gallery.description = "";
        $scope.patient_gallery.image = $scope.lastPhoto;
        $scope.patient_gallery.filename = $scope.filename;

        $scope.first_visit.patient_id = $stateParams.patientID;
        $scope.first_visit.image_form = $scope.filename;
        $scope.first_visit.category_form = 2;

        UploadData.save_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
            UploadData.save_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function(){
                $state.go('tab.firsttime');
            });
        });

    };
})
.controller('f07Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.editImage = function(img){
        handdrawing.openDraw(img);
    };

    $scope.initial_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_INITIAL_ASSESSMENT )
            $scope.initial_assessment = data[$stateParams.patientID].V_INITIAL_ASSESSMENT;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_INITIAL_ASSESSMENT', $scope.initial_assessment).then(function(){
            $state.go('tab.f08');
        });
    }
})
.controller('f08Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.editImage = function(){
        handdrawing.openDraw('www/img/f10.png');
    };

    $scope.medical_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_MEDICAL_ASSESSMENT )
            $scope.medical_assessment = data[$stateParams.patientID].V_MEDICAL_ASSESSMENT;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_MEDICAL_ASSESSMENT', $scope.medical_assessment).then(function(){
            $state.go('tab.f09');
        });
    }
})
.controller('f09Controller', function($scope, $stateParams, $state, UploadData) {
    $scope.editImage = function(){
        handdrawing.openDraw('www/img/f10.png');
    };

    $scope.social_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_SOCIAL_ASSESSMENT )
            $scope.social_assessment = data[$stateParams.patientID].V_SOCIAL_ASSESSMENT;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_SOCIAL_ASSESSMENT', $scope.social_assessment).then(function(){
            $state.go('tab.f10');
        });
    }
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
