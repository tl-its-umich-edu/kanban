'use strict';
/* global  kanban, errorDisplay*/

//Issues FACTORY - does the requests (issues and wip) for kanbanController
kanban.factory('Issues', function ($http) {
  return {
    getIssues: function (url) {
      return $http.get(url, {cache: false}).then(
        function success(result) {
          //forward the data - let the controller deal with it
          return result;
        },
        function error(result) {
          errorDisplay(url, result.status, 'Unable to get issues');
        }
      );
    },
     getWip: function (url) {
      return $http.get(url, {cache: false}).then(
        function success(result) {
          //forward the data - let the controller deal with it
          // need these values as integers so that we can do comparisons
          result.data[0].todo = parseInt(result.data[0].todo, 10);
          result.data[0].inprogress = parseInt(result.data[0].inprogress, 10);
          result.data[0].review = parseInt(result.data[0].review, 10);
          return result;
        },
        function error(result) {
          errorDisplay(url, result.status, 'Unable to get issues');
        }
      );
    }
  };
});

