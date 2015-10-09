'use strict';
/* global $ */


var errorDisplay = function(url, status, message) {
  $('body').append('<div class="alert alert-danger alertTop">' + '<p> We asked for: <strong>' + url + '</strong></p><p> We got back a <strong>' + status + '</strong></p><p>So as a result we are unable to <strong>' + message + '</strong></p>');
};