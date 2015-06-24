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

.factory('LocalDB', function(){
    var db;
    var openRequest = indexedDB.open("pcis",1);
    openRequest.onupgradeneeded = function(e) {
        console.log("Upgrading...");
        var thisDB = e.target.result;

        var tables = ['patients', 'visit', 'gallery', 'form_data', 'loan_equipment', 'eol'];

        for (var i = 0; i < tables.length; i++) {

            if(!thisDB.objectStoreNames.contains(tables[i])) {
                thisDB.createObjectStore(tables[i]);
            }
        }
    }

    openRequest.onsuccess = function(e) {
        console.log("Success load db!");
        db = e.target.result;

    }

    openRequest.onerror = function(e) {
        console.log("Error");
        console.dir(e);
    }

    return {
        setPatients:function (data) {
            console.log('saving...');
            var transaction = db.transaction(["patients"],"readwrite");
            var patients = transaction.objectStore("patients");
            for (var i = 0; i < data.length; i++) {
                patients.add(data[i], i)
            }
            return true;
        },
        getPatients:function () {
            console.log('initiating...');
            var transaction = db.transaction(["patients"],"readwrite");
            return transaction.objectStore("patients");
        },
        getPatientById:function (id) {
            var transaction = db.transaction(["patients"],"readwrite");
            return transaction.objectStore("patients");
        },
        getGallery:function (patient_id) {
            return transaction.objectStore("patients")[id];
        },

    };

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
    }
  }
});
