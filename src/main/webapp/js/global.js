/**
 * @author CTools development group
 */

/* TTD: (Things To Do)
- make search restrictions cumulative.
- use functions to avoid duplication when making search functions.

*/


var debugMsg = function(msg) {
    // uncomment line if want debug messages
    //console.log("dbM: ",msg);
}

var resetSearch = function(tag){
    debugMsg("resetSearch tag: "+tag);
    $(tag).val('');
    $('.list-group-item').show();
}

var resetSearchAll = function() {
    resetSearch('#txtSearch');
    resetSearch('#assigneeSearchTxt');
    resetSearch('#prioritySearchTxt');
    resetSearch('#reporterSearchTxt');
}

var resetSearchBoxes = function() {
    $('#txtSearch').val('');
    $('#assigneeSearchTxt').val('');
    $('#prioritySearchTxt').val('');
    $('#reporterSearchTxt').val('');
}

$(document).ready(function() {

    resetSearchAll();

    //JIRA DATA MANIPULATIONS
    var itemsTodo ="", inProgress ="", review = ""; 
    var cTodo=0, cProgress=0, cReview=0;

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
     		$("<span id='cTodo' class='counter'>"+wipQ.todo+"</span>").appendTo('#todo-li');
     		$("<span id='cProgress' class='counter'>"+wipQ.inprogress+"</span>").appendTo('#inprogress-li');
     		$("<span id='cReview' class='counter'>"+wipQ.review+"</span>").appendTo('#review-li');
     	    });
        });
        $("<span id='cTodo' class='counter'>"+cTodo+"</span>").appendTo('#todo-li');
        $("<span id='cProgress' class='counter'>"+cProgress+"</span>").appendTo('#inprogress-li');
        $("<span id='cReview' class='counter'>"+cReview+"</span>").appendTo('#review-li');
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
    }


    //SEARCH CODE

    // search for text from text field
    $('#txtSearch').keyup(function(event){

	resetSearch('#assigneeSearchTxt');
	resetSearch('#prioritySearchTxt');
	resetSearch('#reporterSearchTxt');

	searchForText($('#txtSearch').val());

	if (event.keyCode == 27) {
	    resetSearch('#txtSearch');
        }
    });

    $('#assigneeSearchTxt').keyup(function(event){

	resetSearch('#txtSearch');
	resetSearch('#prioritySearchTxt');
	resetSearch('#reporterSearchTxt');

	searchForText('Assignee: '+$('#assigneeSearchTxt').val());

	if (event.keyCode == 27) {
	    resetSearch('#assigneeSearchTxt');
        }
    });

    $('#prioritySearchTxt').keyup(function(event){

	resetSearch('#txtSearch');
	resetSearch('#assigneeSearchTxt');
	resetSearch('#reporterSearchTxt');

	searchForText('Priority: '+$('#prioritySearchTxt').val());

	if (event.keyCode == 27) {
	    resetSearch('#prioritySearchTxt');
        }
    });

    $('#reporterSearchTxt').keyup(function(event){

	resetSearch('#txtSearch');
	resetSearch('#assigneeSearchTxt');
	resetSearch('#prioritySearchTxt');

	searchForText('Reporter: '+$('#reporterSearchTxt').val());

	if (event.keyCode == 27) {
	    resetSearch('#reporterySearchTxt');
        }
    });

    // search items for specific text
    var searchForText = function(textToFind) {
	debugMsg("sFT: "+textToFind);
        // reset all counts
	var cTodo=0, cProgress=0, cReview=0;

        if (textToFind.length > 0) {

	    // hide things but then show items with matching text.
            $('.list-group-item').hide();
            $('.list-group-item:Contains(\'' + textToFind          + '\')').show();
	    
	    // calculate number of entries in each group.
            cTodo = $('.list-group-item:Contains(\'' + textToFind          + '\'):Contains("todo-label")').length ;
	    cProgress = $('.list-group-item:Contains(\'' + textToFind          + '\'):Contains("inprogress-label")').length;
	    cReview = $('.list-group-item:Contains(\'' + textToFind          + '\'):Contains("review-label")').length;
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

    // supply and format the basic data common to each column.
    function baseTaskFields (data, label, labelClass) {
	var taskString =
    	    "<li class='list-group-item'>" +
            "<a target='_blank' href='"+data.url+"'>" + data.title + "</a><br/>" +
            "<span class='assignee-style'>Assignee: "+data.assignee+"</span><br/>" +
            "<span class='reporter-style'>Reporter: "+data.reporter+"</span><br/>" +
            "<span class='priority-style'>Priority: "+data.priority+"</span><br/>" + 
            "<span style='display:none'>" + label+"</span>" + 
            "<span id='" +label + "' class ='"+labelClass+"'>"+data.labels+"</span></li>"
	return taskString;
    }

    
});
