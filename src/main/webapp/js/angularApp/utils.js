'use strict';
/* global $ */


var errorDisplay = function(url, status, message) {
  $('body').append('<div class="alert alert-danger alertTop">' + '<p> We asked for: <strong>' + url + '</strong></p><p> We got back a <strong>' + status + '</strong></p><p>So as a result we are unable to <strong>' + message + '</strong></p>');
};

$(document).ready(function(){
    $("#searchInPage").keyup(function(){
        var filter = $(this).val();
        $("li.list-group-item").each(function(){
            if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                $(this).fadeOut();
            } else {
                $(this).show();
            }
        });
 
    });
});
