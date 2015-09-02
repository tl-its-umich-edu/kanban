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
var otherSearchFields = function(name){
    var clone = searchFields.slice(0);
    var thisNameIndex = clone.indexOf(name);
    clone.splice(thisNameIndex, 1);
    debugMsg("otherSearchFields: " + clone);
    return clone;
};

var debugMsg = function(msg){
    // uncomment line if want debug messages
    //    console.log("dbM: ",msg);
};

// Reset display by taking out the search text and show all the items.
var resetSearch = function(tag){
    //    debugMsg("resetSearch tag: "+tag);
    $(tag).val('');
    $('.list-group-item').show();
};

// Reset the search info for all the other search fields.
var resetSearchOther = function(tag){
    var searchTag;
    var arrayCounter = 0;
    var arrayLength = 0;
    
    var otherSearchers = otherSearchFields(tag);
    
    // use revised loop to reset the other search boxes.
    for (arrayCounter = 0, arrayLength = otherSearchers.length; arrayCounter < arrayLength; arrayCounter++) {
        debugMsg("atag: " + otherSearchers[arrayCounter]);
        resetSearch(otherSearchers[arrayCounter]);
    }
    return otherSearchers;
};

var resetSearchAll = function(){
    resetSearchOther();
};

Object.keyAt = function(obj, index) {
    var i = 0;
    for (var key in obj) {
        if ((index || 0) === i++) return key;
    }
};


