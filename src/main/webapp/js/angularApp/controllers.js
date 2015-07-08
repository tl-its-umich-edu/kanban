'use strict';
/* global kanban, _, $, angular */

kanban.controller('kanbanController', ['Issues', '$rootScope', '$scope', '$timeout', function(Issues, $rootScope, $scope, $timeout) {

  //default request - sending a click to the TL Staff button
  $timeout(function() {
    angular.element('#tlstaffbutton').triggerHandler('click');
  }, 0);
  // what collection is being shown is stored in the root scope
  // not used now but might come in handy later
  //var issuesUrl = '/jirarequest?' + $rootScope.sourceCollection;
  
  var wipUrl='/jirarequest?wip';
  
  // use a factory as a promise to get WIP data
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

  // click handler for subsequent requests via buttons
  $scope.switchIssueCollection = function(collectionParam) {
    
    // start the spinner
    $scope.loading = true;
    
    var issuesUrl = '/jirarequest?' + collectionParam;
    $rootScope.sourceCollection = collectionParam;
    
    // use factory promise to get data
    Issues.getIssues(issuesUrl).then(function(result) {
      if (result.data.errors) {
        //source error: do something
      } else {
        if (result.errors) {
          //angular error: do something
        } else {
          // adding the issues to the scope
          $scope.issues = result.data;
          // adding special scopes for project keys, priorities, labels
          // in case we want to make the filters <selects>
          $scope.projects = _.uniq(_.pluck(result.data, 'projectKey'));
          $scope.priorities = _.uniq(_.pluck(result.data, 'priority'));
          var labelsPrep = _.compact(_.pluck(result.data, 'labels'));
          // creating the label scope needs some massaging as they are an array
          var labelsPrep2 = [];
          $.each(labelsPrep, function() {
              if(this.length) {
                $.each(this, function() {
                  labelsPrep2.push(this.label);
                });
              }
          });
          $scope.labels = _.sortBy(_.uniq(labelsPrep2), function (name) {return name;});
        }
      }
      // stop the spinner
      $scope.loading = false;
    });
  };

  //these filters sort issues into the three columns
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
