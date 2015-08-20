angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $localForage, $state) {
    $scope.profile_images = null;

    $scope.make_profile_pic = function(img){
        if(window.cordova && img)
            return cordova.file.externalDataDirectory+img;
        else if(window.cordova && $scope.$parent.patient.PROFILE_IMAGE)
            return cordova.file.externalDataDirectory+$scope.$parent.patient.PROFILE_IMAGE;
        else {
            return $scope.profile_images = 'img/dummy-profile-pic.png';
        }
    }

    $scope.open_loc = function(dest){
        var url = "geo:?q="  + dest +"&z=14";
        console.log(url);
        //window.location.href = url;
        cordova.InAppBrowser.open(url, "_system");
    }
    $scope.nurse_visit = [];
    $localForage.getItem('nurse_visit').then(function(data){
        $scope.nurse_visit = data;
    });

    $scope.logout = function () {
        window.localStorage.removeItem('user:userid');
        window.localStorage.removeItem('user:username');
        $state.go('login');

    }

    $scope.saveAndNext = function () {
        console.log("go to home");
        $state.go('tab.home');
    }
})

.controller('DashCtrl', function($scope, $localForage, $state) {
    $scope.profile_images = null;

    $scope.make_profile_pic = function(img){
        if(window.cordova && img)
            return cordova.file.externalDataDirectory+img;
        else if(window.cordova && $scope.$parent.patient.PROFILE_IMAGE)
            return cordova.file.externalDataDirectory+$scope.$parent.patient.PROFILE_IMAGE;
        else {
            return $scope.profile_images = 'img/dummy-profile-pic.png';
        }
    }

    $scope.open_loc = function(dest){
        var url = "geo:?q="  + dest +"&z=14";
        console.log(url);
        //window.location.href = url;
        cordova.InAppBrowser.open(url, "_system");
    }
    $scope.nurse_visit = [];
    $localForage.getItem('nurse_visit').then(function(data){
        $scope.nurse_visit = data;
    });

    $scope.logout = function () {
        window.localStorage.removeItem('user:userid');
        window.localStorage.removeItem('user:username');
        $state.go('login');

    }
})
.controller('LoginCtrl', function($scope, $state, $localForage, $http, $ionicLoading, $ionicPopup, UploadData) {
    //$scope.signIn

    var corrad_server = window.localStorage.getItem('corrad_server');
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
                        window.localStorage.setItem('user:userid', data[i].USERID);
                        window.localStorage.setItem('user:username', data[i].USERNAME);

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
        var url_get = corrad_server+'api_generator.php?api_name=API_SYNC_MOBILE';
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

            for (var i = 0; window.cordova && Array.isArray(send_data) && i < send_data.length; i++) {
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
                    $localForage.setItem("nurse_visit", data.nurse_visit);

                    var gallery = data.gallery;
                    for (var i = 0; gallery && i < gallery.length; i++)
                    {
                        if(gallery[i].IMAGE)
                        {
                            gallery[i].filename = gallery[i].IMAGE.substr(gallery[i].IMAGE.lastIndexOf('/') + 1);

                            //download for each picture;
                            if(window.cordova)
                                UploadData.download_gallery(gallery[i].filename);
                        }
                    }

                    $localForage.setItem("PRO_PATIENT_GALLERY", gallery);
                    $localForage.setItem("V_FIRST_VISIT", data.first_visit);
                    // $localForage.setItem("V_PMT_EOLCP", data.first_visit);
                    // $localForage.setItem("V_PMT_EOLCP_IPA", data.first_visit);
                    // $localForage.setItem("V_EOLCP_COMFORT_MEASURES", data.first_visit);
                    // $localForage.setItem("V_EOLCP_TREATMENTS_PROCEDURES", data.first_visit);
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
.controller('ContinuousCtrl', function($scope) {})
.controller('FormContinuousCtrl', function($scope) {})

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

    $scope.db_gallery = [];
    $localForage.getItem('PRO_PATIENT_GALLERY').then(function(data){
        if(!data) return;
        for (var i = 0; i < data.length; i++) {
            if(!data[i]) return;
            if(data[i].PATIENT_ID == $stateParams.patientID && data[i].filename)
            {
                $scope.db_gallery.push(angular.extend({fullname: cordova.file.externalDataDirectory+data[i].filename}, data[i]));
            }

        }
    });

    $scope.savePhoto = function() {
        // UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(){
        //     $scope.closeModal();
        // });
        //
        $scope.patient_gallery.patient_id = $stateParams.patientID;
        $scope.patient_gallery.image = $scope.filename;
        $scope.patient_gallery.filename = $scope.photoURL;//'img/ionic.png';//

        // if(!$scope.$parent.upload_data[$scope.$parent.patientID])
        //     $scope.$parent.upload_data[$scope.$parent.patientID] = {};
        // if(!Array.isArray($scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY))
        //     $scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY = [];
        //
        // $scope.$parent.upload_data[$scope.$parent.patientID].PRO_PATIENT_GALLERY.push($scope.patient_gallery);
        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(data){
            console.log(data);
            var images = data[$scope.patientID].PRO_PATIENT_GALLERY;
            var found_pic = false;
            for (var i = images.length - 1; i >= 0; i--) {
                if(images[i] && images[i].gallery_type_code == "5")
                {
                    found_pic = true;
                    // $scope.$parent.upload_data[$scope.patientID]['profile_images'] = images[i].filename;
                    UploadData.save_data_patient_id($stateParams.patientID, 'profile_images', images[i].image).then(function(){
                        $scope.$parent.reload_upload_data();
                        $scope.closeModal();
                    });
                    break;
                }
            }

            if(!found_pic)
            {
                $scope.$parent.reload_upload_data();
                $scope.closeModal();
            }
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
    $scope.patient = [];
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


})
.controller('FormFirstVisitCtrl', function($scope, $stateParams, $localForage, $ionicModal) {
    $scope.patientID = $stateParams.patientID;
    $scope.patient = [];
    $localForage.getItem('patients').then(function(dataf){
        $scope.patients = dataf;
        $scope.patient = $scope.patients[parseInt($stateParams.patientID)];
    });
    $scope.upload_data = [];
    $localForage.bind($scope, 'upload_data');

    $scope.userid = window.localStorage.getItem('user:userid');
    $scope.username = window.localStorage.getItem('user:username');

})

.controller('PatientCtrl', function($scope, $http, $localForage) {

// For button selection

    $scope.active = 'shownew';
    $scope.setActive = function(type) {
        $scope.active = type;
        console.log("Button1: "+$scope.active);
    };
    $scope.isActive = function(type) {
        return type === $scope.active;
        console.log("Button2: "+$scope.active);
    };
    $scope.checkclicked = function() {
        console.log("Button: "+$scope.active);
    };

    $scope.shouldChangeOrder = false;

    $scope.truefalse = function() {
        if ($scope.active == "shownew") {
            console.log("true");
            return "true";
        } else {
            return "false";
            console.log("false");
        }
    }

    $scope.orderdata = function() {
        // if($scope.shouldChangeOrder) {
        //     console.log("1 "+$scope.shouldChangeOrder);
        //     return "REGISTER_DATE";
        // } else {
        //     return "";
        // }
        if ($scope.active == "shownew") {
            console.log("REGISTER_DATE");
            return "REGISTER_DATE";
        } else {
            console.log("NAME");
            return "NAME";
        }
    }
    $scope.toggleOrder = function() {
        $scope.shouldChangeOrder = !$scope.shouldChangeOrder;
    }

// End - For button selection

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

    $scope.make_profile_pic = function(img){
        if(window.cordova && img)
            return cordova.file.externalDataDirectory+img;
        else {
            return $scope.profile_images = 'img/dummy-profile-pic.png';
        }
    }

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

.controller('pt20Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.continuous_pt20 = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_CONTINUE_VISIT )
            $scope.continuous_pt20 = data[$stateParams.patientID].V_CONTINUE_VISIT;
    });

    $scope.PT20Next = function(){
        console.log("CONTINUE_VISIT_1");
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CONTINUE_VISIT', $scope.continuous_pt20).then(function(){
            console.log("V_CONTINUE_VISIT");
            $state.go('tab.sp01');
        });
    }
})

