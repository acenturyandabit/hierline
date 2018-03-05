function showHierarchy(){
	if (!currentNode)currentNode=nodes[0];
	$("#doModeScreen").hide();
	$("#currentTaskBox").show().css('display', 'flex');
	$("#hierarchy_div").fadeIn();
	$("#timeline").hide();
	$("#slbt").html("To Organise");
	$("#properAdd").html("Add Child");
	$("#properAdd").off("click");
	$("#properAdd").on("click",addAndAttach);
	$("#scrollContainer").css("width","75%");
	if (!HRcurrentNode)HRcurrentNode=rootNode;
	drawHierarchy(HRcurrentNode);
	currentScreen=1;
	orgboxHR();
}

var rootNode;
var HRcurrentNode;
$(document).ready(HRinit);
function HRinit(){
	hier_svg = SVG('hierarchy_div').size($("body").width(), $("body").height() * 0.5);
}

function orgboxHR(){
	$("#blocks>div").remove(); //class activeblocks will be given to "real" block divs
	$("#currentTaskBox>div").remove();
	$("#currentTaskBox")[0].appendChild(HRcurrentNode.div);
	var count=0;
	for (var i of nodes){
		if(!i.parent && i!=currentNode){
			$("#blocks")[0].appendChild(i.div);
			count++;
		}
		if (count>50)break;
	}
	$(".reanchor").html("&#9875;");
	$(".reanchor").off("click");
	$(".reanchor").on("click",reanchor);
}

var hier_svg;
var currentNode;

