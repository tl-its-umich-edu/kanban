'use strict';
/* global kanban, _, $, angular, localStorage, window */

kanban.controller('kanbanController', ['Issues', '$rootScope', '$scope', '$timeout', '$parse', function(Issues, $rootScope, $scope, $timeout, $parse) {

    if(localStorage.getItem('kanbanFilters')) {
      $scope.savedFilters = localStorage.getItem('kanbanFilters').split(',');
    }



  //default request - sending a click to the TL Staff button
  $timeout(function() {
    angular.element('#tlstaffbutton').triggerHandler('click');
  }, 0);
  // what collection is being shown is stored in the root scope
  // not used now but might come in handy later
  //var issuesUrl = '/jirarequest?' + $rootScope.sourceCollection;

  if(!$scope.wip){
    var wipUrl='/jirarequest?wip';
    // use a factory as a promise to get WIP data
    Issues.getWip(wipUrl).then(function(result) {
      if(result.errors) {
        $rootScope.errors = result;
      }
      else {
        if (result.data.errors) {
          //source error: do something
        } else {
          if (result.errors) {
            //angular error: do something else
          } else {
            $scope.wip = result.data;
          }
        }
      }
    });
  }
  // click handler for subsequent requests via buttons
  $scope.switchIssueCollection = function(collectionParam) {
    // start the spinner
    $scope.loading = true;
    $scope.errors ={};
    var issuesUrl = '/jirarequest?' + collectionParam;

    $rootScope.sourceCollection = collectionParam;

    // use factory promise to get data
    Issues.getIssues(issuesUrl).then(function(result) {
      if(result.errors) {
        $rootScope.errors = result;
      }
      else {
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
      }// stop the spinner
      $scope.loading = false;
    });
  };

  //these filters sort issues into the three columns
  $scope.showTodos = function(item) {
    return item.status === 'Awaiting Review' || item.status === 'Open' || item.status === 'Reopened';
  };
  $scope.showInProgress = function(item) {
    return item.status === 'In Progress' || item.status === 'Deploy' || item.status === 'Development in Progress';
  };
  $scope.showInReview = function(item) {
    return item.status === 'Resolved' || item.status === 'QA Testing' || item.status == 'In QA';
  };

  var params = location.search.replace('?','').split('&');
  if(params[0] !=='') {
    $.each(params, function( index, value ) {
      var param = value.split('=');
      var key = param[0] + 'Model';
      var val = param[1];
      var model = $parse(key);
      model.assign($scope, val);
    });
  }

  $scope.useFilter = function(filter){
    window.location = window.location.origin + filter;
  };

  $scope.removeFilter = function ( idx ) {
    var filterToDelete = $scope.savedFilters[idx];
    $scope.savedFilters.splice(idx, 1);
    localStorage.setItem('kanbanFilters', $scope.savedFilters.join(','));
  };

  $scope.saveQuery = function(){
    var current = [];
    if(localStorage.getItem('kanbanFilters')) {
      current = localStorage.getItem('kanbanFilters').split(',');
    }

    var ass = $scope.assigneeModel?$scope.assigneeModel:'';
    var pri = $scope.priorityModel?$scope.priorityModel:'';
    var rep = $scope.reporterModel?$scope.reporterModel:'';
    var pro = $scope.projectModel?$scope.projectModel:'';
    var lab = $scope.labelModel?$scope.labelModel:'';

    var combo = '?assignee=' + ass + '&priority=' + pri + '&reporter=' + rep + '&project=' + pro + '&label=' + lab;
    if(_.indexOf(current, combo) ==-1){
      current.push(combo);
    }
    localStorage.setItem('kanbanFilters', current.join(','));
    $scope.savedFilters = localStorage.getItem('kanbanFilters').split(',');
  };
}]);
