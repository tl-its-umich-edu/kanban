'use strict';
/* global $, document */


var errorDisplay = function(url, status, message) {
  $('body').append('<div class="alert alert-danger alertTop">' + '<p> We asked for: <strong>' + url + '</strong></p><p> We got back a <strong>' + status + '</strong></p><p>So as a result we are unable to <strong>' + message + '</strong></p>');
};

$(document).on('click','.goto', function(e){
  var scrollTo = $(this).attr('data-href');
  $("html, body").delay(500).animate({scrollTop: $('#' + scrollTo).offset().top }, 500);
});


$(document).ready(function() {
  $('#searchInPage').keyup(function() {
    var filter = $(this).val();
    $('li.list-group-item').each(function() {
      if ($(this).text().search(new RegExp(filter, 'i')) < 0) {
        $(this).fadeOut();
      } else {
        $(this).show();
      }
    });
  });
});
