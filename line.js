function showTimeline(){
	if (!currentNode)currentNode=nodes[0];
	$("#doModeScreen").hide();
	$("#currentTaskBox").show().css('display', 'flex');
	$("#hierarchy_div").hide();
	$("#timeline").fadeIn();
	$("#slbt").html("To Organise");
	$("#scrollContainer").css("width","75%");
	$("#properAdd").html("Add event");
	$("#properAdd").off("click");
	$("#properAdd").on("click",addAndSchedule);
	currentScreen=2;
	drawTimeline();
	orgBoxTL();
	verifyAll();
}
var tl_item_width;
var tl_item_height;
$(document).ready(tlInit);
var sbdmax=19;

function seeNow(){
	tlD=0;
	sbD=-2;
	var p=new Date();
	if (p.getHours()+sbD<0)sbD=-p.getHours();
	if (p.getHours()+sbD>sbdmax)sbD=sbdmax-p.getHours();
	drawTimeline();
}

function tlInit(){
	TLsvg=SVG('timeline').size($("body").width(), $("body").height() * 0.5);
	$('#timeline').bind('mousewheel', function (e) {
		var delta = e.originalEvent.deltaY; 
		if (e.shiftKey){
			if (delta!=0){
				tlD+=(delta>0)*2-1;
			}
		}else{
			if (delta!=0){
				sbD+=(delta>0)*2-1;
			}
		}
		
		var deltax = e.originalEvent.deltaX; if (deltax!=0){
			tlD+=(deltax>0)*2-1;
		}
		var p = new Date();
		if (p.getHours()+sbD<0)sbD=-p.getHours();
		if (p.getHours()+sbD>sbdmax)sbD=sbdmax-p.getHours();
		drawTimeline();
	});
	scale=0;
	tl_item_width=$("body").width()*0.1;
	tl_item_height=$("body").height()*0.05;
	TLsvg.click(findTime);
	$("#floaterTB").on("blur",nullify);
	$("#floaterTB").on("keypress",flkp);
}

var TLsvg;
var TLcenter;
var scale;
/*
0: Week view view
1: Month view
*/
var tlD=0; //delta units of how far we've moved. days or weeks
var sbD=0;
function roundTo(datea, _scale) {
	if (_scale==undefined)_scale = scale;
	var altDate = new Date(datea.valueOf());
	if (_scale)altDate.setHours(0);//scale to the day
	return altDate;
}
var cday;
var chour;
function orgBoxTL(){
	$("#blocks>div").remove();
	$("#currentTaskBox>div").remove();
	if (!currentNode)currentNode=nodes[0];
	$("#currentTaskBox")[0].appendChild(currentNode.div);
	var count=0;
	for (var i of nodes){
		if (i!=currentNode && !i.taskDate){
			$("#blocks")[0].appendChild(i.div);
			count++;
		}if (count>10)break;
	}
	$(".reanchor").html("&#9201;");
	$(".reanchor").off("click");
	$(".reanchor").on("click",TLreanchor);
}

function resetDate(){
	cday=roundTo(new Date());
	cday.setDate(cday.getDate()+tlD);
	cday.setSeconds(0);
	cday.setMinutes(0);
	cday.setHours(0);
	chour=new Date();
	chour.setSeconds(0);
	chour.setMinutes(0);
	chour.setHours(chour.getHours()+sbD);
	if (chour.getHours()>sbdmax){
		sbD-=sbdmax-chour.getHours();
		chour.setHours(sbdmax);
	}
	
}



function drawTimeline(){
	
	switch(scale){
		case 0:
			drawDay();
			break;
		case 1:
			drawMonth();
			break;
	}
}



function withinTime(i){
	//is the node i within chour and cday?
	
	
}


