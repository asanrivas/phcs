angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.profile_images = null;

    $scope.make_profile_pic = function(img) {
        if (window.cordova && img)
            return cordova.file.externalDataDirectory + img;
        else if (window.cordova && $scope.$parent.patient.PROFILE_IMAGE)
            return cordova.file.externalDataDirectory + $scope.$parent.patient.PROFILE_IMAGE;
        else {
            return $scope.profile_images = 'img/dummy-profile-pic.png';
        }
    }

    $scope.open_loc = function(dest) {
        var url = "geo:?q=" + dest + "&z=14";
        console.log(url);
        //window.location.href = url;
        cordova.InAppBrowser.open(url, "_system");
    }

    $scope.logout = function() {
        window.localStorage.removeItem('user:userid');
        window.localStorage.removeItem('user:username');
        $state.go('login');
    };

    $scope.saveAndNext = function() {
        // console.log("patient: " + $scope.patient);
        UploadData.save_data_patient_id($stateParams.patientID, 'patients', $scope.patient).then(function() {
            $state.go('tab.home');
        });
    }
    $scope.nurse_visit = [];
    $localForage.getItem('nurse_visit').then(function(data) {
        $scope.nurse_visit = data;
    });

    $scope.nurse_name = [];
    $localForage.getItem('nurse_name').then(function(data) {
        $scope.nurse_name = data;
        // console.log("nurses: "+JSON.stringify(data));
    });

})