.controller('sp01Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {
})

.controller('sp02Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {
})

.controller('fsummaryinitialCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.ContinuousSaveAndClose = function(){
        console.log("CONTINUE_VISIT_4");
        // UploadData.save_data_patient_id($stateParams.patientID, 'V_CONTINUE_VISIT', $scope.continuous_pt20).then(function(){
        //     console.log("CONTINUE_VISIT_4---");
        //     $state.go('tab.sp01');
        // });
            $state.go('tab.continous');
    }

})

.controller('PointCtrl', function($scope, $state, $ionicModal) {
    $scope.p01next = function(){
        console.log("p01next");
        if($scope.checkbox.p3) {
            console.log("openModal");
        }
        if($scope.radio.p1 == 'GSC')
        {
            console.log("openModal");
            $scope.openModal();
        }
        else {
            $state.go('formcontinuous.p002');
            $state.go('formcontinuous.p002');
        }
    }

    $scope.p17next = function(){
        if($scope.radio.p17 == 'GSC')
        {
            $scope.openModal();
        }
        else {
            $state.go('formcontinuous.p018');
        }
    }
    $scope.radio = {
        p1: null,
        p17: null
    }


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


    $ionicModal.fromTemplateUrl('templates/forms/wound_monitoring.html', {
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
        if(window.cordova && source[i].category_form==1)
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
                $state.go('formfirstvisit.f05');
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
            if(window.cordova && id[i].category_form==2)
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
                $state.go('formfirstvisit.f07');
                $scope.$parent.reload_upload_data();
            });
        });

    };
})
.controller('f07Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.initial_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        console.log("patient: "+$scope.initial_assessment.patient_id);
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_INITIAL_ASSESSMENT )
            $scope.initial_assessment = data[$stateParams.patientID].V_INITIAL_ASSESSMENT;
        else
        {
            $localForage.getItem('V_FIRST_VISIT').then(function(vdata){
                if(vdata && vdata['V_INITIAL_ASSESSMENT'])
                {
                    for (var i = vdata['V_INITIAL_ASSESSMENT'].length-1; i >= 0; i--) {
                        if(vdata['V_INITIAL_ASSESSMENT'][i].patient_id == $stateParams.patientID)
                        {
                            $scope.initial_assessment = vdata['V_INITIAL_ASSESSMENT'][i];
                        }
                    }
                }
            });
        }
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_INITIAL_ASSESSMENT', $scope.initial_assessment).then(function(){
            $state.go('formfirstvisit.f08');
        });
    }
})
.controller('f08Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.medical_assessment = {};
    $scope.medical_assessment.body_diagram = 'img/f08.png';

    $scope.editImage = function(){
        var img = $scope.medical_assessment.body_diagram;
        if(img.startsWith('img'))
            img = 'www/'+img;
        handdrawing.openDraw(img, function(data){
            if(data)
            {
                $scope.$apply(function () {
                    $scope.medical_assessment.body_diagram = 'file://'+data;
                    $scope.medical_assessment.tmp_hand1 = 'file://'+data;
                });
            }
        });
    };

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_MEDICAL_ASSESSMENT )
            $scope.medical_assessment = data[$stateParams.patientID].V_MEDICAL_ASSESSMENT;
    });

    $scope.saveAndNext = function(){
        var filepath = $scope.medical_assessment.body_diagram;
        var images = filepath.substr(filepath.lastIndexOf('/') + 1);

        $scope.medical_assessment.body_diagram = images;

        var patient_gallery = {};
        patient_gallery.patient_id = $stateParams.patientID;
        patient_gallery.title = 'Diagram';
        patient_gallery.gallery_type_code = "0";
        patient_gallery.gallery_status_code = "1";
        patient_gallery.description = "";
        patient_gallery.image = images;
        patient_gallery.filename = filepath;

        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', patient_gallery).then(function(){
            UploadData.save_data_patient_id($stateParams.patientID, 'V_MEDICAL_ASSESSMENT', $scope.medical_assessment).then(function(){
                $state.go('formfirstvisit.f09');
            });
        });
    }
})
.controller('f09Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.social_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_SOCIAL_ASSESSMENT )
            $scope.social_assessment = data[$stateParams.patientID].V_SOCIAL_ASSESSMENT;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_SOCIAL_ASSESSMENT', $scope.social_assessment).then(function(){
            $state.go('formfirstvisit.f10');
        });
    }
})
.controller('f10Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.general_examination = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_GENERAL_EXAMINATION )
            $scope.general_examination = data[$stateParams.patientID].V_GENERAL_EXAMINATION;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_GENERAL_EXAMINATION', $scope.general_examination).then(function(){
            $state.go('formfirstvisit.f11');
        });
    }
})
.controller('f11Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.general_examination = {};
    $scope.general_examination.respiratory_system_image = "img/f10_2.png";
    $scope.general_examination.abdomen_image = "img/f10_3.png";

    $scope.editImage = function(){
        var img = $scope.general_examination.respiratory_system_image;
        if(img.startsWith('img'))
            img = 'www/'+img;
        handdrawing.openDraw(img, function(data){
            console.log(data);
            if(data)
            {
                console.log(data);
                $scope.$apply(function () {
                    $scope.general_examination.respiratory_system_image = 'file://'+data;
                    $scope.general_examination.tmp_hand1 = 'file://'+data;
                });
            }
        });
    };

    $scope.editImage2 = function(){
        var img = $scope.general_examination.abdomen_image;
        if(img.startsWith('img'))
            img = 'www/'+img;
        handdrawing.openDraw(img, function(data){
            console.log(data);
            if(data)
            {
                $scope.$apply(function () {
                    $scope.general_examination.abdomen_image = 'file://'+data;
                    $scope.general_examination.tmp_hand2 = 'file://'+data;
                });
            }
        });
    };


    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_GENERAL_EXAMINATION )
            $scope.general_examination = data[$stateParams.patientID].V_GENERAL_EXAMINATION;
    });

    $scope.saveAndNext = function(){
        var filepath = $scope.general_examination.respiratory_system_image;
        var images = filepath.substr(filepath.lastIndexOf('/') + 1);

        var filepath2 = $scope.general_examination.abdomen_image;
        var images2 = filepath2.substr(filepath2.lastIndexOf('/') + 1);

        $scope.general_examination.respiratory_system_image = images;
        $scope.general_examination.abdomen_image = images;

        var patient_gallery = {};
        patient_gallery.patient_id = $stateParams.patientID;
        patient_gallery.title = 'Diagram';
        patient_gallery.gallery_type_code = "0";
        patient_gallery.gallery_status_code = "1";
        patient_gallery.description = "";
        patient_gallery.image = images;
        patient_gallery.filename = filepath;

        var patient_gallery2 = {};
        patient_gallery2.patient_id = $stateParams.patientID;
        patient_gallery2.title = 'Diagram';
        patient_gallery2.gallery_type_code = "0";
        patient_gallery2.gallery_status_code = "1";
        patient_gallery2.description = "";
        patient_gallery2.image = images2;
        patient_gallery2.filename = filepath2;


        UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', patient_gallery).then(function(){
            UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', patient_gallery2).then(function(){
                UploadData.save_data_patient_id($stateParams.patientID, 'V_GENERAL_EXAMINATION', $scope.general_examination).then(function(){
                    $state.go('formfirstvisit.f13');
                });
            });
        });
    }
})