$(document).ready(function(){

    var urlParams;
    (window.onpopstate = function(){
        var match, pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g, decode = function(s){
            return decodeURIComponent(s.replace(pl, " "));
        }, query = window.location.search.substring(1);
        
        urlParams = {};
        while (match = search.exec(query)) {
            urlParams[decode(match[1])] = decode(match[2]);
        }
    })();

    resetSearchAll();
    
    
    //JIRA DATA MANIPULATIONS
    var itemsTodo = "", inProgress = "", review = "";
    var cTodo = 0, cProgress = 0, cReview = 0;
    var counterClass = "label label-default";
    
    var getData = function(what){
    
        $('#inner-body-ul-for-todopanel li').remove();
        $('#inner-body-ul-for-inprogress li').remove();
        $('#inner-body-ul-for-review li').remove();
        
		$('.titleStatus').hide();
        
        $.getJSON('/jirarequest', what, function(jiraData){
			$('.titleStatus').show();
            cTodo = 0;
            cProgress = 0;
            cReview = 0;
            $.each(jiraData, function(i, data){
                var labelClass = labelMagic(data);
                
                if ((data.status === "Awaiting Review") || (data.status === "Open") || (data.status === "Reopened")) {
                    cTodo++;
                    itemsTodo = baseTaskFields(data, 'todo-label', labelClass);
                    $(itemsTodo).appendTo('#inner-body-ul-for-todopanel');
                }
                else 
                    if ((data.status === "In Progress") || (data.status === "Development in Progress") || (data.status === "Deploy")) {
                        cProgress++;
                        inProgress = baseTaskFields(data, 'inprogress-label', labelClass);
                        $(inProgress).appendTo('#inner-body-ul-for-inprogress');
                    }
                    else 
                        if ((data.status === "Resolved") || (data.status === "QA Testing") || (data.status == "In QA")) {
                            cReview++;
                            review = baseTaskFields(data, 'review-label', labelClass);
                            $(review).appendTo('#inner-body-ul-for-review');
                        }
                
            });
            $.getJSON('/jirarequest', 'wip', function(wipResult){
				$('.titleStatus').show();
                $.each(wipResult, function(i, wipQ){
                    $('span#cTodo1').text($('#inner-body-ul-for-todopanel li:visible').length).addClass('label-success');
                    // we may use wipQ.todo for a 4th column (backlog vs todo) but for now, it's unneeded
                    $('span#cTodo2').text('n/a');
                    
                    if (cProgress > wipQ.inprogress) {
                        counterClass = "label-danger";
                    }
                    else {
                        counterClass = "label-success";
                    }
                    $('span#cProgress1').attr('class', 'label ' + counterClass).text($('#inner-body-ul-for-inprogress li:visible').length);
                    $('span#cProgress2').attr('class', 'label label-default').text(wipQ.inprogress);
                    
                    if (cReview > wipQ.review) {
                        counterClass = "label-danger";
                    }
                    else {
                        counterClass = "label-success";
                    }
                    $('span#cReview1').attr('class', 'label ' + counterClass).text($('#inner-body-ul-for-review li:visible').length);
                    $('span#cReview2').attr('class', 'label label-default').text(wipQ.review);
                });
                var tabletToDoCont = $( "#todo-li h4" ).clone();
                $( "#tablet-todo" ).html(tabletToDoCont)
                var inProgressCont = $( "#inprogress-li h4" ).clone();
                $( "#tablet-inprogress" ).html(inProgressCont)
                var reviewCont = $( "#review-li h4" ).clone();
                $( "#tablet-review" ).html(reviewCont);
                $('#wait-div').hide();
            })
            var searchKey = Object.keyAt(urlParams, 0);
            var searchVal = urlParams[searchKey];
            if (searchVal) {
                $('#' + searchKey).val(searchVal).keyup();
            }
            $('span#cTodo1').text($('#inner-body-ul-for-todopanel li:visible').length)
            debugMsg("end of json request processing");
        });

    };
    
   //initial get - T&L data is the default
   getData('.tl');
	$('.tlstaffbutton').attr('disabled','disabled')
    $('.allstaffbutton').removeAttr('disabled')
    $('#filterIssues small').hide();
    $('#filterIssues small#messageTlStaff').show();
    
    
    
    // displaying Labels with different CSS
    function labelMagic(data){
        var temp = "";
        if (data.labels === "um-priority") {
            temp = "label";
        }
        else 
            if (data.labels === " " || data.labels === "") {
                temp = "label-none";
            }
            else {
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
    var setupSearchField = function(searchField, prefix){
    
        // store the identifer so it can be used when cleaning up
        // search field display.
        
        searchFields.push(searchField);
        
        // create the keyup function to do the search.
        
        $(searchField).keyup(function(event){
        
            resetSearchOther(searchField);
            searchForText(prefix + $(searchField).val());
            
            if (event.keyCode == 27) {
                resetSearch(searchField);
            }
        });
    };
    
    // Add the jquery id and text to search for.
    
    // To add search still need to:
    // - add to searchField list above, 
    // - have spot on index.html, 
    // - and have entry in css,
    // - be in xslt
    
    setupSearchField('#txtSearch', '');
    setupSearchField('#assigneeSearchTxt', 'Assignee: ');
    setupSearchField('#prioritySearchTxt', 'Priority: ');
    setupSearchField('#reporterSearchTxt', 'Reporter: ');
    setupSearchField('#projectKeySearchTxt', 'ProjectKey: ');
	setupSearchField('#txtSearch2', '');
	setupSearchField('#labelKeySearchTxt', '');
    setupSearchField('#assigneeSearchTxt2', 'Assignee: ');
    setupSearchField('#prioritySearchTxt2', 'Priority: ');
    setupSearchField('#reporterSearchTxt2', 'Reporter: ');
    setupSearchField('#projectKeySearchTxt2', 'ProjectKey: ');
	setupSearchField('#labelKeySearchTxt2', '');
    
    // search items for specific text
    var searchForText = function(textToFind){

        debugMsg("sFT: " + textToFind);
        // reset all counts
        var cTodo = 0, cProgress = 0, cReview = 0;
        
        if (textToFind.length > 0) {
        
            // hide things but then show items with matching text.
            $('.list-group-item').hide();
            $('.list-group-item:Contains(\'' + textToFind + '\')').show();
            
            // calculate number of entries in each group.
            cTodo = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("todo-label")').length;
            cProgress = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("inprogress-label")').length;
            cReview = $('.list-group-item:Contains(\'' + textToFind + '\'):Contains("review-label")').length;
            $('#cTodo1').text(cTodo);
            $('#cProgress1').text(cProgress);
            $('#cReview1').text(cReview);
        }
        
        if (textToFind.length === 0) {
            resetSearch();
        }
    };
    
    
    //empowering Contains method with case-insensitivity 
    $.expr[':'].Contains = function(a, i, m){
        return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
    
    // supply and format the basic data common to each item.
    function baseTaskFields(data, label, labelClass){
        var taskString = "<li class='list-group-item'>" +
        "<a target='_blank' href='" +
        data.url +
        "'>" +
        data.title +
        "</a><br/>" + 
        "<span class='priority-style'>Priority: " +
        data.priority +
        "</span>";
        
        if (data.component){
            taskString += "<span class='component-style'>Component: " +
            data.component +
            "</span>";
        }
            
        taskString += "<br/><span class='assignee-style'>Assignee: " +
        data.assignee +
        "</span><br/>" +
        "<span class='reporter-style'>Reporter: " +
        data.reporter +
        "</span><br/>";
        
        if  (label == "review-label"){
            taskString += "<span class='updated-style'>Last Updated: " +
            data.updated +
            "</span><br/>";
        }
        else if (data.fixVersion){
            taskString += "<span class='version-style'>Fix Version: " +
            data.fixVersion +
            "</span><br/>";
        }
        
        var labelString="";
        $.each(data.labels, function(index, value ) {
            labelString += "<span class ='label-style " +
            labelClass +
            "'>" + value +
            "</span> "
        });
        taskString += labelString +
        "<span style='display:none'>ProjectKey: " +
        data.projectKey +
        "</span>" +
        "<span style='display:none'>" +
        label +
        "</span></li>";
        
        return taskString;
    }
    
    $('.tlstaffbutton').click(function(){
      getData('.tl');
		$('.tlstaffbutton').attr('disabled','disabled')
        $('.allstaffbutton').removeAttr('disabled')
		$('#filterIssues small').hide();
        $('#filterIssues .messageTlStaff').show();
    });
    
    $('.allstaffbutton').click(function(){
      getData('.all');
		$('.allstaffbutton').attr('disabled','disabled')
        $('.tlstaffbutton').removeAttr('disabled')
        $('#filterIssues small').hide();
        $('#filterIssues .messageAllStaff').show();
    });
    $('#helpPanelControl').click(function(){
        var position = $(this).position();
        $('#helpPanel').css({'top':position.top + 30,'left':position.left -30}).show();
    })
    $('.close').click(function(){
        $('#helpPanel').hide()
    })
	$('#searchPicker a').click(function(){
		var inputShow = $(this).attr('class');
		$('.mobileSearch span').hide();
		$('.mobileSearch span.' + inputShow).fadeIn('slow');
	})
    
    $(document).ajaxStart(function(){
        $("#wait-div").show();
    });
    $(document).ajaxStop(function(){
        $("#wait-div").hide();
    });
});