.controller('DashCtrl', function($scope, $localForage, $state) {
        $scope.profile_images = null;

        $scope.make_profile_pic = function(img) {
            if (window.cordova && img)
                return cordova.file.externalDataDirectory + img;
            else if (window.cordova && $scope.$parent.patient.PROFILE_IMAGE)
                return cordova.file.externalDataDirectory + $scope.$parent.patient.PROFILE_IMAGE;
            else {
                return $scope.profile_images = 'img/dummy-profile-pic.png';
            }
        }

        $scope.open_loc = function(dest) {
            var url = "geo:?q=" + dest + "&z=14";
            console.log(url);
            //window.location.href = url;
            cordova.InAppBrowser.open(url, "_system");
        }

        $scope.logout = function() {
            window.localStorage.removeItem('user:userid');
            window.localStorage.removeItem('user:username');
            $state.go('login');

        }
    })
    .controller('LoginCtrl', function($scope, $state, $localForage, $http, $ionicLoading, $ionicPopup, UploadData) {
        //$scope.signIn

        var corrad_server = window.localStorage.getItem('corrad_server');
        $scope.user = {
            username: '',
            password: ''
        }
        $scope.signIn = function(user) {
            $localForage.getItem('pruser').then(function(data) {
                if (!data) {
                    alert('data unavailable. please sync the database first');
                } else {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].USERNAME == user.username && data[i].USERPASSWORD == md5(user.password)) {
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

        $scope.sync = function(argument) {
            // body...
            corrad_server = window.localStorage.getItem('corrad_server');
            var url_get = corrad_server + 'api_generator.php?api_name=API_SYNC_MOBILE';
            $ionicLoading.show({
                template: '<ion-spinner class="spinner-energized"></ion-spinner> Loading...'
            });

            //Upload Image
            $localForage.getItem('PRO_PATIENT_GALLERY').then(function(data) {

            });

            // Upload data
            $localForage.getItem('upload_data').then(function(data) {
                if (data)


                    var send_data = {};
                if (data) {
                    send_data = data;
                }

                for (var i = 0; window.cordova && Array.isArray(send_data) && i < send_data.length; i++) {
                    // console.log(send_data[i].filename);
                    if (send_data[i] && send_data[i].PRO_PATIENT_GALLERY && Array.isArray(send_data[i].PRO_PATIENT_GALLERY)) {
                        var images = send_data[i].PRO_PATIENT_GALLERY;
                        for (var j = 0; j < images.length; j++) {
                            UploadData.upload_gallery(images[j].filename);
                        }
                    }
                }

                $http.post(url_get, send_data, {
                    timeout: 180000
                }).success(function(data) {
                    $ionicLoading.hide();
                    //success
                    if (data) {
                        $scope.error_message = false;
                        $localForage.clear();
                        $localForage.setItem("patients", reorder(data.patients, 'PATIENT_ID'));
                        $localForage.setItem("pruser", data.pruser);
                        $localForage.setItem("nurse_visit", data.nurse_visit);
                        $localForage.setItem("nurse_name", data.nurse_name);
                        $localForage.setItem("loan_equipment_list", data.loan_equipment_list);

                        var gallery = data.gallery;
                        for (var i = 0; gallery && i < gallery.length; i++) {
                            if (gallery[i].IMAGE) {
                                gallery[i].filename = gallery[i].IMAGE.substr(gallery[i].IMAGE.lastIndexOf('/') + 1);

                                //download for each picture;
                                if (window.cordova)
                                    UploadData.download_gallery(gallery[i].filename);
                            }
                        }
                        if(window.cordova)
                            UploadData.clear_directory(cordova.file.externalRootDirectory+".handdrawing");

                        $localForage.setItem("PRO_PATIENT_GALLERY", gallery);
                        $localForage.setItem("V_FIRST_VISIT", data.first_visit);
                        // $localForage.setItem("V_PMT_EOLCP", data.first_visit);
                        // $localForage.setItem("V_PMT_EOLCP_IPA", data.first_visit);
                        // $localForage.setItem("V_EOLCP_COMFORT_MEASURES", data.first_visit);
                        // $localForage.setItem("V_EOLCP_TREATMENTS_PROCEDURES", data.first_visit);
                    }
                }).error(function(error, status, headers, config) {
                    $scope.error_message = "Unable to connect the server.";
                    $ionicLoading.hide();
                    switch (status) {
                        case '404':
                            $scope.changeUrl();
                            break;
                        default:
                            $scope.showConfirm();

                    }
                    console.log(error + " " + status);
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
                if (res) {
                    $localForage.clear();
                    console.log('You are sure');
                } else {
                    console.log('You are not sure');
                }
            });
        };

        $scope.changeUrl = function() {
            $scope.input_corrad_server = corrad_server;
            var confirmPopup = $ionicPopup.confirm({
                title: 'Change server database',
                template: '<input type="text" ng-model="input_corrad_server"/>'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    window.localStorage.set('corrad_server', $scope.corrad_server);
                    $scope.sync();
                } else {
                    console.log('false');
                }
            });
        };


        //need to reorder data if by key
        function reorder(data, key) {
            for (var i = 0, emp, array = []; i < data.length; i++) {
                emp = data[i];
                array[emp[key]] = emp;
            }

            return array;
        }

    })
    .controller('FirstTimeCtrl', function($scope, UploadData, $rootScope) {
        $scope.status = {};
        var patientID = $scope.$parent.patientID

        if($rootScope.visit_data.admission)
            $scope.status.f04 = true;
        if($rootScope.visit_data.photog)
            $scope.status.f05 = true;

        UploadData.data_selector(patientID, 'V_INITIAL_ASSESSMENT', 'V_FIRST_VISIT', false).then(function(data) {
            if(data)
                $scope.status.initial_assessment = true;
        });
        UploadData.data_selector(patientID, 'V_MEDICAL_ASSESSMENT', 'V_FIRST_VISIT', false).then(function(data) {
            if(data)
                $scope.status.medical_assessment = true;
        });
        UploadData.data_selector(patientID, 'V_SOCIAL_ASSESSMENT', 'V_FIRST_VISIT', false).then(function(data) {
            if(data)
                $scope.status.social_assessment = true;
        });
        UploadData.data_selector(patientID, 'V_GENERAL_EXAMINATION', 'V_FIRST_VISIT', false).then(function(data) {
            if(data)
                $scope.status.general_examination = true;
        });
        UploadData.data_selector(patientID, 'V_GENERAL_EXAMINATION', 'V_FIRST_VISIT', false).then(function(data) {
            if(data&&(data.respiratory_system_image||data.abdomen_image))
                $scope.status.general_examination2 = true;
        });
        UploadData.data_selector(patientID, 'V_CURR_MEDICATION_CHART', 'V_FIRST_VISIT', false).then(function(data) {
            if(data)
                $scope.status.curr_medication = true;
        });
    })
    .controller('ContinuousCtrl', function($scope) {})
    .controller('FormContinuousCtrl', function($scope) {})

.controller('TabGalleryCtrl', function($scope, Camera, $localForage, $stateParams, $ionicModal, UploadData) {
        $scope.items = [];

        $scope.getPhoto = function() {
            // $scope.openModal();
            Camera.getPhoto().then(function(data) {
                $scope.photoURL = data.nativeURL;
                $scope.filename = data.name;
                $scope.openModal();
            }, function() {

            })
        }

        $scope.patient_gallery = {};

        $scope.db_gallery = [];
        $localForage.getItem('PRO_PATIENT_GALLERY').then(function(data) {
            if (!data) return;
            for (var i = 0; i < data.length; i++) {
                if (!data[i]) return;
                if (data[i].PATIENT_ID == $stateParams.patientID && data[i].filename) {
                    if(window.cordova)
                        data[i].fullname = cordova.file.externalDataDirectory + data[i].filename
                    $scope.db_gallery.push(data[i]);
                }

            }
        });

        $scope.savePhoto = function() {
            $scope.patient_gallery.patient_id = $stateParams.patientID;
            $scope.patient_gallery.image = $scope.filename;
            $scope.patient_gallery.filename = $scope.photoURL; //'img/ionic.png';//

            UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function(data) {
                console.log(data);
                var images = data[$scope.patientID].PRO_PATIENT_GALLERY;
                var found_pic = false;
                for (var i = images.length - 1; i >= 0; i--) {
                    if (images[i] && images[i].gallery_type_code == "5") {
                        found_pic = true;
                        // $scope.$parent.upload_data[$scope.patientID]['profile_images'] = images[i].image;
                        UploadData.save_data_patient_id($stateParams.patientID, 'profile_images', images[i].image).then(function() {
                            $scope.$parent.reload_upload_data();
                            $scope.closeModal();
                        });

                        break;
                    }
                }

                if (!found_pic) {
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

        $scope.previewImage = function(src) {
            $scope.previewImageSrc = src;
            $scope.preview.show();
        };

    })
    .controller('TabCtrl', function($scope, $stateParams, $localForage, $rootScope, $ionicModal) {
        $scope.patientID = parseInt($stateParams.patientID);
        // $scope.patients = [];
        $scope.patient = {};

        $localForage.getItem('patients').then(function(dataf) {
            $scope.patients = dataf;
            $scope.patient = $scope.patients[parseInt($stateParams.patientID)];
            if($scope.patient.CATEGORY_CODE=="04")
                $scope.setting.eol = true;
        });

        $scope.$watch('upload_data', function(newValue, oldValue) {
            if(newValue[$stateParams.patientID] && newValue[$stateParams.patientID].patients)
            $scope.patient = newValue[$stateParams.patientID].patients;
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (fromState.name == "patient") {
                $scope.patient = $scope.patients[parseInt(toParams.patientID)];
            }
        });

        $scope.setting = {
            eol: false
        };

        if(!$rootScope.visit_data)
            $rootScope.visit_data = {};

        $localForage.getItem('V_FIRST_VISIT').then(function(data) {
            if(data && data.first_visit)
            {
                for (var i = data.first_visit.length-1; i >= 0; i--) {
                    if($scope.patientID==data.first_visit[i].PATIENT_ID)
                    {
                        if(data.first_visit[i].CATEGORY_FORM == "1" && !$scope.visit_data.admission)
                            $rootScope.visit_data.admission = data.first_visit[i];
                        else if(data.first_visit[i].CATEGORY_FORM == "2" && !$scope.visit_data.photog)
                            $rootScope.visit_data.photog = data.first_visit[i];

                    }
                }
            }
        });

        // Load upload data
        $scope.upload_data = [];
        // $localForage.getItem('upload_data').then(function(data){
        //     if(data)
        //         $scope.upload_data = data;
        // });
        $localForage.bind($scope, 'upload_data');

        $scope.reload_upload_data = function() {
            $localForage.bind($scope, 'upload_data');
            console.log('refresher');

        };
    })
    .controller('FormFirstVisitCtrl', function($scope, $stateParams, $localForage, $ionicModal) {
        $scope.patientID = $stateParams.patientID;
        $scope.patient = [];
        $localForage.getItem('patients').then(function(dataf) {
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
        // console.log("Button1: "+$scope.active);
    };
    $scope.isActive = function(type) {
        return type === $scope.active;
        // console.log("Button2: "+$scope.active);
    };
    $scope.checkclicked = function() {
        // console.log("Button: "+$scope.active);
    };

    $scope.shouldChangeOrder = false;

    $scope.truefalse = function() {
        if ($scope.active == "shownew") {
            // console.log("true");
            return "true";
        } else {
            return "false";
            // console.log("false");
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
            // console.log("REGISTER_DATE");
            return "REGISTER_DATE";
        } else {
            // console.log("NAME");
            return "NAME";
        }
    }
    $scope.toggleOrder = function() {
        $scope.shouldChangeOrder = !$scope.shouldChangeOrder;
    }

    // End - For button selection

    $localForage.getItem('patients').then(function(dataf) {
        if (!dataf) {
            $http.get('http://api.randomuser.me/', {
                params: {
                    'results': 10
                }
            }).success(function(data) {
                $scope.patients = data.results;
                $localForage.setItem("patients", data.results);
            });
            console.log('data taken from random');
        } else {
            $scope.patients = dataf;
        }

    });

    $scope.make_profile_pic = function(img) {
        if (window.cordova && img)
            return cordova.file.externalDataDirectory + img;
        else {
            return $scope.profile_images = 'img/dummy-profile-pic.png';
        }
    }

    $scope.upload_data = [];
    $localForage.getItem('upload_data').then(function(data) {
        if (data)
            $scope.upload_data = data;
    });

    $scope.remove = function(chat) {
        Chats.remove(chat);
    }

    $scope.ExcelDateToJSDate = function(serial) {
        return serial / 65536 % 100;
    }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('pt20Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.continuous_pt20 = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_CONTINUE_VISIT)
            $scope.continuous_pt20 = data[$stateParams.patientID].V_CONTINUE_VISIT;
    });

    $scope.continuous_stages = function() {
        // console.log("SaveAndClose");
        // UploadData.save_data_patient_id($stateParams.patientID, 'V_SUMMARY_INITIAL', $scope.continuous_summary).then(function() {
            $state.go('tab.stages');
        // });
    }

    $scope.GSC_change = function() {
        if ($scope.continuous_pt20.neurological.glasgow_coma_scale) {
            $state.go('tab.glasgow');
            // console.log("GCS: "+$scope.continuous_pt20.neurological.glasgow_coma_scale);
        } else {
            // if (data[$stateParams.patientID].V_GSC) {
                $localForage.getItem('upload_data').then(function(data){
                    delete data[$stateParams.patientID]['V_GSC'];
                    $localForage.setItem('upload_data', data);
                })
            // if ($scope.$parent.upload_data[$scope.$parent.patientID].V_GSC) {
            //     // save_wound = true;
            //     $localForage.getItem('upload_data').then(function(data){
            //         delete data[$stateParams.patientID]['V_GSC'];
            //         $localForage.setItem('upload_data', data);
            //     })

            // };

        };
    };

    $scope.GSCP17_change = function() {
        if ($scope.continuous_pt20.mobilization.weakness_GSC) {
            $state.go('tab.glasgow_p17');
            // console.log("GCS: "+$scope.continuous_pt20.neurological.glasgow_coma_scale);
        } else {
            // if (data[$stateParams.patientID].V_GSC) {
                $localForage.getItem('upload_data').then(function(data){
                    delete data[$stateParams.patientID]['V_GSC_MOBILIZATION'];
                    $localForage.setItem('upload_data', data);
                })
            // if ($scope.$parent.upload_data[$scope.$parent.patientID].V_GSC) {
            //     // save_wound = true;
            //     $localForage.getItem('upload_data').then(function(data){
            //         delete data[$stateParams.patientID]['V_GSC'];
            //         $localForage.setItem('upload_data', data);
            //     })

            // };

        };
    };

    $scope.PT20Next = function() {
        console.log("PT20Next: " + JSON.stringify($scope.continuous_pt20));
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CONTINUE_VISIT', $scope.continuous_pt20).then(function() {
            $scope.$parent.reload_upload_data();
            $state.go('tab.sp01');
        });

    }

    $scope.open_wound = function(item) {
        // console.log("open_wound: "+item);
        $localForage.getItem('upload_data').then(function(data){
            var save_wound = false;
        switch (item) {
            case 'no_wound':
                switch ($scope.continuous_pt20.wound.no_wound) {
                    case true:
                        console.log('no_wound: '+$scope.continuous_pt20.wound.no_wound);
                        delete data[$stateParams.patientID]['V_WOUND'].post_op_wound;
                        delete data[$stateParams.patientID]['V_WOUND'].pressure;
                        delete data[$stateParams.patientID]['V_WOUND'].fumigating;
                        delete data[$stateParams.patientID]['V_WOUND'].redness;
                        delete data[$stateParams.patientID]['V_WOUND'].partial_thickness;
                        delete data[$stateParams.patientID]['V_WOUND'].full_thickness;
                        delete data[$stateParams.patientID]['V_WOUND'].cavity;
                        delete data[$stateParams.patientID]['V_WOUND'].unstageble;
                        delete data[$stateParams.patientID]['V_WOUND'].clean;
                        delete data[$stateParams.patientID]['V_WOUND'].granulating;
                        delete data[$stateParams.patientID]['V_WOUND'].odor;
                        delete data[$stateParams.patientID]['V_WOUND'].exudations;
                        delete data[$stateParams.patientID]['V_WOUND'].bleeding;
                        delete data[$stateParams.patientID]['V_WOUND'].sloughs;
                        save_wound = true;
                        break;
                };
            case 'post_op_wound':
                switch ($scope.continuous_pt20.wound.post_op_wound) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].post_op_wound;
                        save_wound = true;
                        break;
                };
            case 'pressure':
                switch ($scope.continuous_pt20.wound.pressure) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].pressure;
                        save_wound = true;
                        break;
                };
            case 'fumigating':
                switch ($scope.continuous_pt20.wound.fumigating) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].fumigating;
                        save_wound = true;
                        break;
                };
            case 'redness':
                switch ($scope.continuous_pt20.wound.redness) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].redness;
                        save_wound = true;
                        break;
                };
            case 'partial_thickness':
                switch ($scope.continuous_pt20.wound.partial_thickness) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].partial_thickness;
                        save_wound = true;
                        break;
                };
            case 'full_thickness':
                switch ($scope.continuous_pt20.wound.full_thickness) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].full_thickness;
                        save_wound = true;
                        break;
                };
            case 'cavity':
                switch ($scope.continuous_pt20.wound.cavity) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].cavity;
                        save_wound = true;
                        break;
                };
            case 'unstageble':
                switch ($scope.continuous_pt20.wound.unstageble) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].unstageble;
                        save_wound = true;
                        break;
                };
            case 'clean':
                switch ($scope.continuous_pt20.wound.clean) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].clean;
                        save_wound = true;
                        break;
                };
            case 'granulating':
                switch ($scope.continuous_pt20.wound.granulating) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].granulating;
                        save_wound = true;
                        break;
                };
            case 'odor':
                switch ($scope.continuous_pt20.wound.odor) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].odor;
                        save_wound = true;
                        break;
                };
            case 'exudations':
                switch ($scope.continuous_pt20.wound.exudations) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].exudations;
                        save_wound = true;
                        break;
                };
            case 'bleeding':
                switch ($scope.continuous_pt20.wound.bleeding) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].bleeding;
                        save_wound = true;
                        break;
                };
            case 'sloughs':
                switch ($scope.continuous_pt20.wound.sloughs) {
                    case true:
                        $state.go('tab.wound', {
                            woundtype: item
                        });
                        break;
                    case false:
                        delete data[$stateParams.patientID]['V_WOUND'].sloughs;
                        save_wound = true;
                        break;
                };

            };

            //save wound
            UploadData.save_data_patient_id($stateParams.patientID, 'V_WOUND', data);
        })


        // // console.log("open_wound: "+item);
        // $state.go('tab.wound', {
        //     woundtype: item
        // });
        // // console.log(this);
    }
})

