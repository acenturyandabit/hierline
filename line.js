var TLsvg;
var TLcenter = new Date();
var scale = 1;
/*
0: hours
1: days
2: weeks
3: months
4: years
 */
var subscale = 1.5;
var TLC=0;//crai
var scalingFactor=[0.00002,0.000001,0.0000002,0.00000002,0.000000002];
function roundTo(datea) {
	var altDate = new Date();
	altDate.setTime(0);
	switch (scale) {
	case 0:
		altDate.setHours(datea.getHours());
	case 1:
	case 2:
		altDate.setDate(datea.getDate());
	case 3:
		altDate.setMonth(datea.getMonth());
	case 4:
		altDate.setYear(datea.getFullYear());
	}
	if (scale == 2)
		altDate.setDate(datea.getDate() - datea.getDay());
		return altDate;
}

function scaledDdate(date,increment){
	switch (scale) {
	case 0:
		date.setHours(date.getHours()+increment);
		break;
	case 1:
		date.setDate(date.getDate()+increment);
		break;
	case 2:
		date.setDate(date.getDate()+increment*7);
		break;
	case 3:
		date.setMonth(date.getMonth()+increment);
		break;
	case 4:
		date.setYear(date.getFullYear()+increment);
		break;
	}
	return date;
}
var TLscalecount;
function drawTimeline() {
	TLsvg.clear();
	//draw center line
	TLsvg.line(0, $("body").height() * 0.13, $("body").width(), $("body").height() * 0.13).stroke({
		width: 1
	});
	//draw below line datetimes
	//draw now time
	drawDateMarker(TLcenter);
	
	var rtd = roundTo(TLcenter);
	var tmr=new Date();
	scaledDdate(tmr,1);
	var singleWidth=(tmr.valueOf() - Date.now()) * subscale*scalingFactor[scale];
	var amt_on_screen=$("body").width()/singleWidth;
	scaledDdate(rtd,Math.round(-TLC/singleWidth-amt_on_screen));
	for (var i=0;i<amt_on_screen+10;i++){
		scaledDdate(rtd,1);
		drawDateMarker(rtd);
	}
	//draw above line events
	//query the current hierarchy element to find out its children's dates
	TLscalecount={};
	drawChildrenOnTL(nodes[0]);
}

function drawChildrenOnTL(node){
	//draw the box
	if (node.taskDate){
		var rdate=roundTo(node.taskDate);
		if (TLscalecount[rdate.valueOf()])TLscalecount[rdate.valueOf()]++;
		else TLscalecount[rdate.valueOf()]=1;
		var y = $("body").height() * 0.13-TLscalecount[rdate.valueOf()]*item_height;
		var x = $("body").width() / 2 + (rdate.valueOf() - TLcenter.valueOf()) * subscale*scalingFactor[scale]+TLC;
		var rect = TLsvg.rect(item_width, item_height).fill("#aaffff").click(selectNode).center(x,y).attr({
				id: "tlbr_" + node.id
			}); ;

		//if i am selected color me green
		if (node==currentNode)
			rect.fill('#00ff00');
		//if i have children then colour me pink
		else if (node.children.length)
			rect.fill("#ffcccc");
		//draw name of node
		var txt = TLsvg.text(node.name).attr('pointer-events', 'none').center(x, y).move(x-item_width/2, y-item_height/2);
		var clip = TLsvg.clip().add(txt);

		var clap = TLsvg.rect(item_width, item_height).center(x, y).click(selectNode).attr({
				id: "tx_" + node.id
			});
		clap.clipWith(clip);
	}
	for (var i of node.children){
		drawChildrenOnTL(i);
	}
}


function drawDateMarker(date) {
	var xpos = $("body").width() / 2 + (date.valueOf() - TLcenter.valueOf()) * subscale*scalingFactor[scale]+TLC;
	var col = "black";
	var ttp;
	var under_len=10;
	if (scale == 0) {
		ttp = date.toLocaleString();
	} else {
	ttp = date.toDateString();
	}
	if (date==TLcenter){
		col="lightgreen";
		ttp="Now:" + ttp;
		under_len=25;
	}
	TLsvg.line(xpos, $("body").height() * 0.13 + under_len, xpos, $("body").height() * 0.13).stroke({
		color: col,
		width: 1
	});
	TLsvg.text(ttp).center(xpos, $("body").height() * 0.13 + under_len).fill(col);
	if (date!=TLcenter)TLsvg.rect(60,20).center(xpos,$("body").height() * 0.13 -10).fill("lightgray").click(addTime).attr({id: "dt_" + date.valueOf()});
}

function addTime(e){
	if (anchorID!=-1){
		getNode(anchorID).setDate(e.path[0].id.split("_")[1]);
		drawTimeline();
		anchorID=-1;
		$("#status").html("Ready");
	}
	
}

