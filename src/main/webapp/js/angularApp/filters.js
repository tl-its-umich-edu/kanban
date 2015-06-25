/* jshint  strict: true*/
/* global moment, angular */

/**
 * Collection of filters used to massage $scope elements
 * for display
 */

angular.module('kanbanFilters', []).filter('assignee', function () {
  return function (items) {
    return items.filter(function (item) {
      return (/a/i.test(item.assignee(0, 1)));
    });
  };
});