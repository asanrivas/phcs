angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})
.controller('LoginCtrl', function($scope, $state) {
    //$scope.signIn
    $scope.signIn = function () {
        $state.go('tab.dash');
    }
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
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