.controller('p18Controller', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal) {
    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function(){
            $state.go('tab.firsttime', {patientID:$scope.$parent.patientID});
        });
    }
})

.controller('f13Controller', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal) {

    $scope.curr_medication = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_CURR_MEDICATION_CHART )
            $scope.curr_medication = data[$stateParams.patientID].V_CURR_MEDICATION_CHART;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function(){
            $state.go('tab.firsttime', {patientID:$scope.$parent.patientID});
        });
    }

    $ionicModal.fromTemplateUrl('templates/forms/f14.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.medication = {};
    $scope.saveModal = function() {
        if(!$scope.curr_medication.medications)
            $scope.curr_medication.medications = [];
        $scope.curr_medication.medications.push($scope.medication);

        $scope.modal.hide();
        return true;
    }

    $scope.openModal = function() {
        $scope.medication = {};
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
.controller('f14Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.general_examination = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_GENERAL_EXAMINATION )
            $scope.general_examination = data[$stateParams.patientID].V_GENERAL_EXAMINATION;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.general_examination).then(function(){
            $state.go('tab.f11');
        });
    }
})
.controller('e01Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.eolcp_criteria = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP )
            $scope.eolcp_criteria = data[$stateParams.patientID].V_PMT_EOLCP;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP', $scope.eolcp_criteria).then(function(){
            $state.go('tab.e02');
        });
    }
})

