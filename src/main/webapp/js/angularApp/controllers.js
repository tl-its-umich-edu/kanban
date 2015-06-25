'use strict';
/* global kanban, _, $ */

kanban.controller('kanbanController', ['Issues', '$rootScope', '$scope', '$timeout', function(Issues, $rootScope, $scope, $timeout) {

  //default request
  $timeout(function() {
    angular.element('#tlstaffbutton').triggerHandler('click');
  }, 0);

  var issuesUrl = '/jirarequest?' + $rootScope.sourceCollection;
  $scope.loading = true;
  
  var wipUrl='/jirarequest?wip';
  
  Issues.getWip(wipUrl).then(function(result) {
    if (result.data.errors) {
      //source error: do something
    } else {
      if (result.errors) {
        //angular error: do something else
      } else {
        $scope.wip = result.data;
      }
    }
  });


  //subsequent requests via buttons
  $scope.switchIssueCollection = function(collectionParam) {
    $scope.loading = true;
    var issuesUrl = '/jirarequest?' + collectionParam;
    Issues.getIssues(issuesUrl).then(function(result) {
      if (result.data.errors) {
        //source error: do something
      } else {
        if (result.errors) {
          //angular error: do something
        } else {
          $scope.issues = result.data;
          $scope.projects = _.uniq(_.pluck(result.data, 'projectKey'));
          $scope.priorities = _.uniq(_.pluck(result.data, 'priority'));
          var labelsPrep = _.compact(_.pluck(result.data, 'labels'));
          var labelsPrep2 = [];
          $.each(labelsPrep, function() {
              if(this.length) {
                $.each(this, function() {
                  labelsPrep2.push(this.label);
                });
              }
          });
          $scope.labels = _.sortBy(_.uniq(labelsPrep2), function (name) {return name});
        }
      }
       $scope.loading = false;
    });
  };


  $scope.showTodos = function(item) {
    return item.status === 'Awaiting Review' || item.status === 'Open' || item.status === 'Reopened';
  };

  $scope.showInProgress = function(item) {
    return item.status === 'In Progress' || item.status === 'Development in Progress';
  };


  $scope.showInReview = function(item) {
    return item.status === 'Resolved' || item.status === 'QA Testing' || item.status == 'In QA';
  };



}]);
