/**
 * @author CTools development group
 */

/* TTD: (Things To Do)
   - make search restrictions cumulative.
   - use functions to avoid duplication when making search functions.

*/

var searchFields = [];

// Return list of the all the search fields 
// besides the one passed in.
var otherSearchFields = function(name) {
    var clone = searchFields.slice(0);
    var thisNameIndex = clone.indexOf(name);
    clone.splice(thisNameIndex,1);
    debugMsg("otherSearchFields: "+clone);
    return clone;
};

var debugMsg = function(msg) {
    // uncomment line if want debug messages
    //    console.log("dbM: ",msg);
}

// Reset display by taking out the search text and show all the items.
var resetSearch = function(tag){
    //    debugMsg("resetSearch tag: "+tag);
    $(tag).val('');
    $('.list-group-item').show();
}

// Reset the search info for all the other search fields.
var resetSearchOther = function(tag) {
    var searchTag;
    var arrayCounter = 0;
    var arrayLength = 0;

    var otherSearchers = otherSearchFields(tag);

    // use revised loop to reset the other search boxes.
    for (arrayCounter=0, arrayLength = otherSearchers.length; arrayCounter < arrayLength; arrayCounter++) { 
   debugMsg("atag: "+otherSearchers[arrayCounter]);
   resetSearch(otherSearchers[arrayCounter]);
    }
    return otherSearchers;
}

var resetSearchAll = function() {
    resetSearchOther();
}

$(document).ready(function() {

    resetSearchAll();

    //JIRA DATA MANIPULATIONS
    var itemsTodo ="", inProgress ="", review = ""; 
    var cTodo=0, cProgress=0, cReview=0;
    var counterClass="counter";

    $.getJSON('/kanban/jirarequest','OK', function(jiraData) {
   document.getElementById("wait-div").style.display = 'none';
        $.each(jiraData, function(i, data) {
            var labelClass=labelMagic(data);
            
            if ((data.status === "Awaiting Review")||(data.status === "Open")||(data.status === "Reopened")) {
               cTodo++;
               itemsTodo = baseTaskFields(data, 'todo-label', labelClass);
                $(itemsTodo).appendTo('#inner-body-ul-for-todopanel');
            } else if ((data.status === "In Progress")||(data.status === "Development in Progress")) {
               cProgress++;
                inProgress = baseTaskFields(data, 'inprogress-label', labelClass);
                $(inProgress).appendTo('#inner-body-ul-for-inprogress');
            } else if((data.status==="Resolved")||(data.status==="QA Testing")){
               cReview++;
                review = baseTaskFields(data, 'review-label', labelClass);
                $(review).appendTo('#inner-body-ul-for-review');
            }

        });
        $.getJSON('/kanban/jirarequest','wip',function(wipResult){
          $.each(wipResult, function(i, wipQ) {
            $("<span id='cTodo' class='counterGreen'>"+cTodo+"</span>").appendTo('#todo-li');
            // we may use wipQ.todo for a 4th column (backlog vs todo) but for now, it's unneeded
            $("<span id='cTodo' class='counter'>n/a</span>").appendTo('#todo-li');
             
            if ( cProgress > wipQ.inprogress )
               counterClass="counterRed";
            else
               counterClass="counterGreen";
            $("<span id='cProgress' class='"+counterClass+"'>"+cProgress+"</span>").appendTo('#inprogress-li');
            $("<span id='cProgress' class='counter'>"+wipQ.inprogress+"</span>").appendTo('#inprogress-li');
            
            if ( cReview > wipQ.review )
               counterClass="counterRed";
            else
               counterClass="counterGreen";
            $("<span id='cReview' class='"+counterClass+"'>"+cReview+"</span>").appendTo('#review-li');
            $("<span id='cReview' class='counter'>"+wipQ.review+"</span>").appendTo('#review-li');
          });
        });
        
        $("<h4>To Do("+cTodo+")</h4>").appendTo("#tablet-todo");
        $("<h4>In Progress("+cProgress+")</h4>").appendTo("#tablet-inprogress");
        $("<h4>Review("+cReview+")</h4>").appendTo("#tablet-review");

   debugMsg("end of json request processing");
    });


    // displaying Labels with different CSS
    function labelMagic(data) {
   var temp = "";
   if (data.labels === "um-priority") {
       temp = "label";
   } else if (data.labels === " " || data.labels === "") {
       temp = "label-none";
   } else {
       temp = "label label-info";
   }
   return temp;
    };


    //SEARCH CODE methods

    /*
     * Search on fields based on exact text (to find text) and a 
     * jquery identifier (to display/hide and format text).
     */

    // Pass in jquery identifier and the text to search for.
    var setupSearchField = function(searchField,prefix) {

   // store the identifer so it can be used when cleaning up
   // search field display.

   searchFields.push(searchField);
   debugMsg("searchFields: ",searchFields);

   // create the keyup function to do the search.

   $(searchField).keyup(function(event){

       resetSearchOther(searchField);
       searchForText(prefix+$(searchField).val());

       if (event.keyCode == 27) {
      resetSearch(searchField);
            }
   })
    };

    // Add the jquery id and text to search for.

    // To add search still need to:
    // - add to searchField list above, 
    // - have spot on index.html, 
    // - and have entry in css,
    // - be in xslt

    setupSearchField('#txtSearch','');
    setupSearchField('#assigneeSearchTxt','Assignee: ');
    setupSearchField('#prioritySearchTxt','Priority: ');
    setupSearchField('#reporterSearchTxt','Reporter: ');
    setupSearchField('#projectKeySearchTxt','ProjectKey: ');

    // search items for specific text
    var searchForText = function(textToFind) {
   debugMsg("sFT: "+textToFind);
        // reset all counts
   var cTodo=0, cProgress=0, cReview=0;

        if (textToFind.length > 0) {

       // hide things but then show items with matching text.
            $('.list-group-item').hide();
            $('.list-group-item:Contains(\'' + textToFind + '\')').show();
       
       // calculate number of entries in each group.
            cTodo = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("todo-label")').length ;
       cProgress = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("inprogress-label")').length;
       cReview = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("review-label")').length;
       $('#cTodo').html(cTodo);
       $('#cProgress').html(cProgress);
       $('#cReview').html(cReview);
   }

   if (textToFind.length == 0) {
       resetSearch();
   }
    }


    //empowering Contains method with case-insensitivity 
    $.expr[':'].Contains = function(a, i, m){
   return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    // supply and format the basic data common to each item.
    function baseTaskFields (data, label, labelClass) {
   var taskString =
          "<li class='list-group-item'>" +
            "<a target='_blank' href='"+data.url+"'>" + data.title + "</a><br/>" +
            "<span class='assignee-style'>Assignee: "+data.assignee+"</span><br/>" +
            "<span class='reporter-style'>Reporter: "+data.reporter+"</span><br/>" +
            "<span class='priority-style'>Priority: "+data.priority+"</span><br/>" + 
            "<span id='" +label + "' class ='"+labelClass+"'>"+data.labels+"</span>" +
            "<span style='display:none'>ProjectKey: "+data.projectKey+"</span>" + 
            "<span style='display:none'>" + label+"</span></li>"
   return taskString;
    }


});
