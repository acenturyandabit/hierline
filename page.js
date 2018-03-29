

//some basic functions

var item_height = 20;
var item_width = 60;
var starter_quotes=[
	"Next level project management",
	"Hit all them yeets!",
	"By tomorrow...",
	"Turbo Tasklist!",
	"What do you call a prince's private jet?"
];
var currentScreen;

/*
0: domode
1: hierarchy
2: timeline
*/

function showCurrentScreen(){
	switch(currentScreen){
		case 0:
			showDoMode();
			break;
		case 1:
			showHierarchy();
			break;
		case 2: 
			showTimeline();
			break;
	}
}

function drawCurrentScreen(){
	switch(currentScreen){
		case 0:
			break;
		case 1:
			drawHierarchy();
			break;
		case 2: 
			drawTimeline();
			break;
	}
}


$(document).ready(initialise); //register initialise() to be run when document loads - safer than just running it when this script is loaded because then we're guarunteed some elements will be loaded.
var MOUSE_OVER = false;
function initialise() {
	//get a random quote
	$("#top_bar>div>p").html(starter_quotes[Math.round(Math.random()*starter_quotes.length)])
	rootNode=new dataItem("Tasks","rootNode");
	//generate some sample nodes
	$("#loadFile").on("change", loadFile);
	$("#newTaskBox").on("keydown",enterCheck);
	$("html").on("keydown", escapeCheck);
	$("html").on("click", hideMenu);
	$("#domReanchor").on("click",domReanchor);
	setInterval(drawTimeline, 10000);
	setInterval(remindSave, 1000000);
	autoLoad();
	//drawHierarchy(nodes[0]);
	$('body').bind('mousewheel', function (e) {
		if (MOUSE_OVER) {
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.returnValue = false;
			return false;
		}
	});

	$('.specialScroll').mouseenter(function (e) {
		MOUSE_OVER = true;
	});
	$('.specialScroll').mouseleave(function (e) {
		MOUSE_OVER = false;
	});

	$('#blocks').bind('mousewheel', function (e) {
		var delta = e.originalEvent.deltaY;
		if (delta==0 || delta==-0)delta=e.originalEvent.deltaX;
		e.currentTarget.scrollLeft+=delta/5;
	});
	currentScreen=0;
	showDoMode();
}

function remindSave(){
$("#status").html("Haven't saved in a while. Save now? (Menu > Save to file)");
}

function resetStatus(){
	$("#status").html("Ready");
	anchorID = -1;
	$("#floaterTLbox").hide();
	$("html").focus();
	$("#floatingMenu").hide();
}

function escapeCheck(e) {
	if (e.key == "Escape") {
		resetStatus();
	}
	if (e.key=="Delete" && e.ctrlKey){
		if (currentScreen==1)removeNode(HRcurrentNode);
		else removeNode(currentNode);
	}
	if (e.key == "s" && e.ctrlKey) {
		autoSave();
		$("#status").html("Saved locally. Autosave is on.");
		return false;
	}
}

function hideMenu(e){
	if (!e.originalEvent.target.classList.contains("menubits")){
		$('#floatingMenu').hide();
	}
}

function enterCheck(e){
	if (e.key == "Enter") {
		moreBoxes();
	}
	
}

function toggleMenu(){
	$('#floatingMenu').toggle();
}

function showBin(){
	$('#floatingMenu').hide();
	//populate bin
	$(".deletedItem").remove();
	for (var i of deletedNodes){
		var itemName=document.createElement("p");
		itemName.innerHTML=i.name;
		itemName.classList.add("deletedItem");
		itemName.id="dlit_"+i.id;
		$("#recycleBin")[0].appendChild(itemName);
	}
	$(".deletedItem").on("click", restoreItem);
	$('#recycleBin').show();
}

function restoreItem(e){
	for (var i of deletedNodes){
		if (i.id==e.currentTarget.id.split("_")[1]){
			nodes.push(i);
			deletedNodes.splice(deletedNodes.indexOf(i),1);
			break;
		}
	}
	showBin();	
}

function hideBin(){
	$('#recycleBin').hide();
	
}