'use strict';
/* global angular */

var kanban = angular.module('kanban', ['kanbanFilters','ngRoute']);

kanban.run(function($rootScope) {
  //for any init values needed
  $rootScope.sourceCollection = '.tl';
});

kanban.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'views/kanban.html',
        controller: 'kanbanController'
      }).
      when('/category', {
        templateUrl: 'views/category.html',
        controller: 'categoryController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
