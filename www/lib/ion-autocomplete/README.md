ion-autocomplete
================
[![Build Status](https://travis-ci.org/guylabs/ion-autocomplete.svg?branch=master)](https://travis-ci.org/guylabs/ion-autocomplete)
[![Coverage Status](https://img.shields.io/coveralls/guylabs/ion-autocomplete.svg)](https://coveralls.io/r/guylabs/ion-autocomplete)
[![Bower version](https://badge.fury.io/bo/ion-autocomplete.svg)](http://badge.fury.io/bo/ion-autocomplete)
[![npm version](https://badge.fury.io/js/ion-autocomplete.svg)](http://badge.fury.io/js/ion-autocomplete)

> Configurable Ionic directive for an autocomplete dropdown.

#Table of contents

- [Demo](#demo)
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Ionic compatibility](#ionic-compatibility)
- [Usage](#usage)
    - [Configurable options](#configurable-options)
        - [The `items-method`](#the-items-method)
        - [The `items-method-value-key`](#the-items-method-value-key)
        - [The `item-value-key`](#the-item-value-key)
        - [The `item-view-value-key`](#the-item-view-value-key)
        - [The `multiple-select`](#the-multiple-select)
        - [The `items-clicked-method`](#the-items-clicked-method)
        - [The `model-to-item-method`](#the-model-to-item-method)
        - [ComponentId](#component-id)
        - [Placeholder](#placeholder)
        - [Cancel button label](#cancel-button-label)
        - [Select items label](#select-items-label)
        - [Selected items label](#selected-items-label)
        - [Template url](#template-url)
        - [Template data](#template-data)
        - [Loading icon](#loading-icon)
    - [Using expressions in value keys](#using-expressions-in-value-keys)
- [Release notes](#release-notes)
- [Acknowledgements](#acknowledgements)
- [License](#license)

# Demo

You can find a live demo on [Codepen](http://codepen.io/guylabs/pen/GJmwMw) or see it in action in the following image:

![Animated demo](https://github.com/guylabs/ion-autocomplete/raw/master/demo.gif)

# Introduction

For one of my private projects I needed an autocomplete component in Ionic. I searched a lot and found some plain Angular autocompletes, but these had too much other dependencies and mostly didn't look that good within Ionic. Then one day I stumbled upon the [ion-google-place](https://github.com/israelidanny/ion-google-place) project which was exactly what I was looking for, except that it was just working with the Google Places API. So I forked the project and made it configurable such that you can add the service you need. The differences between the ion-google-place project and the ion-autocomplete are listed in the features.

# Features

The ion-autocomplete component has the following features:
- Multiple selection support
- Configure a callback when an item is clicked
- Configurable service which provides the items to list
- Configure what is stored in the model and what is seen in the list
- Configure all labels used in the component
- Configure the template used to show the autocomplete component

# Installation

1. Use bower to install the new module:
```bash
bower install ion-autocomplete --save
```
2. Import the `ion-autocomplete` javascript and css file into your HTML file:
```html
<script src="bower_components/ion-autocomplete/dist/ion-autocomplete.js"></script>
<link href="bower_components/ion-autocomplete/dist/ion-autocomplete.css" rel="stylesheet">
```
3. Add `ion-autocomplete` as a dependency on your Ionic app:
```javascript
angular.module('myApp', [
  'ionic',
  'ion-autocomplete'
]);
```

# Ionic compatibility

The ion-autocomplete component is running with the following Ionic versions:

ion-autocomplete version | Ionic version
------------------------ | -------------
0.0.2 - 0.1.2 | 1.0.0-beta.14
0.2.0 - 0.2.1 | 1.0.0-rc.3
0.2.2 - latest | 1.0.0

# Usage

To use the `ion-autocomplete` directive in single select mode you need to add the following snippet to your template:
```html
// usage with the element restriction
<ion-autocomplete ng-model="model" />

//usage with the attribute restriction
<input ion-autocomplete type="text" readonly="readonly" class="ion-autocomplete" autocomplete="off" />
```

If you want to use it in multiple select mode you need to add the following snippet to your template: 
```html
// usage with the element restriction
<ion-autocomplete ng-model="model" multiple-select="true" />

//usage with the attribute restriction
<input ion-autocomplete type="text" readonly="readonly" class="ion-autocomplete" autocomplete="off" multiple-select="true" />
```

Check out the next chapter on how to configure the directive.

## Configurable options

### The `items-method`

You are able to pass in a callback method which gets called when the user changes the value of the search input field. This is
normally a call to the back end which retrieves the items for the specified query. Here is a small sample which will
return a static item of the query:

Define the callback in your scope:
```javascript
$scope.callbackMethod = function (query) {
    return [query];
}
```

And set the items method on the directive:
```html
<ion-autocomplete ng-model="model" items-method="callbackMethod(query)" />
```

You are also able to return a promise from this callback method. For example:
```javascript
$scope.callbackMethod = function (query) {
    return $http.get(endpoint);
}
```

Note that the parameter for the `callbackMethod` needs to be named `query`. Otherwise the callback will not get called properly.
If you want to also retrieve the [ComponentId](#component-id) then you need to add a second parameter called `componentId`:
```javascript
$scope.callbackMethod = function (query, componentId) {
    if(componentId == "component1") {
        return $http.get(endpoint1);
    }
    return [query];
}
```

### The `items-method-value-key`

You are able to set the `items-method-value-key` attribute which maps to a value of the returned data of the `items-method`. If for
example your callback method returns the following object:
```json
{
    "items" : [ {
        "name" : "item1"
    },{
        "name" : "item2"
    },
        ...
    ]
}
```
Then when you do not specify the `items-method-value-key` there will be no list displayed when you search for items in
the search input field. You need to set the `items-method-value-key` to `items` such that the items are shown. If you right
away return an array of items then you do not need to set the `items-method-value-key`.

### The `item-value-key`

You are able to set the `item-value-key` attribute which maps to a value of the returned object from the `items-method`. The value
is then saved in the defined `ng-model`. Here an example:

The items method returns the following object:
```javascript
[
    {
        "id": "1",
        "name": "Item 1",
        ...
    }
    ...
]
```

And now you set the following `item-value-key`:
```html
<ion-autocomplete ng-model="model" item-value-key="id" />
```

Now when the user selects the `Item 1` from the list, then the value of the objects `id` is stored in the `ng-model`. If
no `item-value-key` is passed into the directive, the whole item object will be stored in the `ng-model`.

### The `item-view-value-key`

You are able to set the `item-view-value-key` attribute which maps to a value of the returned object from the `items-method`. The
value is then showed in both input fields. Here an example:

The `items-method` returns the following object:
```javascript
[
    {
        "id": "1",
        "name": "Item 1",
        ...
    }
    ...
]
```

And now you set the following `item-view-value-key`:
```html
<ion-autocomplete ng-model="model" item-view-value-key="name" />
```

Now when the user selects the `Item 1` from the list, then the value of the objects `name` is showed in both input fields. If
no `item-view-value-key` is passed into the directive, the whole item object will be showed in both input fields.

### The `multiple-select`

You are able to set the `multiple-select` attribute to `true` to enable the multiple select feature. Here an example:
```html
<ion-autocomplete ng-model="model" multiple-select="true" />
```

Then the user is able to select multiple items out of the returned items and also delete them again. The given `ng-model` is an 
array if multiple items are selected.

### The `items-clicked-method`

You are able to pass a function to the `items-clicked-method` attribute to be notified when an item is clicked. The name of the 
parameter of the function must be `callback`. Here is an example:

Define the callback in your scope:
```javascript
$scope.clickedMethod = function (callback) {
    // print out the selected item
    console.log(callback.item); 
    
    // print out the component id
    console.log(callback.componentId);
    
    // print out the selected items if the multiple select flag is set to true and multiple elements are selected
    console.log(callback.selectedItems); 
}
```

And pass in the callback method in the directive:
```html
<ion-autocomplete ng-model="model" items-clicked-method="clickedMethod(callback)" />
```

Then you get a callback object with the clicked/selected item and the selected items if you have multiple selected items (see [The `multiple-select`](#the-multiple-select)).

### The `items-removed-method`

You are able to pass a function to the `items-removed-method` attribute to be notified when an item is removed from a multi-select list. The name of the 
parameter of the function must be `callback`. It is similar to items-clicked-method.  This attribute has no defined behaviour for a single select list.

Here is an example:

Define the callback in your scope:
```javascript
$scope.removedMethod = function (callback) {
    // print out the removed item
    console.log(callback.item); 

    // print out the component id
    console.log(callback.componentId);
    
    // print out the selected items if the multiple select flag is set to true and multiple elements are selected
    console.log(callback.selectedItems); 
}
```

And pass in the callback method in the directive:
```html
<ion-autocomplete ng-model="model" items-removed-method="removedMethod(callback)" />
```

Then you get a callback object with the removed item and the selected items if you have multiple selected items (see [The `multiple-select`](#the-multiple-select)).

### The `model-to-item-method`

This method is used if you want to prepopulate the model of the `ion-autocomplete` component. The prepopulated model needs 
to be have the same data as it would be saved when you select the items by hand. The component then takes the model values 
and calls the specified `model-to-item-method` to resolve the item from the back end and select it such that it is preselected.

Here a small example:

Define the `model-to-item-method` in your scope:
```javascript
$scope.modelToItemMethod = function (modelValue) {

    // get the full model item from the model value and return it
    var modelItem = getModelItem(modelValue);
    return modelItem;
}
```

And set the `model-to-item-method` on the directive:
```html
<ion-autocomplete ng-model="model" model-to-item-method="modelToItemMethod(modelValue)" />
```

You are also able to return a promise from this callback method. For example:
```javascript
$scope.modelToItemMethod = function (modelValue) {
    return $http.get(endpoint + '?q=' + modelValue);
}
```

Note that the parameter for the `model-to-item-method` needs to be named `modelValue`. Otherwise the callback will not get called properly.

### Component Id

The component id is an attribute on the `ion-autocomplete` component which sets a given id to the component. This id is then returned in 
the callback object of the [`items-clicked-method`](#the-items-clicked-method) and as a second parameter of the [`items-method`](#the-items-method).
Here an example:
```html
<ion-autocomplete ng-model="model" component-id="component1" />`
```

You are able to set this is on each component if you have multiple components built up in a ng-repeat where you do not want to have multiple `items-method` 
for each component because you want to display other items in each component. You will also get it in the `items-clicked-method` callback object such that you just 
need to define one callback method and you can distinguish the calls with the `componentId` attribute right inside the method.

### Placeholder

You are also able to set the placeholder on the input field and on the search input field if you add the `placeholder`
attribute to the directive:
```html
<ion-autocomplete ng-model="model" placeholder="Enter the query to search for ..." />`
```

### Cancel button label

You are also able to set the cancel button label (defaults to `Cancel`) if you add the `cancel-label` attribute to the directive:
```html
<ion-autocomplete ng-model="model" cancel-label="Go back" />`
```

### Select items label

You are also able to set the select items label (defaults to `Select an item...`) if you add the `select-items-label` attribute to the directive:
```html
<ion-autocomplete ng-model="model" select-items-label="Select your items..." />`
```

### Selected items label

You are also able to set the selected items label (defaults to `Selected items:`) if you add the `selected-items-label` attribute to the directive:
```html
<ion-autocomplete ng-model="model" selected-items-label="Selected:" />`
```

### Template url

You are also able to set an own template for the autocomplete component (defaults to `''`) if you add the `template-url` attribute to the directive:
```html
<ion-autocomplete ng-model="model" template-url="templates/template.html" />`
```

This way you are able to override the default template (the `searchContainerTemplate` variable [here](https://github.com/guylabs/ion-autocomplete/blob/master/src/ion-autocomplete.js#L75)) 
and use your own template. The component will use the default template if the `template-url` is not defined.

You are able to use all the configurable attributes as expressions in your template. I would advise to use the default template as base template
and then add your custom additions to it.

> Please also take care when you change how the items are shown or what method is called if an item is clicked, 
> because changing this could make the component unusable.

The template itself will be loaded with the `$ionicTemplateLoader` and this will also use the Angular `$templateCache`.

### Template data

If you change the template with the `template-url` and want to pass in additional data then you are able to set 
the `template-data` attribute on the directive. If you for example have a `templateData.testData` expression in your own 
template like this:
```html
...
<div>{{templateData.testData}}</div>
...
```
Then you need to set the proper object on your Angular scope the following way:
```javascript
$scope.templateData = {
    testData: "test-data"
};
```
And now you just need to add the `templateData` attribute on the directive:
```html
<ion-autocomplete ng-model="model" template-data="templateData" />`
```

Then the expression in your template gets resolved properly.

### Loading icon

If you want to display a loading icon when the `items-method` promise gets resolved then you need to set the `loading-icon` 
attribute to a value given by the Ionic spinner: http://ionicframework.com/docs/api/directive/ionSpinner. Then the spinner should 
be shown at the right side of the search input field. 

## Using expressions in value keys

All value keys are parsed with the Angular `$parse` service such that you are able to use expressions like in the following
example:

```javascript
[
    {
        "id": "1",
        "name": "Item 1",
        "child": {
            "name": "Child Item 1",
        }
        ...
    }
    ...
]
```

This would be the JSON model returned by the `items-method` and in the next snippet we define that we want to show the
name attribute of the child object:

```html
<ion-autocomplete ng-model="model" item-view-value-key="child.name" />
```

# Release notes

Check them here: [Release notes](https://github.com/guylabs/ion-autocomplete/blob/master/RELEASENOTES.md)

# Acknowledgements

When I first searched for an Ionic autocomplete component I just found the project from Danny. So please have a look at
his [ion-google-place](https://github.com/israelidanny/ion-google-place) project as this project here is a fork of it.
At this point I want to thank him for his nice work.

# License

This Ionic autocomplete directive is available under the MIT license.

(c) Danny Povolotski

(c) Modifications by Guy Brand
