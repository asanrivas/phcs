// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngResource'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    .state('login', {
        url: '/',
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'

    })
    .state('patient', {
        url: '/patient',
        templateUrl: "templates/patient.html",
        controller: 'PatientCtrl'

    })
    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab/:patientID",
        abstract: true,
        templateUrl: "templates/tabs.html",
        controller: 'TabCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.gallery', {
        url: '/gallery',
        views: {
            'tab-gallery': {
                templateUrl: 'templates/tab-gallery.html',
                controller: 'TabGalleryCtrl'
            }
        }
    })
    .state('tab.firsttime', {
        url: '/firsttime',
        views: {
            'tab-firsttime': {
                templateUrl: 'templates/tab-firsttime.html',
                controller: 'FirstTimeCtrl'
            }
        }
    })
    .state('tab.f04', { url: '/f04', views: { 'tab-firsttime': { templateUrl: 'templates/forms/f04.html'}}})
    .state('tab.f05', { url: '/f05', views: { 'tab-firsttime': { templateUrl: 'templates/forms/f05.html'}}})

    .state('tab.continous', {
        url: '/continous',
        views: {
            'tab-continous': {
                templateUrl: 'templates/tab-continous.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.f07', {
        url: '/f07',
        views: {
            'tab-continous': {
                templateUrl: 'templates/forms/f07.html'
            }
        }
    })
    .state('tab.p02', { url: '/p02', views: { 'tab-continous': { templateUrl: 'templates/forms/p02.html'}}})
    .state('tab.p03', { url: '/p03', views: { 'tab-continous': { templateUrl: 'templates/forms/p03.html'}}})
    .state('tab.p04', { url: '/p04', views: { 'tab-continous': { templateUrl: 'templates/forms/p04.html'}}})
    .state('tab.f10', { url: '/pf10', views: { 'tab-continous': { templateUrl: 'templates/forms/f10.html'}}})
    .state('tab.eol', {
        url: '/eol',
        views: {
            'tab-eol': {
                templateUrl: 'templates/eol.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.feolcp', { url: '/feolcp', views: { 'tab-eol': { templateUrl: 'templates/forms/feolcp.html'}}})
    .state('tab.pmt', {
        url: '/pmt',
        views: {
            'tab-pmt': {
                templateUrl: 'templates/tab-pmt.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.equipment', {
        url: '/equipment',
        views: {
            'tab-equipment': {
                templateUrl: 'templates/equip.html',
                controller: 'AccountCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');

});
