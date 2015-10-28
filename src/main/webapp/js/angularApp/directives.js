'use strict';
/* global kanban */

kanban.directive('ngJiraToDo', function() {
  return {
    restrict: 'A',
    templateUrl: '/templates/todo.html'
  };
});

kanban.directive('ngJiraInProgress', function() {
  return {
    restrict: 'A',
    templateUrl: '/templates/inprogress.html'
  };
});

kanban.directive('ngJiraReview', function() {
  return {
    restrict: 'A',
    templateUrl: '/templates/review.html'
  };
});