function drawHierarchy(lastNode) {
	currentNode = lastNode;
	//drawTimeline();
	//change h1 to the path of the node
	//$("h1")[0].innerHTML = "Heirline - " + lastNode.getPath();

	//clear everything
	hier_svg.clear();
	//remove them from the document but don't destroy them
	var recursionDepth = -1;
	var tmp;
	var currentItem = lastNode;
	var centrex = hier_svg.width() / 2;
	var cy=hier_svg.height()/2;
	//draw direct children for navigation
	for (var x of currentItem.children) {
		//draw the box
		drawNode(x, ((x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) - item_width / 2 + centrex), cy + recursionDepth * (item_height + 10), false);
		//draw the stick
		tmp = hier_svg.line(
				(x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				cy + recursionDepth * (item_height + 10),
				(x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				cy + recursionDepth * (item_height + 10) - 5).stroke({
				width: 1
			});

		//draw line connecting children
		tmp = hier_svg.line(
				( - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				cy + recursionDepth * (item_height + 10) - 5,
				((currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				cy + recursionDepth * (item_height + 10) - 5).stroke({
				width: 1
			});

		//draw upper little connector line
		tmp = hier_svg.line(
				centrex,
				cy + recursionDepth * (item_height + 10) - 5,
				centrex,
				cy + recursionDepth * (item_height + 10) - 10).stroke({
				width: 1
			});

		//put their divs onto the blocks chain
		//yay blockschain
		$("#blocks")[0].appendChild(x.div);

	}
	recursionDepth--;

	//recurisvely:
	while (currentItem) { // while we haven't gone past the root level node
		//draw currentItem and all its siblings
		if (currentItem.parent) {
			for (var x of currentItem.siblings) {
				//draw the box
				drawNode(x, ((x.upperindex() - currentItem.upperindex()) * (item_width + 5) - item_width / 2 + centrex), cy + recursionDepth * (item_height + 10), x.id == lastNode.id)
				//draw the stick
				tmp = hier_svg.line(
						((x.upperindex() - currentItem.upperindex()) * (item_width + 5) + centrex),
						cy + recursionDepth * (item_height + 10),
						((x.upperindex() - currentItem.upperindex()) * (item_width + 5) + centrex),
						cy + recursionDepth * (item_height + 10) - 5).stroke({
						width: 1
					});

			}
			//draw lines connecting all these siblings
			tmp = hier_svg.line(
					((-currentItem.upperindex()) * (item_width + 5) + centrex),
					cy + recursionDepth * (item_height + 10) - 5,
					((currentItem.parent.children.length - 1 - currentItem.upperindex()) * (item_width + 5) + centrex),
					cy + recursionDepth * (item_height + 10) - 5).stroke({
					width: 1
				});

			//move centre position for parent draw
			centrex = (-currentItem.upperindex() + (currentItem.parent.children.length - 1) / 2) * (item_width + 5) + centrex;
			//draw upper little connector line
			tmp = hier_svg.line(
					centrex,
					cy + recursionDepth * (item_height + 10) - 5,
					centrex,
					cy + recursionDepth * (item_height + 10) - 10).stroke({
					width: 1
				});

		} else {
			drawNode(rootNode, (centrex - item_width / 2), cy + recursionDepth * (item_height + 10), lastNode == rootNode);
		}
		//do the same thing for the currentItem's target
		recursionDepth--;

		currentItem = currentItem.parent;
	}

	//insert current div into the sidebar
	
}

//helper function draw node
function drawNode(node, x, y, state) {
	//draw the box
	var rect = hier_svg.rect(item_width, item_height).fill("#ffffff").click(selectNode).attr({
			'x': x,
			'y': y,
			id: "br_" + node.id
		}); ;

	//if i am selected color me green
	if (state)
		rect.fill('#00ff00');
	//if i have children then colour me pink
	else if (node.id.toString().includes("~")){
		if (node.children.length)rect.fill("darkviolet");
		else rect.fill("violet");
	}else if (node.children.length)
		rect.fill("#00F6FF");
	//draw name of node
	var txt = hier_svg.text(node.name).attr('pointer-events', 'none').move(x, y);
	var clip = hier_svg.clip().add(txt);

	var clap = hier_svg.rect(item_width, item_height).move(x, y).click(selectNode).attr({
			'x': x,
			'y': y,
			id: "tx_" + node.id
		});
	clap.clipWith(clip);
}



function HRgetNode(id){
	if (id=="rootNode")return rootNode;
	else return getNode(id);
}

function selectNode(e) {
	var nid = e.path[0].id.split("_")[1];
	var nnode=HRgetNode(nid);
	if (anchorID != -1) {
		
		
		var sNode = HRgetNode(anchorID);
		attachTo(sNode,nnode);
		$("#status").html("Ready");
		anchorID = -1;
	}
	currentNode = nnode;
	HRcurrentNode = nnode;
	showHierarchy();
}




var anchorID = -1;
function reanchor(e) {
	$("#status").html("Select new anchor node");
	anchorID = e.currentTarget.parentElement.parentElement.id.split("_")[1];
}

function addAndAttach(){
	if ($("#newTaskBox")[0].value){
		var k = makeNode($("#newTaskBox")[0].value);
		attachTo(k,HRcurrentNode);
		$("#newTaskBox")[0].value="";
	}else{
		$("#status").html("Please enter new task name.");
	}
}

function attachTo(child,parent,auto){
	if (child.contains(parent)) {
		$("#status").html("Cannot anchor node on its children!");
		anchorID = -1;
		return;
	}
	if (child.parent){
		child.parent.children.splice(child.parent.children.indexOf(child), 1);
		if (child.parent.id.toString().includes("~")){//my parent had a prefix
			var setName=child.parent.id.toString().split("~")[0];
			child.recRemPref();
			child.id=child.id.split("~")[1]//remove said prefix including from all children	
			if (!auto)stUpdate(setName);
		}
	}
	if (parent){
		child.parent = parent;
		parent.children.push(child);
		child.siblings = child.parent.children;
		if (parent.id.toString().split("~").length>1){
			child.recAddPref(parent.id.split("~")[0]);
			stUpdate(parent.id.split("~")[0]);
		}
	}	
	showHierarchy();
}


function splitsub(){
	if (!currentNode.parent){
		$("#status").html("Select new anchor node");
		anchorID = currentNode.id;
		showHierarchy();
	}else{
		HRcurrentNode=currentNode;
		showHierarchy();
	}
	
}