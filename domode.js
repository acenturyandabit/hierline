function showDoMode(){
	$("#doModeScreen").fadeIn();
	$("#hierarchy_div").hide();
	$("#currentTaskBox").hide();
	$("#timeline").hide();
	$("#slbt").html("Up Next");
	$("#properAdd").html("Do Now");
	$("#properAdd").off("click");
	$("#properAdd").on("click", newDoNow);
	$("#scrollContainer").css("width","100%");
	currentScreen=0;
	drawDoModeScreen();	
	verifyAll();
}

var currentNode;

function doModeSort(a, b) {
	if (a.children.length && !b.children.length)return 1;
	else if (!a.children.length && b.children.length)return -1;
	var p = a.getSortableDate().valueOf() - b.getSortableDate().valueOf();
	if (p)
	return p;
	else {
		p = b.hierarchy_level() - a.hierarchy_level();
		if (p)return p;
		else {
			p = a.creationDate.valueOf() - b.creationDate.valueOf();
			if (p)
			return p;
			else {
				p = a.id - b.id;
				return p;
			}
		}
	}
}

function drawDoModeScreen(forcedDo) {
	if(nodes.length){
		if (!forcedDo){
			nodes.sort(doModeSort);
			currentNode=nodes[0];
		}
		$("#dm_tname")[0].value=currentNode.name;
		$("#dm_tdesc")[0].value=currentNode.longdesc;
		//populate up next
		$("#blocks").empty();
		for (var i=0;i<10;i++){
			if (nodes[i] && nodes[i]!=currentNode)$("#blocks")[0].appendChild(nodes[i].div);
		}
		$(".reanchor").html("&#9650;");
		$(".reanchor").off("click");
		$(".reanchor").on("click",doSelNow);
	}
}


$(document).ready(dm_init);
function dm_init(){
	$("#dm_tname").on("keyup",dmCTname);
	$("#dm_tdesc").on("keyup",dmCTdesc);
	$(".ce").on("keypress",validate);
}

function validate(e){
	if (e.charCode==13) return false;
	
}


function dmCTname(){
	currentNode.setName($("#dm_tname")[0].value);
}
function dmCTdesc(){
	currentNode.setlongdesc($("#dm_tdesc")[0].value);
}

function newDoNow(){
	if ($("#newTaskBox")[0].value){
		var newNode = makeNode($("#newTaskBox")[0].value);
		currentNode=newNode;
		drawDoModeScreen(true);
		$("#newTaskBox")[0].value="";
	}else{
		$("#newTaskBox")[0].placeholder="Please enter a Task name!";
		setTimeout (()=>{$("#newTaskBox")[0].placeholder="Task";},1500);
	}
}

function doSelNow(e) {
	$("#status").html("Doing current task now");
	setTimeout(()=>{$("#status").html("Ready");},1500);
	currentNode = getNode(e.currentTarget.parentElement.parentElement.id.split("_")[1]);
	drawDoModeScreen(true);
}
var returnDoMode=false;
function domReanchor(){
	returnDoMode=true;
	anchorID=currentNode.id;
	$("#status").html("Select timeslot");
	showTimeline();
	
}