.controller('glasgowCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.gsc = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_GSC)
            $scope.gsc = data[$stateParams.patientID].V_GSC;
    });

    $scope.save_glasgow = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_GSC', $scope.gsc).then(function() {
            $state.go('tab.continuouspt20');
        });
    }
})

.controller('glasgowp17Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.gsc_mobilization = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_GSC_MOBILIZATION)
            $scope.gsc_mobilization = data[$stateParams.patientID].V_GSC_MOBILIZATION;
    });

    $scope.save_glasgow = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_GSC_MOBILIZATION', $scope.gsc_mobilization).then(function() {
            $state.go('tab.continuouspt20');
        });
    }
})

.controller('stagesCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.continuous_stages = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_WOUND_MONITORING_STAGES)
            $scope.continuous_stages = data[$stateParams.patientID].V_WOUND_MONITORING_STAGES;
    });

    $scope.SaveAndClose = function(){
        UploadData.save_data_patient_id($stateParams.patientID, 'V_WOUND_MONITORING_STAGES', $scope.continuous_stages).then(function(){
            $state.go('tab.continuouspt20');
        });
    }
})


.controller('woundCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.wound = {
        itemtype: $stateParams.woundtype
    };
    $scope.allwound = {};
    var is_edit = false;
    var patientid = $stateParams.patientID;
    $localForage.getItem('upload_data').then(function(data) {
        if (data[patientid] && data[patientid]['V_WOUND']) {
            $scope.allwound = data[patientid]['V_WOUND'];
            if (data[patientid]['V_WOUND'][$stateParams.woundtype]) {
                $scope.wound = data[patientid]['V_WOUND'][$stateParams.woundtype];
                is_edit = true;
            }
        } else if (data[patientid]) {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_WOUND', $scope.allwound);
        }
    });

    $scope.save_wound = function() {
        $scope.allwound.patient_id = $stateParams.patientID;
        $scope.allwound[$stateParams.woundtype] = $scope.wound;
        UploadData.save_data_patient_id($stateParams.patientID, 'V_WOUND', $scope.allwound).then(function() {
            $state.go('tab.continuouspt20');
        });
    }
})

