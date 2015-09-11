angular.module('starter.services', [])

.directive('fallbackSrc', function($rootScope) {
	return {
    restrict: 'A',
    link: function(scope, element, attrs){
			$rootScope.imgerror = [];
			if(attrs.ngSrc===""){
				element.attr('src', attrs.fallbackSrc);
			}
			element.bind('error', function(){
				element.attr('src', attrs.fallbackSrc);
				$rootScope.imgerror.push(attrs.fallbackSrc);
			});
    }
  };
})

.factory('UploadData', function($q, $localForage){
    var userid;
    var current_patient;

    return {
        init_upload_data: function(patientID){
            if(!data)
                data = {};
            if(!data[patientID])
                data[patientID] = {};

        },
        save_data_patient_id: function(patientID, table, datum)
        {
            var theDate=new Date();
            var q = $q.defer();
            $localForage.getItem('upload_data').then(function(data){
                if(!data)
                    data = {};
                if(!data[patientID])
                {
                    data[patientID] = {
                        date: theDate.format("yyyy-mm-dd"),
                        time: theDate.format("H:MM:SS"),
                        remark: "",
                        userid: 1 //hardcoded admin
                    };
                }
                var defaultObj = {patient_id: patientID, date: theDate.format("yyyy-mm-dd HH:MM")};
                var extended = {};

                angular.extend(extended, datum, defaultObj);
                data[patientID][table] = extended;
                // console.log("save data: "+JSON.stringify(data));
                $localForage.setItem('upload_data', data).then(function(){
                    q.resolve(data);
                });
            });
            return q.promise;
        },
        set_current_patient: function(patient)
        {
            current_patient = patient;
        },
        get_current_patient: function(patient)
        {
            return current_patient;
        },
        data_selector: function(patientID, table, section_table, convertJSON)
        {
            var q = $q.defer();
            convertJSON = typeof convertJSON !== 'undefined' ? convertJSON : true;
            $localForage.getItem('upload_data').then(function(data){
                console.log("patient: "+patientID);
                if( data && data[patientID] && data[patientID][table] )
                {
                    q.resolve(data[patientID][table]);
                }
                else
                {
                    $localForage.getItem(section_table).then(function(vdata){
                        if(vdata && vdata[table])
                        {
                            for (var i = vdata[table].length-1; i >= 0; i--) {
                                if(vdata[table][i].patient_id == patientID||vdata[table][i].PATIENT_ID == patientID)
                                {
                                    var obj = {};
                                    if(convertJSON) {
                                        angular.forEach(vdata[table][i], function(value, key){
                                            try {
                                                obj[key] = JSON.parse(value);
                                            }
                                            catch(err) {
                                                obj[key] = value;
                                            }
                                        });
                                    } else {
                                        obj = vdata[table][i];
                                    }

                                    q.resolve(obj);
                                    break;
                                }
                            }
                        }
                    });
                }
            });
            return q.promise;
        },
        append_data_patient_id: function(patientID, table, datum)
        {
            var q = $q.defer();
            $localForage.getItem('upload_data').then(function(data){
                if(!data)
                    data = {};
                if(!data[patientID])
                {
                    var theDate=new Date();
                    data[patientID] = {
                        date: theDate.format("yyyy-mm-dd"),
                        time: theDate.format("H:MM"),
                        remark: "",
                        userid: 1 //hardcoded admin
                    };
                }
                if(!Array.isArray(data[patientID][table]))
                    data[patientID][table] = [];
                data[patientID][table].push(datum);
                $localForage.setItem('upload_data', data).then(function(){
                    q.resolve(data);
                });
            });
            return q.promise;
        },
        download_gallery: function(filename)
        {
            var path = cordova.file.externalDataDirectory+filename;
            var q = $q.defer();
            window.resolveLocalFileSystemURL(path,
                function() {
                    console.log('file exist so nothing to do...');
                    q.resolve(path);
                },
                function(){
                    console.log('Downloading the file: '+filename);
                    var corrad_server = window.localStorage.getItem('corrad_server');
                    var fileTransfer = new FileTransfer();
                    var uri = encodeURI(corrad_server+'upload/'+filename);
                    var fileURL = cordova.file.externalDataDirectory+filename;

                    fileTransfer.download(
                        uri,
                        fileURL,
                        function(entry) {
                            console.log("download complete: " + entry.toURL());
                            q.resolve(entry.toURL());
                        },
                        function(error) {
                            console.log("download error source " + error.source);
                            console.log("download error target " + error.target);
                            console.log("upload error code" + error.code);
                            q.reject(error);
                        },
                        true
                    );
                });
            return q.promise;
        },
        upload_gallery: function(fileURL)
        {
            var q = $q.defer();
            var corrad_server = window.localStorage.getItem('corrad_server');
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            var ft = new FileTransfer();
            ft.upload(fileURL, encodeURI(corrad_server+'api_generator.php?api_name=API_UPLOAD_IMAGE'), function(success){
                console.log('Uploading success :'+options.fileName);
                q.resolve(success);
            }, function(error){
                q.reject(error);
            }, options);
            return q.promise;
        },
        clear_directory: function(path) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
            function fail(evt) {
                console.log("FILE SYSTEM FAILURE" + JSON.stringify(evt));
            }
            function onFileSystemSuccess(fileSystem) {
                fileSystem.root.getDirectory(
                    path,//cordova.file.externalDataDirectory+".handdrawing",
                    {create : true, exclusive : false},
                    function(entry) {
                        entry.removeRecursively(function() {
                            console.log("Remove Recursively Succeeded");
                        }, fail);
                    }, fail);
                }
            }
    }
})
.factory('Canvas', function($ionicModal, $rootScope, $q){
    var background = new Image();
    var canvasModal;
    var sketch;
    var openedImage;
    var init = function($scope, img_default) {
		if($scope.modal)
		{
			return q.promise;
		}

		var q = $q.defer();
        $scope = $scope || $rootScope.$new();

        background.src = img_default;

        // Make sure the image is loaded first otherwise nothing will draw.


        $ionicModal.fromTemplateUrl("templates/canvas.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            canvasModal = modal;
			q.resolve(modal);
        });


        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        // $scope.$on('$destroy', function() {
        //     $scope.modal.remove();
        // });

        $scope.base_image = img_default;

        $scope.save = function(img){
			ctx = $('#tools_sketch')[0].getContext("2d");
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(background, 0, 0, 800, background.height*(800/background.width));
			ctx.globalCompositeOperation = 'source-over';
            $scope.modal.hide();
            openedImage.resolve( $('#tools_sketch')[0].toDataURL('image/png') );
        };

        return q.promise;
    }

    return {
        init: init,
        open: function(img){
            openedImage = $q.defer();
			var image = new Image();
            canvasModal.show();
			image.onload = function () {
				ctx = $('#tools_sketch')[0].getContext("2d");
				ctx.globalCompositeOperation = 'source-over';
				ctx.drawImage(this, 0, 0, 800, 600);
			}
			image.src = img;

			if(!sketch)
            	sketch = $('#tools_sketch').sketch();

            return openedImage.promise;
        },
        save: function(){
        }
    }
})
.factory('Camera', function($q) {

  return {
      getPicture: function(options) {
          var q = $q.defer();

          navigator.camera.getPicture(function(result) {
            // Do any magic you need
            q.resolve(result);
          }, function(err) {
            q.reject(err);
          }, options);

          return q.promise;
      },
      getPhoto: function() {
          var q = $q.defer();
          var options = {
              destinationType : Camera.DestinationType.FILE_URI,
              sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
              allowEdit : false,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
          };

          navigator.camera.getPicture(function(imageData) {

              onImageSuccess(imageData);

              function onImageSuccess(fileURI) {
                  createFileEntry(fileURI);
              }

              function createFileEntry(fileURI) {
                  window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
              }

              function copyFile(fileEntry) {
                  var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                  var newName = makeid() + name;

                  window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(fileSystem2) {
                      fileEntry.copyTo(
                          fileSystem2,
                          newName,
                          onCopySuccess,
                          fail
                      );
                  },
                  fail);
              }

              // 6
              function onCopySuccess(entry) {
                //   q.resolve(entry.nativeURL, entry.name);
                  q.resolve(entry);
              }

              function fail(error) {
                  console.log("fail: " + error.code);
                  q.reject(error);
              }

              function makeid() {
                  var text = "";
                  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                  for (var i=0; i < 5; i++) {
                      text += possible.charAt(Math.floor(Math.random() * possible.length));
                  }
                  return text;

              }

          }, function(err) {
              console.log(err);
          }, options);
          return q.promise;

      }
  }
});
