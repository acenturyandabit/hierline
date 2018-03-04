function showTimeline(){
	if (!currentNode)currentNode=nodes[0];
	$("#doModeScreen").hide();
	$("#currentTaskBox").show().css('display', 'flex');
	$("#hierarchy_div").hide();
	$("#timeline").fadeIn();
	$("#slbt").html("To Organise");
	$("#scrollContainer").css("width","75%");
	$("#properAdd").html("Add event");
	currentScreen=2;
	drawTimeline();
	orgBoxTL();
}
var tl_item_width;
var tl_item_height;
$(document).ready(tlInit);
var sbdmax=20;
function tlInit(){
	TLsvg=SVG('timeline').size($("body").width(), $("body").height() * 0.5);
	
	$('#timeline').bind('mousewheel', function (e) {
		var delta = e.originalEvent.deltaY;
		sbD+=(delta>0)*2-1;
		var p = new Date();
		if (p.getHours()+sbD<0)sbD=-p.getHours();
		if (p.getHours()+sbD>sbdmax)sbD=sbdmax-p.getHours();
		drawTimeline();
	});
	scale=0;
	tl_item_width=$("body").width()*0.1;
	tl_item_height=$("body").height()*0.05;
	TLsvg.click(findTime);
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
	TLsvg.clear();
	switch(scale){
		case 0:
			//header row: days: 8
			resetDate();
			var TLscalecount={};
			var TLputcount={};
			//draw tasks
			for (var i of nodes){
				if (i.taskDate){
					if (TLscalecount[i.taskDate.valueOf()])TLscalecount[i.taskDate.valueOf()]++;
					else TLscalecount[i.taskDate.valueOf()]=1;
				}
			}
			for (var i of nodes){
				if (i.taskDate){
					if (TLputcount[i.taskDate.valueOf()])TLputcount[i.taskDate.valueOf()]++;
					else TLputcount[i.taskDate.valueOf()]=1;
					chour.setDate(i.taskDate.getDate());
					chour.setMonth(i.taskDate.getMonth());
					var nx=Math.floor((i.taskDate.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width+tl_item_width*(TLputcount[i.taskDate.valueOf()]-1)/TLscalecount[i.taskDate.valueOf()];
					var ny=Math.round((i.taskDate.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height;
					TLsvg.rect(tl_item_width/TLscalecount[i.taskDate.valueOf()],tl_item_height).move(nx,ny).fill((i==currentNode)?"#00ff00":"#ffffff").click(TLSelectNode).attr({id:"tler_"+i.id});
				}
			}
			chour.setDate(new Date().getDate());
			//little now arrow
			var nx=Math.floor((Date.now()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width;
			var ny=(Date.now()-chour.valueOf())/(30*60*1000)*tl_item_height-tl_item_height;
			TLsvg.line(nx,ny,nx+tl_item_width,ny).stroke({width:3,color:"#ff00ff"});	
			//draw events
			var TLputcount={};
			for (var i of nodes){
				if (i.taskDate){
					chour.setDate(i.taskDate.getDate());
					chour.setMonth(i.taskDate.getMonth());
					if (TLputcount[i.taskDate.valueOf()])TLputcount[i.taskDate.valueOf()]++;
					else TLputcount[i.taskDate.valueOf()]=1;
					var nx=Math.floor((i.taskDate.valueOf()-cday.valueOf())/(24*60*60*1000))*tl_item_width+tl_item_width+tl_item_width*(TLputcount[i.taskDate.valueOf()]-1)/TLscalecount[i.taskDate.valueOf()];
					var ny=Math.round((i.taskDate.valueOf()-chour.valueOf())/(30*60*1000))*tl_item_height-tl_item_height;
					var txt=TLsvg.text(i.name).move(nx,ny);
					var clip = TLsvg.clip().add(txt);
					var clap = TLsvg.rect(tl_item_width/TLscalecount[i.taskDate.valueOf()], tl_item_height).move(nx,ny).click(TLSelectNode).attr({id:"tle_"+i.id});
					clap.clipWith(clip);
				}
			}
			//draw event texts
			for (var i=1;i<=9;i++){
				var sider=TLsvg.rect(tl_item_width,tl_item_height).move(i*tl_item_width,0).fill("#00F6FF");
				var k=cday.toDateString();
				k=k.slice(0,k.lastIndexOf(" "));
				var txt = TLsvg.text(k).attr('pointer-events', 'none').move(i*tl_item_width,0).fill("#0");
				var clip = TLsvg.clip().add(txt);
				var clap = TLsvg.rect(tl_item_width, tl_item_height).move(i*tl_item_width,0);
				clap.clipWith(clip);
				cday.setDate(cday.getDate()+1);
			}
			resetDate();
			for (var i=1;i<=9;i++){
				var sider=TLsvg.rect(tl_item_width,tl_item_height).move(0,i*tl_item_height).fill("#00F6FF");
				var k=chour.toLocaleTimeString();
				k=k.slice(0,k.lastIndexOf(":"))+k.slice(k.length-3);
				var txt = TLsvg.text(k).attr('pointer-events', 'none').move(0,i*tl_item_height).fill("#0");
				var clip = TLsvg.clip().add(txt);
				var clap = TLsvg.rect(tl_item_width, tl_item_height).move(0,i*tl_item_height);
				
				clap.clipWith(clip);
				chour.setMinutes(chour.getMinutes()+30);
			}
			resetDate();//to ensure date setting is ok
			var n=11;
			for (var i=1;i<=n;i++){
				TLsvg.line(i*tl_item_width,0,i*tl_item_width,n*tl_item_height).stroke({width:1});
				TLsvg.line(0,i*tl_item_height,n*tl_item_width,i*tl_item_height).stroke({width:1});
			}
			break;
		case 1:
		
	}
}

var floaterTime;
function findTime(e){
	floaterTime = new Date();
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
	$("#status").html("Pick timeslot");
	if (anchorID==e.currentTarget.parentElement.parentElement.id.split("_")[1]){
		if (NTC){
			getNode(anchorID).setDate(Date.now()+90*365*24*60*60*1000);
			showTimeline();
		}else{
			NTC=true;
			$("#status").html("Click again to make task incidental");
		}
		return;
	}
	anchorID = e.currentTarget.parentElement.parentElement.id.split("_")[1];
	NTC=false;
}

function TLSelectNode(e){
	if (anchorID==-1){
		currentNode=getNode(e.path[0].id.split("_")[1]);
	}else{
		getNode(anchorID).setDate(getNode(e.path[0].id.split("_")[1]).taskDate.valueOf());
		anchorID=-1;
	}
	showTimeline();
	e.stopPropagation();
}