.controller('sp01Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.continuous_sp01 = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_SPECIAL_MENTION)
            $scope.continuous_sp01 = data[$stateParams.patientID].V_SPECIAL_MENTION;
    });

    $scope.SP01Next = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_SPECIAL_MENTION', $scope.continuous_sp01).then(function() {
            $state.go('tab.sp02');
        });
    }

})

.controller('sp02Ctrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.continuous_sp02 = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_SPECIAL_INSTRUCTION)
            $scope.continuous_sp02 = data[$stateParams.patientID].V_SPECIAL_INSTRUCTION;
    });

    $scope.SP02Next = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_SPECIAL_INSTRUCTION', $scope.continuous_sp02).then(function() {
            // $state.go('tab.summary_initial');
            $state.go('tab.summary_initial');
        });
    };

})

.controller('summary_initialCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.continuous_summary = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_SUMMARY_INITIAL)
            $scope.continuous_summary = data[$stateParams.patientID].V_SUMMARY_INITIAL;
    });

    $scope.SaveAndClose = function() {
        // console.log("SaveAndClose");
        UploadData.save_data_patient_id($stateParams.patientID, 'V_SUMMARY_INITIAL', $scope.continuous_summary).then(function() {
            $state.go('tab.continous');
        });
    };

})

.controller('fsummaryinitialCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.ContinuousSaveAndClose = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CONTINUE_VISIT', $scope.continuous_summary).then(function() {
            console.log("CONTINUE_VISIT_4---");
            $state.go('tab.continuous');
        });
    }

})

