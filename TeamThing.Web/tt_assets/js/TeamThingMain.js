APPURL = 'http://teamthing.apphb.com';
LoggedInUserID = 22;
MyThingsListDiv = '.mythingslist .list';
MyTeamThingsListDiv = '.myteamsthingslist .list';

/*
|--------------------------------------------------------------------------
|	BEGIN: GET ANY THING'S PROPERTIES
|--------------------------------------------------------------------------
*/
function GetThingProperties(ThingID,ThingFilter,ThisDiv) {
	console.log('Getting Thing ID: ' + ThingID);
	$.ajax({
  		url: APPURL+'/api/thing/'+ThingID,
  		type: 'GET',
  		success: function(ThingData) {
			
			if(ThingFilter == 'assignedTo') {
 				//console.log('assignedTo Length: ' + ThingData.assignedTo.length);
				ThingPropertiesOutput = ThingData.assignedTo.length; // How many Users are assigned to this Thing
				$(ThisDiv).text(ThingPropertiesOutput);
			}
			
  		}
	});
}
/*
|--------------------------------------------------------------------------
|	END: GET ANY THING'S PROPERTIES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: UPDATE A THING'S STATUS
|--------------------------------------------------------------------------
*/
function UpdateThing(ThingID,NewStatus) {
	console.log('Updating ID: ' + ThingID + ' with Status: ' + NewStatus);
	$.ajax({
  		url: APPURL+'/api/thing/'+ThingID+'/updatestatus',
  		type: 'PUT',
		data: {
			"UserId": LoggedInUserID,
			'Status': NewStatus
		},
		dataType: 'json',
  		success: function(TeamThingsData) {
    		console.log(TeamThingsData);
			TeamThingsOutput = '';
  		}
	});
	
}
/*
|--------------------------------------------------------------------------
|	END: UPDATE A THING'S STATUS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: STAR A THING
|--------------------------------------------------------------------------
*/
function StarThing(ThingID,NewStatus) {
	console.log('Updating ID: ' + ThingID + ' with Status: ' + NewStatus);
	$.ajax({
  		url: APPURL+'/api/thing/'+ThingID+'/star',
  		type: 'PUT',
  		success: function(TeamThingsData) {
    		console.log(TeamThingsData);
			TeamThingsOutput = '';
  		}
	});
}
/*
|--------------------------------------------------------------------------
|	END: STAR A THING
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: ACTIVATE ALL THING INTERACTIONS (TRIGGERED AFTER THINGS ARE LOADED VIA API)
|--------------------------------------------------------------------------
*/
function ActivateListViewButtons() {
	$('.users-tray').hide();
	
	$('a.users-count').bind("click", function(event) {
  		event.preventDefault();
		$(this).parent('.thing').children('.users-tray').slideToggle(250);
	});
	
	// ---- Star A Thing ---- //
	$('a.star').bind("click", function(event) {
  		event.preventDefault();
		
		ThisThingID = $(this).parent('.thingcontrols').parent('.listitem').parent('.thing').attr('id'); // traversing the divs
		ThisThingID = ThisThingID.replace('teamthing-','');
		
		if($(this).hasClass('active')) {
			$(this).removeClass('active');
			// TO DO: Need Function Call to Unstar A Thing
		} else {
			$(this).addClass('active');
			StarThing(ThisThingID,'star')
		}

	});
	// ----/ Star A Thing ---- //
	
	// ---- Change Thing Status ---- //
	$("#thingstatus").click(function() {
		
		ThisThingID = $(this).parent('.controls').parent('.thingcontrols').parent('.listitem').parent('.thing').attr('id'); // traversing the divs
		//console.log(ThisThingID);
		ThisThingID = ThisThingID.replace('teamthing-','');
		
		if($(this).is(":checked")) {
			UpdateThing(ThisThingID,'Delayed');
		} else {
			UpdateThing(ThisThingID,'InProgress');
		}
	});
	// ----/ Change Thing Status ---- //
	
	// ---- Complete A Thing ---- //
	$('.icon_complete a').bind("click", function(event) {
		event.preventDefault();
		
		ThisThingID = $(this).parent('.icon_complete').parent('.iconcontrols').parent('.controls').parent('.thingcontrols').parent('.listitem').parent('.thing').attr('id'); // traversing the divs
		console.log(ThisThingID);
		ThisThingID = ThisThingID.replace('teamthing-','');
		
		UpdateThing(ThisThingID,'Completed');
		
		GetTeamThings(getQueryVariable('teamid'),'');
		GetMyThings(LoggedInUserID,'');

	});
	// ----/ Complete A Thing ---- //
	
	/*AllMyTeamsThings = $("div[id^='teamthing-']");
	for(i=0;i<AllMyTeamsThings.length;i++) {
		
		ThisThingID = AllMyTeamsThings[i].getAttribute('id');
		ThisThingID = ThisThingID.replace('teamthing-','');
		
		ThisThingCount = GetThingProperties(ThisThingID,'assignedTo');
		console.log('Thing ID: ' + ThisThingID  + ' has ' + ThisThingCount + ' Users assigned to it');
		$(this).children('.users-count').html(ThisThingCount);
	}*/
	
	$('#loading-div').remove();
}
/*
|--------------------------------------------------------------------------
|	END: ACTIVATE ALL THING INTERACTIONS (TRIGGERED AFTER THINGS ARE LOADED VIA API)
|--------------------------------------------------------------------------
*/

