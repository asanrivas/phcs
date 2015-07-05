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

                data[patientID][table] = datum;
                $localForage.setItem('upload_data', data).then(function(){
                    q.resolve(data);
                });
            });
            return q.promise;
        }
    }
})
.factory('RandomUser', function($resource){
    var userList;

    return {
        setPatients: function(data) {
            userList = data;
            window.localStorage['userList'] = JSON.stringify(userList);
        },
        getPatients: function() {
            return userList;
        },
        getPatientById: function(userid)
        {
            if(!userList)
            {
                userList = JSON.parse(localStorage.getItem('userList')) || [];
                return userList[userid];
            }
            else
                return userList[userid];
        }
    };
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