.controller('PointCtrl', function($scope, $state, $ionicModal) {
        $scope.p01next = function() {
            console.log("p01next");
            if ($scope.checkbox.p3) {
                console.log("openModal");
            }
            if ($scope.radio.p1 == 'GSC') {
                console.log("openModal");
                $scope.openModal();
            } else {
                $state.go('formcontinuous.p002');
                $state.go('formcontinuous.p002');
            }
        }

        $scope.p17next = function() {
            if ($scope.radio.p17 == 'GSC') {
                $scope.openModal();
            } else {
                $state.go('formcontinuous.p018');
            }
        }
        $scope.radio = {
            p1: null,
            p17: null
        }

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
    .controller('f04Controller', function($scope, $stateParams, $state, UploadData, Camera, $rootScope) {
        $scope.getPhoto = function() {
            console.log('Getting camera');
            Camera.getPhoto().then(function(data) {
                $scope.lastPhoto = data.nativeURL;
                $scope.filename = data.name;
            }, function() {

            })
        };
        $scope.patient_gallery = {};
        $scope.first_visit = {};

        if(window.cordova && $rootScope.visit_data && $rootScope.visit_data.admission)
        {
            $scope.lastPhoto = cordova.file.externalDataDirectory + $rootScope.visit_data.admission.IMAGE_FORM.replace('upload/', '');
        }

        $scope.save = function() {
            $scope.patient_gallery.patient_id = $stateParams.patientID;
            $scope.patient_gallery.title = 'Consent of Admission Release & Indemity Form';
            $scope.patient_gallery.gallery_type_code = "1";
            $scope.patient_gallery.gallery_status_code = "1";
            $scope.patient_gallery.description = "";
            $scope.patient_gallery.image = $scope.filename;
            $scope.patient_gallery.filename = $scope.lastPhoto;

            $scope.first_visit.PATIENT_ID = $stateParams.patientID;
            $scope.first_visit.IMAGE_FORM = $scope.filename;
            $scope.first_visit.CATEGORY_FORM = 1;

            UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function() {
                UploadData.append_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function() {
                    $state.go('formfirstvisit.f05');
                    $rootScope.visit_data.admission = $scope.first_visit;
                });
            });

        };
    })
    .controller('f05Controller', function($scope, $stateParams, $state, UploadData, Camera, $localForage, $rootScope) {
        $scope.getPhoto = function() {
            console.log('Getting camera');
            Camera.getPhoto().then(function(data) {
                $scope.lastPhoto = data.nativeURL;
                $scope.filename = data.name;
            }, function() {

            })
        };
        $scope.patient_gallery = {};
        $scope.first_visit = {};

        if(window.cordova && $rootScope.visit_data && $rootScope.visit_data.photog)
        {
            $scope.lastPhoto = cordova.file.externalDataDirectory + $rootScope.visit_data.photog.IMAGE_FORM.replace('upload/', '');
        }

        $scope.save = function() {
            $scope.patient_gallery.patient_id = $stateParams.patientID;
            $scope.patient_gallery.title = 'Declaration of Photographic/Media Consent';
            $scope.patient_gallery.gallery_type_code = "2";
            $scope.patient_gallery.gallery_status_code = "1";
            $scope.patient_gallery.description = "";
            $scope.patient_gallery.image = $scope.filename;
            $scope.patient_gallery.filename = $scope.lastPhoto;

            $scope.first_visit.PATIENT_ID = $stateParams.patientID;
            $scope.first_visit.IMAGE_FORM = $scope.filename;
            $scope.first_visit.CATEGORY_FORM = 2;

            UploadData.append_data_patient_id($stateParams.patientID, 'PRO_PATIENT_GALLERY', $scope.patient_gallery).then(function() {
                UploadData.append_data_patient_id($stateParams.patientID, 'V_FIRST_VISIT', $scope.first_visit).then(function() {
                    $state.go('formfirstvisit.f07');
                    $rootScope.visit_data.photog = $scope.first_visit;
                });
            });

        };
    })
    .controller('f07Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
        $scope.initial_assessment = {};

        UploadData.data_selector($stateParams.patientID, 'V_INITIAL_ASSESSMENT', 'V_FIRST_VISIT').then(function(data) {
            if(!(data.date_initial instanceof Date))
                data.date_initial = new Date(data.date_initial);
            $scope.initial_assessment = data;
            // body...
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_INITIAL_ASSESSMENT', $scope.initial_assessment).then(function() {
                $state.go('formfirstvisit.f08');
            });
        }
    })
    .controller('f08Controller', function($scope, $stateParams, $state, UploadData, $localForage, Canvas) {

        $scope.medical_assessment = {};
        $scope.img_default = 'img/f08.png';
        $scope.medical_assessment.body_diagram = $scope.img_default;
        $scope.$on('$ionicView.enter', function(e) {
            Canvas.init($scope, $scope.img_default);
        });

        $scope.editImage = function(reload) {

            var img = $scope.medical_assessment.body_diagram;
            if(reload)
                img = $scope.img_default;
            if (img.startsWith('img'))
                img = 'www/' + img;
            else if($scope.medical_assessment.tmp_hand1)
                img = $scope.medical_assessment.tmp_hand1;

            Canvas.open(img, $scope.img_default).then(function(data){
                $scope.medical_assessment.body_diagram = data;
                $scope.medical_assessment.tmp_hand1 = data;
            });
        };

        UploadData.data_selector($stateParams.patientID, 'V_MEDICAL_ASSESSMENT', 'V_FIRST_VISIT').then(function (data) {
            angular.extend($scope.medical_assessment, data);
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_MEDICAL_ASSESSMENT', $scope.medical_assessment).then(function() {
                $state.go('formfirstvisit.f09');
            });
        }
    })
    .controller('f09Controller', function($scope, $stateParams, $state, UploadData, $localForage, Canvas) {
        $scope.social_assessment = {};
        $scope.img_default = 'img/f09.png'
        $scope.social_assessment.family_tree = $scope.img_default;
        $scope.$on('$ionicView.enter', function(e) {
            Canvas.init($scope, $scope.img_default);
        });
        $scope.editImage = function(reload) {
            var img = $scope.social_assessment.family_tree;
            if(reload)
                img = $scope.img_default;
            if (img.startsWith('img'))
                img = 'www/' + img;
            else if($scope.social_assessment.tmp_hand1)
                img = $scope.social_assessment.tmp_hand1;

            Canvas.open(img, $scope.img_default).then(function(data){
                $scope.social_assessment.family_tree = data;
                $scope.social_assessment.tmp_hand1 = data;
            });
        };

        UploadData.data_selector($stateParams.patientID, 'V_SOCIAL_ASSESSMENT', 'V_FIRST_VISIT').then(function (data) {
            angular.extend($scope.social_assessment, data);
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_SOCIAL_ASSESSMENT', $scope.social_assessment).then(function() {
                $state.go('formfirstvisit.f10');
            });
        }
    })
    .controller('f10Controller', function($scope, $stateParams, $state, UploadData, $localForage) {
        $scope.general_examination = {};

        UploadData.data_selector($stateParams.patientID, 'V_GENERAL_EXAMINATION', 'V_FIRST_VISIT').then(function (data) {
            $scope.general_examination = data;
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_GENERAL_EXAMINATION', $scope.general_examination).then(function() {
                $state.go('formfirstvisit.f11');
            });
        }
    })
    .controller('f11Controller', function($scope, $stateParams, $state, UploadData, $localForage, Canvas) {

        $scope.general_examination = {};
        $scope.img_default = "img/f11.png";
        $scope.general_examination.respiratory_system_image = $scope.img_default;
        $scope.$on('$ionicView.enter', function(e) {
            Canvas.init($scope, $scope.img_default);
        });

        UploadData.data_selector($stateParams.patientID, 'V_GENERAL_EXAMINATION', 'V_FIRST_VISIT').then(function (data) {
            angular.extend($scope.general_examination, data);
        });

        $scope.editImage = function(reload) {

            var img = $scope.general_examination.respiratory_system_image;
            if(reload)
                img = $scope.img_default[0];
            if (img.startsWith('img'))
                img = 'www/' + img;
            else if($scope.general_examination.tmp_hand1)
                img = $scope.general_examination.tmp_hand1;

            Canvas.open(img).then(function(data){
                $scope.general_examination.respiratory_system_image = data;
                $scope.general_examination.tmp_hand1 = data;
            });

        };


        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_GENERAL_EXAMINATION', $scope.general_examination).then(function() {
                $state.go('formfirstvisit.f13');
            });
        }
    })