.controller('e02Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.eolcp_initial_pain_assessment = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_IPA )
            $scope.eolcp_initial_pain_assessment = data[$stateParams.patientID].V_PMT_EOLCP_IPA;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_IPA', $scope.eolcp_initial_pain_assessment).then(function(){
            $state.go('tab.e03');
        });
    }
})

.controller('e03Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.eolcp_comfort_measures = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_COMFORT )
            $scope.eolcp_comfort_measures = data[$stateParams.patientID].V_PMT_EOLCP_COMFORT;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_COMFORT', $scope.eolcp_comfort_measures).then(function(){
            $state.go('tab.e04');
        });
    }

})


.controller('e04Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    function extractDate(date)
    {
        console.log("extractDate: "+date);
        var mm = date.getMonth() + 1;
        mm = (mm < 10) ? '0' + mm : mm;
        var dd = date.getDate();
        dd = (dd < 10) ? '0' + dd : dd;
        var yyyy = date.getFullYear();
        var hrs = addZero(date.getHours());
        var mins = addZero(date.getMinutes());
        var secs = addZero(date.getSeconds());
        // return  dd + '-' + mm + '-' +  yyyy + ' ' + hrs + ':' + mins + ':' + secs;
        return  yyyy + '-' + mm + '-' +  dd + ' ' + hrs + ':' + mins + ':' + secs;
    }

    // new date picker
    $scope.newdate = "";

    $scope.onclick = function(){
        var options = {
            date: new Date(),
            mode: 'datetime'
        };
        datePicker.show(options, function (date) {
            console.log('date setted '+date);
            $scope.$apply(function(){
                $scope.eolcp_treatments_procedures.death_date_time = extractDate(date);
            });

        }, function (error) { // Android only
              alert('Error: ' + error);
        });
    };

    $scope.eolcp_treatments_procedures = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_TP )
            $scope.eolcp_treatments_procedures = data[$stateParams.patientID].V_PMT_EOLCP_TP;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_TP', $scope.eolcp_treatments_procedures).then(function(){
            $state.go('tab.eol');
        });
    }

})

.controller('TabMedicationCtrl', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal) {

    $scope.curr_medication = {};

    $localForage.getItem('upload_data').then(function(data){
        if( data && data[$stateParams.patientID] && data[$stateParams.patientID].V_CURR_MEDICATION_CHART )
            $scope.curr_medication = data[$stateParams.patientID].V_CURR_MEDICATION_CHART;
    });

    $scope.saveAndNext = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function(){
            $state.go('tab.firsttime', {patientID:$scope.$parent.patientID});
        });
    }

    $ionicModal.fromTemplateUrl('templates/forms/f14.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.medication = {};
    $scope.saveModal = function() {
        if(!$scope.curr_medication.medications)
            $scope.curr_medication.medications = [];
        $scope.curr_medication.medications.push($scope.medication);

        $scope.modal.hide();
        return true;
    }

    $scope.openModal = function() {
        $scope.medication = {};
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
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