function drawDay(){
	TLsvg.clear();
	//header row: days: 8
	resetDate();
	var TLscalecount={};
	var TLputcount={};
	//count concurrent tasks
	for (var i of nodes){
		if (i.taskDate){
			if (TLscalecount[i.taskDate.valueOf()])TLscalecount[i.taskDate.valueOf()]++;
			else TLscalecount[i.taskDate.valueOf()]=1;
		}
	}
	
	//highlight working hours
	TLsvg.rect(tl_item_width*9, 20*tl_item_height).move(tl_item_width,tl_item_height-(chour.getHours()-8)*tl_item_height*2).fill("#9999ff");
	//splitting nodes for multiple events on at the same time
	for (var i of nodes){
		if (i.taskDate && (i.taskDate.getHours()>=chour.getHours()||i.endDate.getHours()<=chour.getHours()+2) && (i.taskDate.getTime()>=cday.getTime() || i.endDate.getTime()<=(cday.getTime()))){
			if (TLputcount[i.taskDate.valueOf()])TLputcount[i.taskDate.valueOf()]++;
			else TLputcount[i.taskDate.valueOf()]=1;
			chour.setDate(i.taskDate.getDate());
			chour.setMonth(i.taskDate.getMonth());
			var nx=Math.floor((i.taskDate.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width+tl_item_width*(TLputcount[i.taskDate.valueOf()]-1)/TLscalecount[i.taskDate.valueOf()];
			var ny=Math.round((i.taskDate.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height;
			TLsvg.rect(tl_item_width/TLscalecount[i.taskDate.valueOf()],(i.endDate.valueOf()-i.taskDate.valueOf())/1800000*tl_item_height).move(nx,ny).fill((i==currentNode)?"#00ff00":"#ffffff").click(TLSelectNode).attr({id:"tler_"+i.id});//.mouseover(showdrag).mouseout(hidedrag);
		}
	}
	chour.setDate(new Date().getDate());
	chour.setMonth(new Date().getMonth());
	//little now arrow
	var _nx=Math.floor((Date.now()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width;
	var _ny=(Date.now()-chour.valueOf())/(30*60*1000)*tl_item_height+tl_item_height;
	TLsvg.line(_nx,_ny,_nx+tl_item_width,_ny).stroke({width:3,color:"#ff00ff"});
	//draw events
	var TLputcount={};
	for (var i of nodes){
		if (i.taskDate && (i.taskDate.getHours()>=chour.getHours()||i.endDate.getHours()<=chour.getHours()+2) && (i.taskDate.getTime()>=cday.getTime() || i.endDate.getTime()<=(cday.getTime()))){
			chour.setDate(i.taskDate.getDate());
			chour.setMonth(i.taskDate.getMonth());
			if (TLputcount[i.taskDate.valueOf()])TLputcount[i.taskDate.valueOf()]++;
			else TLputcount[i.taskDate.valueOf()]=1;
			var nx=Math.floor((i.taskDate.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width+tl_item_width*(TLputcount[i.taskDate.valueOf()]-1)/TLscalecount[i.taskDate.valueOf()];
			var ny=Math.round((i.taskDate.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height;
			var txt=TLsvg.text(i.name).move(nx,ny).attr('pointer-events','none');
			var clip = TLsvg.clip().add(txt);
			var clap = TLsvg.rect(tl_item_width/TLscalecount[i.taskDate.valueOf()], tl_item_height).move(nx,ny).click(TLSelectNode).attr({id:"tle_"+i.id}).attr('pointer-events','none');
			clap.clipWith(clip);
			if (i==hovnode){
				
			}
		}
	}
	//draw event texts
	TLsvg.rect(tl_item_width*10,tl_item_height).fill("#6affff").click(nullify);
	
	for (var i=1;i<=9;i++){
		
		var k=cday.toDateString();
		k=k.slice(0,k.lastIndexOf(" "));
		var txt = TLsvg.text(k).attr('pointer-events', 'none').move(i*tl_item_width,0).fill("#0").attr('pointer-events','none');
		var clip = TLsvg.clip().add(txt);
		var clap = TLsvg.rect(tl_item_width, tl_item_height).move(i*tl_item_width,0).attr('pointer-events','none');
		clap.clipWith(clip);
		cday.setDate(cday.getDate()+1);
	}
	resetDate();
	TLsvg.rect(tl_item_width,tl_item_height*12).fill("#6affff").click(nullify);
	for (var i=1;i<=9;i++){
		var k=chour.toLocaleTimeString();
		k=k.slice(0,k.lastIndexOf(":"))+k.slice(k.length-3);
		var txt = TLsvg.text(k).attr('pointer-events', 'none').move(0,i*tl_item_height).fill("#0").attr('pointer-events','none');
		var clip = TLsvg.clip().add(txt);
		var clap = TLsvg.rect(tl_item_width, tl_item_height).move(0,i*tl_item_height).attr('pointer-events','none');
		
		clap.clipWith(clip);
		chour.setMinutes(chour.getMinutes()+30);
	}
	resetDate();//to ensure date setting is ok
	var n=11;
	for (var i=1;i<=n;i++){
		TLsvg.line(i*tl_item_width,0,i*tl_item_width,n*tl_item_height).stroke({width:1});
		TLsvg.line(0,i*tl_item_height,n*tl_item_width,i*tl_item_height).stroke({width:1});
	}
	//highlight today
	TLsvg.rect(tl_item_width, 9*tl_item_height).move(_nx,tl_item_height).fill({color:"#0000ff",opacity:0.2}).stroke({color:"#90dd90",width:3}).attr('pointer-events','none');
	if (hovnode){
		chour.setDate(hovnode.taskDate.getDate());
		chour.setMonth(hovnode.taskDate.getMonth());
		var nx=Math.floor((hovnode.taskDate.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width+tl_item_width*(TLputcount[hovnode.taskDate.valueOf()]-1)/TLscalecount[hovnode.taskDate.valueOf()];
		var ny=Math.round((hovnode.taskDate.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height+(hovnode.endDate.valueOf()-hovnode.taskDate.valueOf())/1800000*tl_item_height;
		TLsvg.line(nx,ny,nx+tl_item_width/TLscalecount[hovnode.taskDate.valueOf()],ny).stroke({color:"#cc00cc",width:4}).attr('cursor','ns-resize');
	}
	resetDate();//to ensure date setting is ok
}
var hovnode;
function showdrag(e){
	hovnode=getNode(e.path[0].id.split("_")[1]);
	drawTimeline();
	//TLsvg.line(0,0,200,200).stroke({color:"#cc00cc",width:2});
	//else dragLine.plot(dragx,dragy,dragx+tl_item_width,dragy).stroke({color:"#cc00cc",width:2});
}

function hidedrag(){
	hovnode=undefined;
	drawTimeline();
}

function nullify(e){
	e.stopPropagation();
	$("#floaterTLbox").hide();
}

function drawMonth(){
	TLsvg.clear();
	//draw grid
	//7 across
	var daysOfWeek=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var wkTableCellWidth=$("body").width()/7;
	var wkTableCellHeight=$("body").height()*0.1;
	
	//top labels
	var stepperDay=new Date();
	for (var i=0;i<7;i++){
		//box
		TLsvg.rect(wkTableCellWidth, $("body").height()*0.05).move(i*wkTableCellWidth,0).fill("#6affff");
		//text
		var txt = TLsvg.text(daysOfWeek[i]).attr('pointer-events', 'none').move(i*wkTableCellWidth,0).fill("#0");
	}
	
	//each box day; highlighting alternate months
	for (i=0;i<10;i++){
		//little corner text
		//relevant items
		//other kinds of stuff
	}
	
	//vertical lines
	for (var i=1;i<=9;i++){
		TLsvg.line(i*wkTableCellWidth,0,i*wkTableCellWidth,5*wkTableCellHeight).stroke({width:1});
	}
	//horizontal lines
	for (var i=0;i<4;i++){
		TLsvg.line(0,i*wkTableCellHeight+$("body").height()*0.05,8*wkTableCellWidth,i*wkTableCellHeight+$("body").height()*0.05).stroke({width:1});
	}
	
}



var floaterTime;
function findTime(e){
	floaterTime = new Date();
	floaterTime.setTime(cday.getTime());
	floaterTime.setSeconds(0);
	floaterTime.setMinutes(0);
	floaterTime.setDate(cday.getDate()+(Math.floor(e.offsetX/tl_item_width))-1);
	floaterTime.setHours(chour.getHours()+Math.floor(e.offsetY/tl_item_height)/2);
	floaterTime.setMinutes(((Math.floor(e.offsetY/tl_item_height))%2)*30+30);
	switch(scale){
		case 0:
			if (anchorID!=-1){
				getNode(anchorID).setDate(floaterTime.valueOf());
				anchorID=-1;
				$("#status").html("Ready");
				NTC=false;
				showTimeline();
			}else{
				//pop up a new task box
				//var nx=Math.floor((floaterTime.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width;
				//var ny=Math.round((floaterTime.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height;
				$("#floaterTLbox").css("top",e.clientY);
				$("#floaterTLbox").css("left",e.clientX);
				$("#floaterTB")[0].value="";
				$("#floaterTLbox").show();
				$("#floaterTB").focus();
			}
			break;
		
	}
}
	
function flkp(e){
	if (e.key=="Enter")floaterTLboxDone();	
}

function floaterTLboxDone(){
	if ($("#floaterTB")[0].value.length>0){
		var nn = makeNode($("#floaterTB")[0].value);
		nn.setDate(floaterTime.valueOf());
		$("#floaterTB")[0].value="";
	}
	$("#floaterTLbox").hide();
	showTimeline();
}
	
var NTC=false;
function TLreanchor(e) {
	var TLRID=e.currentTarget.parentElement.parentElement.id.split("_")[1];
	TLunderReanchor(TLRID);
}

function TLunderReanchor(ID){
	$("#status").html("Pick timeslot");
	if (anchorID==ID){
		if (NTC){
			getNode(anchorID).setDate(Date.now()+90*365*24*60*60*1000);
			showTimeline();
			NTC=false;
			anchorID=-1;
			$("#status").html("Ready");
		}else{
			NTC=true;
			$("#status").html("Click again to make task incidental");
		}
		return;
	}
	anchorID = ID;
	NTC=false;
	
}

function TLSelectNode(e){
	$("#floaterTLbox").hide();
	if (anchorID==-1){
		currentNode=getNode(e.path[0].id.split("_")[1]);
	}else{
		getNode(anchorID).setDate(getNode(e.path[0].id.split("_")[1]).taskDate.valueOf());
		anchorID=-1;
		NTC=false;
	}
	showTimeline();
	e.stopPropagation();
}
function addAndSchedule(){
	if ($("#newTaskBox")[0].value){
		var k = makeNode($("#newTaskBox")[0].value);
		currentNode=k;
		showTimeline();
		TLunderReanchor(k.id);
		$("#newTaskBox")[0].value="";
	}else{
		$("#newTaskBox")[0].placeholder="Please enter a task name.";
		setTimeout (()=>{$("#newTaskBox")[0].placeholder="Task";},1500);
	}
}