function SetUpLoadingAnim(ParentDiv) {
	$(ParentDiv).append('<div id="loading-div"><img src="tt_assets/kendoui/styles/Silver/loading-image.gif"><div>');
	ParentDivHeight = $(ParentDiv).height();
	$(ParentDiv+' #loading-div').css('height', ParentDivHeight+'px');
}

function getQueryVariable(variable){
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	return(false);
}


$(document).ready(function() {

/*
|--------------------------------------------------------------------------
|	BEGIN: INIT FUNCTIONS
|--------------------------------------------------------------------------
*/
$("#tabstrip").kendoTabStrip({
	animation:	{
		open: {
			effects: "fadeIn"
		}
	}
});

$("#editor").kendoEditor({
	tools: [
		"bold",
		"italic",
		"underline"
	]
});

$("#statusfilterlist").kendoDropDownList({
    index: 0,
	change: StatusListSelected
});

function StatusListSelected() {
	ThisFilter = $('#statusfilterlist').val();
	if(ThisFilter != 'undefined' && ThisFilter != null) {
		//if ($(MyThingsListDiv).is(':visible')){
			GetMyThings(LoggedInUserID,ThisFilter);
		//}
		//if ($(MyTeamThingsListDiv).is(':visible')){
			GetTeamThings(getQueryVariable('teamid'),ThisFilter);
		//}
	}
};
/*
|--------------------------------------------------------------------------
|	END: INIT FUNCTIONS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: GET ALL TEAMS FOR PULLDOWN
|--------------------------------------------------------------------------
*/
function GetUsersTeams(UserID) {
	$.get(
		APPURL+'/api/user/'+UserID+'/teams',
    	function(data) { 
			TeamsOutput = { TeamsList: [] };
			TeamsOutput.TeamsList.push({"TeamsListLabel":"Select a Team...","TeamsListValue":""});
			for(i=0;i<data.length;i++) {
				TeamsOutput.TeamsList.push({"TeamsListLabel":""+data[i].name+"","TeamsListValue":""+data[i].id+""});
			}
			$("#jumpMenu").kendoComboBox({
				dataTextField: "TeamsListLabel",
				dataValueField: "TeamsListValue",
				dataSource: TeamsOutput.TeamsList,
				index: 0
			});
			var TeamsListSelected = function(e) {
				var dataItem = e.item.index()+1;
				console.log(dataItem);
                ThisTeamID = $('#jumpMenu :nth-child('+dataItem+')').attr('value');
    			location.href = "./main.html?teamid="+ThisTeamID;
			};
			$("#jumpMenu").data("kendoComboBox").bind("select", TeamsListSelected);
		}
	);
}
GetUsersTeams(LoggedInUserID);
/*
|--------------------------------------------------------------------------
|	END: GET ALL PUBLIC TEAMS FOR PULLDOWN
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: GET A SPECIFIC TEAM'S THINGS AND LIST THEM OUT
|--------------------------------------------------------------------------
*/
function GetTeamThings(TeamID,TeamThingsFilter) {
	
	SetUpLoadingAnim(MyTeamThingsListDiv);
	
	ThisQueryString = '';
	ThisQueryString = APPURL+'/api/team/'+TeamID+'/things/'+TeamThingsFilter;
	
	$.get(
		ThisQueryString,
    	function(TeamThingsData) { 
			console.log(TeamThingsData);
			TeamThingsOutput = '';
			for(i=0;i<TeamThingsData.length;i++) {
				
				TeamThingsOutput+='<div class="thing" id="teamthing-'+TeamThingsData[i].id+'">';
          		TeamThingsOutput+='<div class="listpic"><img src="tt_assets/images/listpic.png" width="83" height="83" alt=""></div>';
                TeamThingsOutput+='<span class="listitem">';
            		TeamThingsOutput+='<div class="thingcontrols">';
                        if(TeamThingsData[i].isStarred == true) {
							TeamThingsOutput+='<a class="star active" href="#"></a>';
						} else {
							TeamThingsOutput+='<a class="star" href="#"></a>';
						}
                        TeamThingsOutput+='<span class="controls">';
						if(TeamThingsData[i].status != 'Completed') {
							if(TeamThingsData[i].status == 'Delayed') {
             					TeamThingsOutput+='<input id="thingstatus" type="checkbox" data-icon1="In Progress" data-icon2="Delayed" checked="checked" />';
							} else if(TeamThingsData[i].status == 'InProgress') {
								TeamThingsOutput+='<input id="thingstatus" type="checkbox" data-icon1="In Progress" data-icon2="Delayed" />';
							}
						} else {
							TeamThingsOutput+='<div class="completed-status">'+TeamThingsData[i].status+'</div>';
						}
              				TeamThingsOutput+='<br />';
              				TeamThingsOutput+='<span class="iconcontrols">';
              					if(TeamThingsData[i].status != 'Completed') {
									TeamThingsOutput+='<div class="icon_complete"><a href="#"></a></div>';
								}
								TeamThingsOutput+='<div class="icon_share"><a href="#"></a></div>';
								TeamThingsOutput+='<div class="icon_edit"><a href="#"></a></div>';
								TeamThingsOutput+='<div class="icon_delete"><a href="#"></a></div>';
              				TeamThingsOutput+='</span>';
                       TeamThingsOutput+='</span>';
                    TeamThingsOutput+='</div>';
            		TeamThingsOutput+='<div class="thingdesc">'+TeamThingsData[i].description+'</div>';
				TeamThingsOutput+='</span>';
                TeamThingsOutput+='<div class="users-tray">';
                	TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic-dropzone" id="userpic-dropzone"></div>';
                    TeamThingsOutput+='<div class="clear-float"></div>';
                TeamThingsOutput+='</div>';

				ThisThingAssignedToCount = GetThingProperties(TeamThingsData[i].id,'assignedTo','#teamthing-'+TeamThingsData[i].id+' a.users-count');
				
                TeamThingsOutput+='<a class="users-count" href="#">'+ThisThingAssignedToCount+'</a>';
          	TeamThingsOutput+='</div>';
			}
			
			$(MyTeamThingsListDiv).html(TeamThingsOutput);
			
			ActivateListViewButtons();
		}
	);
}

GetTeamThings(getQueryVariable('teamid'),'');
/*
|--------------------------------------------------------------------------
|	END: GET A SPECIFIC TEAM'S THINGS AND LIST THEM OUT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: GET MY THINGS AND LIST THEM OUT
|--------------------------------------------------------------------------
*/
function GetMyThings(UserID,MyThingsFilter) {
	
	SetUpLoadingAnim(MyThingsListDiv);
	
	ThisQueryString = '';
	ThisQueryString = APPURL+'/api/user/'+UserID+'/things/'+MyThingsFilter;
	console.log(ThisQueryString);
	
	$.get(
		ThisQueryString,
    	function(TeamThingsData) { 
			console.log(TeamThingsData);
			TeamThingsOutput = '';
			for(i=0;i<TeamThingsData.length;i++) {
				
				TeamThingsOutput+='<div class="thing" id="teamthing-'+TeamThingsData[i].id+'">';
          		TeamThingsOutput+='<div class="listpic"><img src="tt_assets/images/listpic.png" width="83" height="83" alt=""></div>';
                TeamThingsOutput+='<span class="listitem">';
            		TeamThingsOutput+='<div class="thingcontrols">';
                        if(TeamThingsData[i].isStarred == true) {
							TeamThingsOutput+='<a class="star active" href="#"></a>';
						} else {
							TeamThingsOutput+='<a class="star" href="#"></a>';
						}
                        TeamThingsOutput+='<span class="controls">';
						if(TeamThingsData[i].status != 'Completed') {
							if(TeamThingsData[i].status == 'Delayed') {
             					TeamThingsOutput+='<input id="thingstatus" type="checkbox" data-icon1="In Progress" data-icon2="Delayed" checked="checked" />';
							} else if(TeamThingsData[i].status == 'InProgress') {
								TeamThingsOutput+='<input id="thingstatus" type="checkbox" data-icon1="In Progress" data-icon2="Delayed" />';
							}
						} else {
							TeamThingsOutput+='<div class="completed-status">'+TeamThingsData[i].status+'</div>';
						}
              				TeamThingsOutput+='<br />';
              				TeamThingsOutput+='<span class="iconcontrols">';
              					if(TeamThingsData[i].status != 'Completed') {
									TeamThingsOutput+='<div class="icon_complete"><a href="#"></a></div>';
								}
								TeamThingsOutput+='<div class="icon_share"><a href="#"></a></div>';
								TeamThingsOutput+='<div class="icon_edit"><a href="#"></a></div>';
								TeamThingsOutput+='<div class="icon_delete"><a href="#"></a></div>';
              				TeamThingsOutput+='</span>';
                       TeamThingsOutput+='</span>';
                    TeamThingsOutput+='</div>';
            		TeamThingsOutput+='<div class="thingdesc">'+TeamThingsData[i].description+'</div>';
				TeamThingsOutput+='</span>';
                TeamThingsOutput+='<div class="users-tray">';
                	TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic"><img src="tt_assets/images/listpic-default.png" width="55" height="55" alt=""></div>';
                    TeamThingsOutput+='<div class="userpic-dropzone" id="userpic-dropzone"></div>';
                    TeamThingsOutput+='<div class="clear-float"></div>';
                TeamThingsOutput+='</div>';
				
				ThisThingAssignedToCount = GetThingProperties(TeamThingsData[i].id,'assignedTo','#teamthing-'+TeamThingsData[i].id+' a.users-count');
				
                TeamThingsOutput+='<a class="users-count" href="#">'+ThisThingAssignedToCount+'</a>';
          	TeamThingsOutput+='</div>';
			}
			
			$(MyThingsListDiv).html(TeamThingsOutput);
			
			ActivateListViewButtons();

		}
	);
}

GetMyThings(LoggedInUserID,''); //TO DO: This number needs to be dynamic
/*
|--------------------------------------------------------------------------
|	END: GET MY THINGS AND LIST THEM OUT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: GET LOGGED IN USER'S PROFILE DETAILS
|--------------------------------------------------------------------------
*/
function UserProfile(UserID) {                   
	$.get(
		APPURL+'/api/user/'+UserID,
    	function(UserInfo) {
			console.log(UserInfo);
			$('#userpic img').attr('src',UserInfo.imagePath);
			$('#userinfo').html(UserInfo.emailAddress+'<br /><span class="usernav"><a href="#">View Profile</a> <a href="#">Sign Out</a></span>');
		}
	);
}
UserProfile(LoggedInUserID); //TO DO: This number needs to be dynamic
/*
|--------------------------------------------------------------------------
|	END: GET LOGGED IN USER'S PROFILE DETAILS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: CREATE A TEAM
|--------------------------------------------------------------------------
*/
function CreateTeam(TeamName,CreatedByID,IsPublic) {
	
	$.ajax({
  		url: APPURL+'/api/team',
  		type: 'POST',
		data: {
			'name':''+TeamName+'',
			'createdById':CreatedByID,
			'ispublic':IsPublic
		},
  		success: function(CreateTeamData) {
    		console.log(CreateTeamData);
			CreateTeamOutput = '';
  		}
	});
	
}
//CreateTeam('Graham\'s Test Team', LoggedInUserID, true); // TO DO: Assign this function to all thing buttons
/*
|--------------------------------------------------------------------------
|	END: CREATE A TEAM
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
|	BEGIN: ADD TO TEAM WINDOW AND FUNCTIONS
|--------------------------------------------------------------------------
*/

    var window = $("#addtoteam").kendoWindow({
        height: "220px",
        title: "Add to My Team",
        visible: false,
        width: "400px"
    }).data("kendoWindow");


	$(".plus").click(function(){
		var window = $("#addtoteam").data("kendoWindow");
    	window.center();
    	window.open();
	}); 
/*
|--------------------------------------------------------------------------
|	END: ADD TO TEAM WINDOW AND FUNCTIONS
|--------------------------------------------------------------------------
*/     

/*
|--------------------------------------------------------------------------
|	BEGIN: ADD THING WINDOW AND FUNCTIONS
|--------------------------------------------------------------------------
*/
    var window = $("#createthinginfo").kendoWindow({
        height: "220px",
        title: "Create a Thing",
        visible: false,
        width: "400px"
    }).data("kendoWindow");

	$("#creatething").click(function(){
    	var window = $("#createthinginfo").data("kendoWindow");
    	window.center();
    	window.open();
	});
/*
|--------------------------------------------------------------------------
|	END: ADD THING WINDOW AND FUNCTIONS
|--------------------------------------------------------------------------
*/


	

/*
|--------------------------------------------------------------------------
|	BEGIN: ADD THING WINDOW AND FUNCTIONS
|--------------------------------------------------------------------------
*/
	
	function draggableOnDragStart(e) {
		//$("#draggable img").attr('src','tt_assets/images/listpic-halo.png');
		//$("#userpic-dropzone").text("(Drop here)");
	}

	function droptargetOnDragEnter(e) {
		//$("#userpic-dropzone").text("Now you can drop it.");
	}

	function droptargetOnDragLeave(e) {
		//$("#userpic-dropzone").text("(Drop here)");
	}

	function droptargetOnDrop(e) {
		//$("#userpic-dropzone").text("You did great!");
		//$("#draggable").removeClass("hollow");
		alert('On Target');
	}

	function draggableOnDragEnd(e) {
		var draggable = $("#draggable");
		if (!draggable.data("kendoDraggable").dropped) {
    		// drag ended outside of any droptarget
     		//$("#userpic-dropzone").text("Try again!");
		}

		draggable.removeClass("hollow");
	}

	$("#draggable").kendoDraggable({
		hint: function() {
			return $("#draggable").clone();
        },
   		dragstart: draggableOnDragStart,
    	dragend: draggableOnDragEnd
	});

	$("#userpic-dropzone").kendoDropTarget({
    	dragenter: droptargetOnDragEnter,
    	dragleave: droptargetOnDragLeave,
    	drop: droptargetOnDrop
	});

	var draggable = $("#draggable").data("kendoDraggable");

});
