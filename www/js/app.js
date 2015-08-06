// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}


angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngResource', 'LocalForageModule'])

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

        if(!window.localStorage.getItem('corrad_server'))
            window.localStorage.setItem('corrad_server', 'http://112.137.162.30/pcis/');
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
        cache: false,
        templateUrl: "templates/patient.html",
        controller: 'PatientCtrl'

    })
    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab/:patientID",
        cache: false,
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
        cache: false,
        views: {
            'tab-firsttime': {
                templateUrl: 'templates/tab-firsttime.html',
                controller: 'FirstTimeCtrl'
            }
        }
    })
    .state('formfirstvisit', {
        url: "/formsfirstvisit/:patientID",
        abstract: true,
        templateUrl: "templates/tab-firsttime-forms.html",
        controller: "FormFirstVisitCtrl"
    })
    .state('formfirstvisit.f04', { url: '/f04', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f04.html', controller: 'f04Controller'}}})
    .state('formfirstvisit.f05', { url: '/f05', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f05.html', controller: 'f05Controller'}}})
    .state('formfirstvisit.f07', { url: '/f07', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f07.html', controller: 'f07Controller'}}})
    .state('formfirstvisit.f08', { url: '/f08', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f08.html', controller: 'f08Controller'}}})
    .state('formfirstvisit.f09', { url: '/f09', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f09.html', controller: 'f09Controller'}}})
    .state('formfirstvisit.f10', { url: '/f10', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f10.html', controller: 'f10Controller'}}})
    .state('formfirstvisit.f11', { url: '/f11', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f11.html', controller: 'f11Controller'}}})
    .state('formfirstvisit.f13', { url: '/f13', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f13.html', controller: 'f13Controller'}}})
    .state('formfirstvisit.f14', { url: '/f14', views: { 'sub-firstvisit': { templateUrl: 'templates/forms/f14.html', controller: 'f14Controller'}}})

    .state('tab.continous', {
        url: '/continous',
        views: {
            'tab-continous': {
                templateUrl: 'templates/tab-continous.html',
                controller: 'AccountCtrl'
            }
        }
    })

    .state('tab.p01', { url: '/p01', views: { 'tab-continous': { templateUrl: 'templates/forms/p01.html', controller: 'PointCtrl'}}})
    .state('tab.p02', { url: '/p02', views: { 'tab-continous': { templateUrl: 'templates/forms/p02.html'}}})
    .state('tab.p03', { url: '/p03', views: { 'tab-continous': { templateUrl: 'templates/forms/p03.html'}}})
    .state('tab.p04', { url: '/p04', views: { 'tab-continous': { templateUrl: 'templates/forms/p04.html' } } })
    .state('tab.p05', { url: '/p05', views: { 'tab-continous': { templateUrl: 'templates/forms/p05.html' } } })
    .state('tab.p06', { url: '/p06', views: { 'tab-continous': { templateUrl: 'templates/forms/p06.html' } } })
    .state('tab.p07', { url: '/p07', views: { 'tab-continous': { templateUrl: 'templates/forms/p07.html' } } })

    .state('tab.p08', { url: '/p08', views: { 'tab-continous': { templateUrl: 'templates/forms/p08.html' } } })

    .state('tab.p09', { url: '/p09', views: { 'tab-continous': { templateUrl: 'templates/forms/p09.html' } } })
    .state('tab.p10', { url: '/p10', views: { 'tab-continous': { templateUrl: 'templates/forms/p10.html' } } })
    .state('tab.p11', { url: '/p11', views: { 'tab-continous': { templateUrl: 'templates/forms/p11.html' } } })
    .state('tab.p12', { url: '/p12', views: { 'tab-continous': { templateUrl: 'templates/forms/p12.html' } } })
    .state('tab.p13', { url: '/p13', views: { 'tab-continous': { templateUrl: 'templates/forms/p13.html' } } })
    .state('tab.p14', { url: '/p14', views: { 'tab-continous': { templateUrl: 'templates/forms/p14.html' } } })
    .state('tab.p15', { url: '/p15', views: { 'tab-continous': { templateUrl: 'templates/forms/p15.html' } } })
    .state('tab.p16', { url: '/p16', views: { 'tab-continous': { templateUrl: 'templates/forms/p16.html' } } })
    .state('tab.p17', { url: '/p17', views: { 'tab-continous': { templateUrl: 'templates/forms/p17.html', controller: 'PointCtrl'} } })
    .state('tab.p18', { url: '/p18', views: { 'tab-continous': { templateUrl: 'templates/forms/p18.html' } } })

    .state('tab.sp01', { url: '/sp01', views: { 'tab-continous': { templateUrl: 'templates/forms/sp01.html' } } })
    .state('tab.sp02', { url: '/sp02', views: { 'tab-continous': { templateUrl: 'templates/forms/sp02.html' } } })
    .state('tab.collapsible', { url: '/collapsible', views: { 'tab-continous': { templateUrl: 'templates/forms/collapsible.html' } } })


    .state('tab.medication', {
        url: '/medication',
        views: {
            'tab-medication': {
                templateUrl: 'templates/tab-medication.html',
                controller: 'TabMedicationCtrl'
            }
        }
    })

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
    .state('tab.e01', { url: '/e01', views: { 'tab-eol': { templateUrl: 'templates/forms/e01.html', controller: 'e01Controller'}}})
    .state('tab.e02', { url: '/e02', views: { 'tab-eol': { templateUrl: 'templates/forms/e02.html', controller: 'e02Controller'}}})
    .state('tab.e03', { url: '/e03', views: { 'tab-eol': { templateUrl: 'templates/forms/e03.html', controller: 'e03Controller'}}})
    .state('tab.e04', { url: '/e04', views: { 'tab-eol': { templateUrl: 'templates/forms/e04.html', controller: 'e04Controller'}}})

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