.controller('p18Controller', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal) {
    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function() {
            $state.go('tab.firsttime', {
                patientID: $scope.$parent.patientID
            });
        });
    }
})

.controller('f13Controller', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal, $ionicPopup) {

        $scope.curr_medication = {};
        $scope.drug_medication = [];

        $localForage.getItem('V_FIRST_VISIT').then(function(data) {
            if(data && data.V_CURR_MEDICATION_DRUG)
            {
                for (var i = data.V_CURR_MEDICATION_DRUG.length-1; i >= 0; i--) {
                    if($scope.patientID==data.V_CURR_MEDICATION_DRUG[i].patient_id)
                    {
                        $scope.drug_medication.push(data.V_CURR_MEDICATION_DRUG[i]);
                    }
                }
            }
        });


        UploadData.data_selector($stateParams.patientID, 'V_CURR_MEDICATION_CHART', 'V_FIRST_VISIT').then(function (data) {
            $scope.curr_medication = data;
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function() {
                $state.go('tab.firsttime', {
                    patientID: $scope.$parent.patientID
                });
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
            if (!$scope.curr_medication.medications)
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

        $scope.deleteItem = function(index) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Remove medication',
                template: 'Are you sure you want remove this medication?'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    $scope.curr_medication.medications.splice(index, 1)
                } else {
                    console.log('You are not sure');
                }
            });
        };
    })
    .controller('e01Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

        $scope.eolcp_criteria = {};

        $localForage.getItem('upload_data').then(function(data) {
            if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP)
                $scope.eolcp_criteria = data[$stateParams.patientID].V_PMT_EOLCP;
        });

        $scope.saveAndNext = function() {
            UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP', $scope.eolcp_criteria).then(function() {
                $state.go('tab.e02');
            });
        }
    })

