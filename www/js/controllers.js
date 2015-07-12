angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
})
.controller('LoginCtrl', function($scope, $state, $localForage, $http, $ionicLoading, $ionicPopup, UploadData) {
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

        //Upload Image
        $localForage.getItem('PRO_PATIENT_GALLERY').then(function(data){

        });

        // Upload data
        $localForage.getItem('upload_data').then(function(data){
            if(data)


            var send_data = {};
            if(data)
            {
                send_data = data;
            }

            for (var i = 0; Array.isArray(send_data) && i < send_data.length; i++) {
                // console.log(send_data[i].filename);
                if(send_data[i] && send_data[i].PRO_PATIENT_GALLERY && Array.isArray(send_data[i].PRO_PATIENT_GALLERY))
                {
                    var images = send_data[i].PRO_PATIENT_GALLERY;
                    for (var j = 0; j < images.length; j++) {
                        UploadData.upload_gallery(images[j].filename);
                    }
                }
            }

            $http.post(url_get, send_data, {timeout:60000}).success(function(data){
                $ionicLoading.hide();
                //success
                if(data)
                {
                    $scope.error_message = false;
                    $localForage.clear();
                    $localForage.setItem("patients", reorder(data.patients, 'PATIENT_ID'));
                    $localForage.setItem("pruser", data.pruser);

                    var gallery = data.gallery;
                    for (var i = 0; gallery && i < gallery.length; i++)
                    {
                        if(gallery[i].IMAGE)
                        {
                            gallery[i].filename = gallery[i].IMAGE.substr(gallery[i].IMAGE.lastIndexOf('/') + 1);

                            //download for each picture;
                            UploadData.download_gallery(gallery[i].filename);
                        }
                    }

                    $localForage.setItem("PRO_PATIENT_GALLERY", gallery);
                    $localForage.setItem("V_FIRST_VISIT", data.first_visit);
                }
            }).error(function(error, status, headers, config){
                $scope.error_message = "Unable to connect the server.";
                $ionicLoading.hide();
                if(status!=0)
                    $scope.showConfirm();
                console.log(error+" "+status);
                window.plugins.toast.showShortBottom("Connection error");
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
.controller('TabGalleryCtrl', function($scope, Camera, $localForage, $stateParams, $ionicModal, UploadData) {
    $scope.items = [];

    $scope.getPhoto = function() {
        // $scope.openModal();
        Camera.getPhoto().then(function(data){
            $scope.photoURL = data.nativeURL;
            $scope.filename = data.name;
            $scope.openModal();
        }, function(){

        })
    }

    $scope.patient_gallery = {};

    $scope.savePhoto = function() {
        // UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
        //     $scope.closeModal();
        // });
        //
        $scope.patient_gallery.patient_id = $stateParams.patientID;
        $scope.patient_gallery.image = $scope.filename;
        $scope.patient_gallery.filename = $scope.photoURL;

        // if(!$scope.$parent.upload_data[$scope.$parent.patientID])
        //     $scope.$parent.upload_data[$scope.$parent.patientID] = {};
        // if(!Array.isArray($scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY))
        //     $scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY = [];
        //
        // $scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY.push($scope.patient_gallery);
        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
            $scope.$parent.reload_upload_data();
            $scope.closeModal();
        });

    };

    //Modal
    $ionicModal.fromTemplateUrl('templates/modal-camera.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.patient_gallery = {};
        $scope.modal.show();
        return false;
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
        $scope.preview.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    //preview modal
    $scope.previewImageSrc = '';
    $ionicModal.fromTemplateUrl('template/image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.preview = modal;
    });

    $scope.previewImage = function(src){
        $scope.previewImageSrc = src;
        $scope.preview.show();
    };

})
.controller('TabCtrl', function($scope, $stateParams, $localForage, $rootScope, $ionicModal) {
    $scope.patientID = $stateParams.patientID;
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

    // Load upload data
    $scope.upload_data = [];
    // $localForage.getItem('upload_data').then(function(data){
    //     if(data)
    //         $scope.upload_data = data;
    // });
    $localForage.bind($scope, 'upload_data');

    $scope.reload_upload_data = function(){
        $localForage.bind($scope, 'upload_data');
    };

    //Modal
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

.controller('PatientCtrl', function($scope, $http, $localForage) {

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
.controller('f04Controller', function($scope, $stateParams, $state, UploadData, Camera, $localForage) {
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

    var source = [];
    if($scope.$parent.upload_data[$stateParams.patientID] && $scope.$parent.upload_data[$stateParams.patientID].V_FIRST_VISIT)
        source = $scope.$parent.upload_data[$stateParams.patientID].V_FIRST_VISIT;
    else if($localForage.getItem('V_FIRST_VISIT'))
        source = $localForage.getItem('V_FIRST_VISIT')
    for (var i = 0; i < source.length; i++) {
        if(source[i].category_form==1)
            $scope.lastPhoto = cordova.file.externalDataDirectory+source[i].image_form;
    }

    $scope.save = function(){
        $scope.patient_gallery.patient_id = $stateParams.patientID;
        $scope.patient_gallery.title = 'Consent of Admission Release & Indemity Form';
        $scope.patient_gallery.gallery_type_code = "1";
        $scope.patient_gallery.gallery_status_code = "1";
        $scope.patient_gallery.description = "";
        $scope.patient_gallery.image = $scope.filename;
        $scope.patient_gallery.filename = $scope.lastPhoto;

        $scope.first_visit.patient_id = $stateParams.patientID;
        $scope.first_visit.image_form = $scope.filename;
        $scope.first_visit.category_form = 1;

        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
            UploadData.append_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function(){
                $state.go('tab.firsttime');
                $scope.$parent.reload_upload_data();
            });
        });

    };
})
.controller('f05Controller', function($scope, $stateParams, $state, UploadData, Camera, $localForage) {
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

    if($scope.$parent.upload_data[$stateParams.patientID] && $scope.$parent.upload_data[$stateParams.patientID].V_FIRST_VISIT)
    {
        var id=$scope.$parent.upload_data[$stateParams.patientID].V_FIRST_VISIT;
        for (var i = 0; i < id.length; i++) {
            if(id[i].category_form==2)
                $scope.lastPhoto = cordova.file.externalDataDirectory+id[i].image_form;
        }
    }

    $scope.save = function(){
        $scope.patient_gallery.patient_id = $stateParams.patientID;
        $scope.patient_gallery.title = 'Declaration of Photographic/Media Consent';
        $scope.patient_gallery.gallery_type_code = "2";
        $scope.patient_gallery.gallery_status_code = "1";
        $scope.patient_gallery.description = "";
        $scope.patient_gallery.image = $scope.filename;
        $scope.patient_gallery.filename = $scope.lastPhoto;

        $scope.first_visit.patient_id = $stateParams.patientID;
        $scope.first_visit.image_form = $scope.filename;
        $scope.first_visit.category_form = 2;

        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
            UploadData.append_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function(){
                $state.go('tab.firsttime');
                $scope.$parent.reload_upload_data();
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
.controller('f09Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
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
.controller('f10Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
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
