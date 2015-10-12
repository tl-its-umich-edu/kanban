'use strict';
/* global  kanban, errorDisplay*/

//Issues FACTORY - does the request for kanbanController
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
          result.data[0].todo = parseInt(result.data[0].todo);
          result.data[0].inprogress = parseInt(result.data[0].inprogress);
          result.data[0].review = parseInt(result.data[0].review);
          console.log(result.data)
          return result;
        },
        function error(result) {
          errorDisplay(url, result.status, 'Unable to get issues');
        }
      );
    }

  };
});