.controller('e02Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.eolcp_initial_pain_assessment = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_IPA)
            $scope.eolcp_initial_pain_assessment = data[$stateParams.patientID].V_PMT_EOLCP_IPA;
    });

    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_IPA', $scope.eolcp_initial_pain_assessment).then(function() {
            $state.go('tab.e03');
        });
    }
})

.controller('e03Controller', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.eolcp_comfort_measures = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_COMFORT)
            $scope.eolcp_comfort_measures = data[$stateParams.patientID].V_PMT_EOLCP_COMFORT;
    });

    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_COMFORT', $scope.eolcp_comfort_measures).then(function() {
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

    function extractDate(date) {
        console.log("extractDate: " + date);
        var mm = date.getMonth() + 1;
        mm = (mm < 10) ? '0' + mm : mm;
        var dd = date.getDate();
        dd = (dd < 10) ? '0' + dd : dd;
        var yyyy = date.getFullYear();
        var hrs = addZero(date.getHours());
        var mins = addZero(date.getMinutes());
        var secs = addZero(date.getSeconds());
        // return  dd + '-' + mm + '-' +  yyyy + ' ' + hrs + ':' + mins + ':' + secs;
        return yyyy + '-' + mm + '-' + dd + ' ' + hrs + ':' + mins + ':' + secs;
    }

    // new date picker
    $scope.newdate = "";

    $scope.onclick = function() {
        var options = {
            date: new Date(),
            mode: 'datetime'
        };
        datePicker.show(options, function(date) {
            console.log('date setted ' + date);
            $scope.$apply(function() {
                $scope.eolcp_treatments_procedures.death_date_time = extractDate(date);

            });

        }, function(error) { // Android only
            alert('Error: ' + error);
        });
    };

    $scope.newdate = "";

    $scope.onclick = function() {
        var options = {
            date: new Date(),
            mode: 'datetime'
        };
        datePicker.show(options, function(date) {
            console.log('date setted ' + date);
            $scope.$apply(function() {
                $scope.continuous_summary.date_time = extractDate(date);
            });

        }, function(error) { // Android only
            alert('Error: ' + error);
        });
    };

    $scope.eolcp_treatments_procedures = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_EOLCP_TP)
            $scope.eolcp_treatments_procedures = data[$stateParams.patientID].V_PMT_EOLCP_TP;
    });

    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_EOLCP_TP', $scope.eolcp_treatments_procedures).then(function() {
            $state.go('tab.eol');
        });
    }

})

