'use strict';
/* global angular */

var kanban = angular.module('kanban', ['kanbanFilters']);

kanban.run(function($rootScope) {
  //for any init values needed
  $rootScope.sourceCollection = '.tl';



});