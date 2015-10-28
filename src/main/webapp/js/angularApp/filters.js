'use strict';
/* global angular */

/**
 * Collection of filters used to massage $scope elements
 * for display
 *
 * Just a shell for now.
 * 
 */

angular.module('kanbanFilters', []).filter('blablabla', function () {
  return function (items) {
    return items.filter(function (item) {
  		// whatever needs to be returned
    });
  };
});