.controller('TabMedicationCtrl', function($scope, $stateParams, $state, UploadData, $localForage, $ionicModal, $ionicPopup) {

//Important: Compare this with f13Controller
    $scope.curr_medication = {};
    $scope.drug_medication = [];

    // $localForage.getItem('upload_data').then(function(data) {
    //     if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_CURR_MEDICATION_CHART)
    //         $scope.curr_medication = data[$stateParams.patientID].V_CURR_MEDICATION_CHART;
    // });

        $localForage.getItem('V_FIRST_VISIT').then(function(data) {
            if(data && data.V_CURR_MEDICATION_DRUG)
            {
                for (var i = data.V_CURR_MEDICATION_DRUG.length-1; i >= 0; i--) {
                    if($scope.patientID==data.V_CURR_MEDICATION_DRUG[i].patient_id)
                    {
                        $scope.drug_medication.push(data.V_CURR_MEDICATION_DRUG[i]);
                    }
                }
            }
        });

        UploadData.data_selector($stateParams.patientID, 'V_CURR_MEDICATION_CHART', 'V_FIRST_VISIT').then(function (data) {
            $scope.curr_medication = data;
        });

    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'V_CURR_MEDICATION_CHART', $scope.curr_medication).then(function() {
            $state.go('tab.eol', {
                patientID: $scope.$parent.patientID
            });
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
        if (!$scope.curr_medication.medications)
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

        $scope.deleteItem = function(index) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Remove medication',
                template: 'Are you sure you want remove this medication?'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    $scope.curr_medication.medications.splice(index, 1)
                } else {
                    console.log('You are not sure');
                }
            });
        };

})

.controller('ContinousCtrl', function($scope) {
    $scope.status = {};
    $scope.$on('$ionicView.enter', function(e) {
 if (($scope.$parent.upload_data[$scope.$parent.patientID]) && ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT)) {
        // console.log("abc: "+$scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT);
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.neurological)
            $scope.status.neurological = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.emotional)
            $scope.status.emotional = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.spiritual)
            $scope.status.spiritual = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.comfort)
            $scope.status.comfort = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.sleeping)
            $scope.status.sleeping = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.breathing)
            $scope.status.breathing = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.circulation)
            $scope.status.circulation = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.temperature)
            $scope.status.temperature = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.oral_mouth)
            $scope.status.oral_mouth = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.nutrition)
            $scope.status.nutrition = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.elimination_bowel)
            $scope.status.elimination_bowel = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.elimination_bladder)
            $scope.status.elimination_bladder = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.skin)
            $scope.status.skin = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.wound)
            $scope.status.wound = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.activities)
            $scope.status.activities = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.life_issue)
            $scope.status.life_issue = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.client_support_issue)
            $scope.status.client_support_issue = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.mobilization)
            $scope.status.mobilization = true;
        if ($scope.$parent.upload_data[$scope.$parent.patientID].V_CONTINUE_VISIT.palliative_msg_therapy)
            $scope.status.palliative_msg_therapy = true;
    }
    });

    // console.log("xyz: "+$scope.$parent.upload_data[$scope.$parent.patientID]);



})

.controller('pmt_mrfCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.pmt_mrf = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_MRF)
            $scope.pmt_mrf = data[$stateParams.patientID].V_PMT_MRF;
    });

    $scope.mrfsave = function() {
        console.log("mrfsave: " + JSON.stringify($scope.pmt_mrf));
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_MRF', $scope.pmt_mrf).then(function() {
            $scope.$parent.reload_upload_data();
            $state.go('tab.complimentary');
        });
    }

})

.controller('pmt_ctCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.pmt_ct = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_CT)
            $scope.pmt_ct = data[$stateParams.patientID].V_PMT_CT;
    });

    $scope.ctsave = function() {
        console.log("ctsave: " + JSON.stringify($scope.pmt_ct));
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_CT', $scope.pmt_ct).then(function() {
            $scope.$parent.reload_upload_data();
            $state.go('tab.pmt_diagram');
        });
    }

})

.controller('pmt_diagramCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {
    $scope.pmt_diagram = {};

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].V_PMT_DIAGRAM)
            $scope.pmt_diagram = data[$stateParams.patientID].V_PMT_DIAGRAM;
    });

    $scope.diagramsave = function() {
        console.log("diagramsave: " + JSON.stringify($scope.pmt_diagram));
        UploadData.save_data_patient_id($stateParams.patientID, 'V_PMT_DIAGRAM', $scope.pmt_diagram).then(function() {
            $scope.$parent.reload_upload_data();
            $state.go('tab.pmt');
        });
    }

})

.controller('PMTControl', function($scope) {
    $scope.status = {};
    $scope.$on('$ionicView.enter', function(e) {
        if ($scope.$parent.upload_data[$scope.$parent.patientID]) {
            // console.log("MRF: "+$scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_MRF);
            // console.log("CT: "+$scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_CT);
            // console.log("DIAGRAM: "+$scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_DIAGRAM);
            if ($scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_MRF)
                $scope.status.mrf = true;
            if ($scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_CT)
                $scope.status.ct = true;
            if ($scope.$parent.upload_data[$scope.$parent.patientID].V_PMT_DIAGRAM)
                $scope.status.diagram = true;
        }
    });
})

.controller('LoanEquipmentCtrl', function($scope, $stateParams, $state, UploadData, $localForage) {

    $scope.equipmentloan = {};

    $scope.loan_equipment_list = [];
    $localForage.getItem('loan_equipment_list').then(function(data) {
        $scope.loan_equipment_list = data;
        // console.log("loan_equipment_list: "+JSON.stringify(data));
    });

    $localForage.getItem('upload_data').then(function(data) {
        if (data && data[$stateParams.patientID] && data[$stateParams.patientID].PRO_EQUIPMENT_LOAN)
            $scope.equipmentloan = data[$stateParams.patientID].PRO_EQUIPMENT_LOAN;
    });

    $scope.saveAndNext = function() {
        UploadData.save_data_patient_id($stateParams.patientID, 'PRO_EQUIPMENT_LOAN', $scope.equipmentloan).then(function() {
            $state.go('tab.home');
        });
    }
})

