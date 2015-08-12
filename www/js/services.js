angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('UploadData', function($q, $localForage){
    var userid;

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
                $localForage.setItem('upload_data', data).then(function(){
                    q.resolve(data);
                });
            });
            return q.promise;
        },
        update_data_patient_id: function(patientID, table, datum)
        {

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
                alert("FILE SYSTEM FAILURE" + evt.target.error.code);
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
