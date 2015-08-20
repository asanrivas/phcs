// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

if (typeof String.prototype.startsWith != 'function') {
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

    // .state('tab.dash', {
    //     url: '/dash',
    //     views: {
    //         'tab-dash': {
    //             templateUrl: 'templates/tab-dash.html',
    //             controller: 'DashCtrl'
    //         }
    //     }
    // })

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

    .state('tab.continuous', {
        url: '/continuous',
        cache: false,
        views: {
            'tab-continuous': {
                templateUrl: 'templates/tab-continuous.html',
                controller: 'ContinuousCtrl'
            }
        }
    })

    .state('formcontinuous', {
        url: "/formcontinuous/:patientID",
        abstract: true,
        templateUrl: "templates/tab-continuous-forms.html",
        controller: "FormContinuousCtrl"
    })
    .state('formcontinuous.p001', { url: '/p001', views: { 'sub-continuous': { templateUrl: 'templates/forms/p01.html', controller: 'PointCtrl'}}})
    .state('formcontinuous.p002', { url: '/p002', views: { 'sub-continuous': { templateUrl: 'templates/forms/p02.html'}}})
    .state('formcontinuous.p003', { url: '/p003', views: { 'sub-continuous': { templateUrl: 'templates/forms/p03.html'}}})
    .state('formcontinuous.p004', { url: '/p004', views: { 'sub-continuous': { templateUrl: 'templates/forms/p04.html' } } })
    .state('formcontinuous.p005', { url: '/p005', views: { 'sub-continuous': { templateUrl: 'templates/forms/p05.html' } } })
    .state('formcontinuous.p006', { url: '/p006', views: { 'sub-continuous': { templateUrl: 'templates/forms/p06.html' } } })
    .state('formcontinuous.p007', { url: '/p007', views: { 'sub-continuous': { templateUrl: 'templates/forms/p07.html' } } })

    .state('formcontinuous.p008', { url: '/p008', views: { 'sub-continuous': { templateUrl: 'templates/forms/p08.html' } } })

    .state('formcontinuous.p009', { url: '/p009', views: { 'sub-continuous': { templateUrl: 'templates/forms/p09.html' } } })
    .state('formcontinuous.p010', { url: '/p010', views: { 'sub-continuous': { templateUrl: 'templates/forms/p10.html' } } })
    .state('formcontinuous.p011', { url: '/p011', views: { 'sub-continuous': { templateUrl: 'templates/forms/p11.html' } } })
    .state('formcontinuous.p012', { url: '/p012', views: { 'sub-continuous': { templateUrl: 'templates/forms/p12.html' } } })
    .state('formcontinuous.p013', { url: '/p013', views: { 'sub-continuous': { templateUrl: 'templates/forms/p13.html' } } })
    .state('formcontinuous.p014', { url: '/p014', views: { 'sub-continuous': { templateUrl: 'templates/forms/p14.html' } } })
    .state('formcontinuous.p015', { url: '/p015', views: { 'sub-continuous': { templateUrl: 'templates/forms/p15.html' } } })
    .state('formcontinuous.p016', { url: '/p016', views: { 'sub-continuous': { templateUrl: 'templates/forms/p16.html' } } })
    .state('formcontinuous.p017', { url: '/p017', views: { 'sub-continuous': { templateUrl: 'templates/forms/p17.html', controller: 'PointCtrl'} } })
    .state('formcontinuous.p018', { url: '/p018', views: { 'sub-continuous': { templateUrl: 'templates/forms/p18.html', controller: 'p18Controller'} } })
    .state('formcontinuous.sp01', { url: '/sp01', views: { 'sub-continuous': { templateUrl: 'templates/forms/sp01.html' } } })
    .state('formcontinuous.sp02', { url: '/sp02', views: { 'sub-continuous': { templateUrl: 'templates/forms/sp02.html' } } })
    .state('formcontinuous.fsummaryinitial', { url: '/fsummaryinitial', views: { 'sub-continous': { templateUrl: 'templates/forms/fsummaryinitial.html'} } })

    .state('tab.continous', {
        url: '/continous',
        views: {
            'tab-continous': {
                templateUrl: 'templates/tab-continous.html',
                controller: 'AccountCtrl'
            }
        }
    })

    // .state('tab.p01', { url: '/p01', views: { 'tab-continous': { templateUrl: 'templates/forms/p01.html', controller: 'PointCtrl'}}})
    // .state('tab.p02', { url: '/p02', views: { 'tab-continous': { templateUrl: 'templates/forms/p02.html'}}})
    // .state('tab.p03', { url: '/p03', views: { 'tab-continous': { templateUrl: 'templates/forms/p03.html'}}})
    // .state('tab.p04', { url: '/p04', views: { 'tab-continous': { templateUrl: 'templates/forms/p04.html' } } })
    // .state('tab.p05', { url: '/p05', views: { 'tab-continous': { templateUrl: 'templates/forms/p05.html' } } })
    // .state('tab.p06', { url: '/p06', views: { 'tab-continous': { templateUrl: 'templates/forms/p06.html' } } })
    // .state('tab.p07', { url: '/p07', views: { 'tab-continous': { templateUrl: 'templates/forms/p07.html' } } })

    // .state('tab.p08', { url: '/p08', views: { 'tab-continous': { templateUrl: 'templates/forms/p08.html' } } })

    // .state('tab.p09', { url: '/p09', views: { 'tab-continous': { templateUrl: 'templates/forms/p09.html' } } })
    // .state('tab.p10', { url: '/p10', views: { 'tab-continous': { templateUrl: 'templates/forms/p10.html' } } })
    // .state('tab.p11', { url: '/p11', views: { 'tab-continous': { templateUrl: 'templates/forms/p11.html' } } })
    // .state('tab.p12', { url: '/p12', views: { 'tab-continous': { templateUrl: 'templates/forms/p12.html' } } })
    // .state('tab.p13', { url: '/p13', views: { 'tab-continous': { templateUrl: 'templates/forms/p13.html' } } })
    // .state('tab.p14', { url: '/p14', views: { 'tab-continous': { templateUrl: 'templates/forms/p14.html' } } })
    // .state('tab.p15', { url: '/p15', views: { 'tab-continous': { templateUrl: 'templates/forms/p15.html' } } })
    // .state('tab.p16', { url: '/p16', views: { 'tab-continous': { templateUrl: 'templates/forms/p16.html' } } })
    // .state('tab.p17', { url: '/p17', views: { 'tab-continous': { templateUrl: 'templates/forms/p17.html', controller: 'PointCtrl'} } })
    // .state('tab.p18', { url: '/p18', views: { 'tab-continous': { templateUrl: 'templates/forms/p18.html' } } })
    .state('tab.continuouspt20', { url: '/pt20', views: { 'tab-continous': { templateUrl: 'templates/forms/continuous-pt20.html', controller: 'pt20Ctrl' } } })
    .state('tab.sp01', { url: '/sp01', views: { 'tab-continous': { templateUrl: 'templates/forms/sp01.html', controller: 'sp01Ctrl' } } })
    .state('tab.sp02', { url: '/sp02', views: { 'tab-continous': { templateUrl: 'templates/forms/sp02.html', controller: 'sp02Ctrl' } } })
    .state('tab.collapsible', { url: '/collapsible', views: { 'tab-continous': { templateUrl: 'templates/forms/collapsible.html' } } })

    .state('tab.stages', { url: '/stages', views: { 'tab-continous': { templateUrl: 'templates/forms/stages.html' , controller: 'PointCtrl'} } })

    .state('tab.fsummaryinitial', { url: '/fsummaryinitial', views: { 'tab-continous': { templateUrl: 'templates/forms/fsummaryinitial.html'}, controller: 'fsummaryinitialCtrl' } })
// <<<<<<< HEAD
// =======
//     .state('tab.fsummaryinitial', { url: '/fsummaryinitial', views: { 'tab-home': { templateUrl: 'templates/forms/fsummaryinitial.html'} } })
// >>>>>>> 65a4f69da3cec1a2dbb0399b25b8ad598f714165

    .state('tab.complimentary', { url: '/complimentary', views: { 'tab-pmt': { templateUrl: 'templates/forms/complimentary.html'} } })

    .state('tab.multi', { url: '/multi', views: { 'tab-pmt': { templateUrl: 'templates/forms/multi.html'} } })

    .state('tab.pmt_diagram', { url: '/pmt_diagram', views: { 'tab-pmt': { templateUrl: 'templates/forms/pmt_diagram.html'} } })

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
    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-home.html',
                controller: 'HomeCtrl'
            }
        }
    })
    .state('tab.patient', { 
        url: '/edit-patient', 
        views: { 
            'tab-home': { 
                templateUrl: 'templates/patient-edit.html', 
                controller: 'HomeCtrl'
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
    .state('tab.e05', { url: '/e05', views: { 'tab-eol': { templateUrl: 'templates/forms/e05.html'}}})

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
