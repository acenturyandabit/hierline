var count = 0;
var deletedNodes=[];
function dataItem(name,id) { //initialiser for dataItem
	//self properties
	if (!id)
		this.id = Date.now() * 10 + count; //for deleting nodes i need strictly unique node ID's - this should generate unique ID's even between runs
	else
		this.id = id;
	count++;
	this.name = name;
	this.longdesc = "";
	this.creationDate=Date.now();
	//div for the big block displays; just keeping it on hand. Might take up a ton of memory but we'll see
	//cloning, adding events etc
	this.div = $("#item_template")[0].cloneNode(true); //clone the template
	this.div.classList.add("activeBlocks");
	this.div.children[0].children[0].addEventListener("keyup", finishEdit);
	this.div.children[0].children[0].addEventListener("change", drawCurrentScreen);
	this.div.children[2].addEventListener("keyup", longdescedit);
	this.div.children[2].addEventListener("change", drawCurrentScreen);
	this.div.children[1].addEventListener("change", dateEdit);
	this.div.children[0].children[2].addEventListener("click", reanchor);
	this.div.children[0].children[1].addEventListener("click", deleteNode);
	this.div.id = "d_" + this.id;
	this.div.children[0].children[0].value = this.name; //set heading inside div to my name
	//record the parent element and all the children for the node; just cos
	this.parent = undefined; //reference to parent
	this.children = []; //define an empty set. this will be filled with references to children.
	this.upperindex = function () { // upperindex might change so this is a function
		index = this.parent.children.findIndex(x => x.id == this.id);
		return index;
	}
	this.setName = function (name,auto){
		this.name=name;
		this.div.children[0].children[0].value=name;
		if ((!auto) && this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}
	}
	this.setlongdesc = function (ld,auto) {
		this.longdesc = ld;
		this.div.children[2].value = this.longdesc;
		if ((!auto) && this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}
	}
	//timeline
	this.taskDate = undefined;
	this.setDate = function (date) {
		if (!date)
			this.taskDate = undefined;
		else {
			if (!this.taskDate)
			this.taskDate = new Date();
			this.taskDate.setTime(date);
			this.div.children[1].value = this.taskDate.toISOString().split("T")[0];
		}
		if (this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}
	}
	this.getSortableDate=function(){
		//check all parents to see if they have any dates
		//if not then return creation date
		var sd=this.taskDate;
		var cn=this.parent;
		while (!sd && cn){
			sd=cn.taskDate;
			cn=cn.parent;
		}
		if (!sd)sd=roundTo(new Date(),1);
		return sd;
	}
	//some functions which i'm sure will be useful
	this.contains = function (item) { //does this node contain the node specified?
		if (this == item)
			return 2; //return 2 if I am the node
		else {
			for (var c of this.children) {
				//https://stackoverflow.com/questions/29285897/what-is-the-difference-between-for-in-and-for-of-in-javascript
				if (c.contains(item))
					return 1; //if any of my children are/contain the element return 1.
			}
		}
		return 0;
	}
	this.hierarchy_level = function(){
		if (this.parent)return 1+this.parent.hierarchy_level();
		else return 1;
	}
	this.getPath = function () {
		if (!this.parent)
			return this.name;
		else
			return this.parent.getPath() + " :: " + this.name;

	}
	this.tags=[];
	this.toNodeBit =function(){
		var underDate;
		var underCD;
		if (this.creationDate)underCD=this.creationDate.valueOf();
		if (this.taskDate)underDate=this.taskDate.valueOf();
		var node_bit = {
			id: this.id,
			name: this.name,
			longdesc: this.longdesc,
			date: underDate,
			cd: underCD,
			parent: this.parent ? this.parent.id : undefined // ternary operator: bascially a mini if statement
		}
		return node_bit;
	}
	this.recRemPref=function(){
		this.id=this.id.split("~")[1];
		for (var i in this.children)i.recRemPref();
	}
	this.recAddPref=function(pref){
		this.id=pref+"~"+this.id;
		for (var i in this.children)i.recAddPref(pref);
	}
}
var nodes = []; //store all nodes in an array so we can quickly access them
$(document).ready(()=>{var hier_zero=new dataItem("Tasks",0);});


function moreBoxes() {
	if ($("#newTaskBox")[0].value){
		var newNode = makeNode($("#newTaskBox")[0].value);
		drawCurrentScreen();
		$("#newTaskBox")[0].value="";
	}else{
		$("#newTaskBox")[0].placeholder="Please enter a Task name!";
		setTimeout (()=>{$("#newTaskBox")[0].placeholder="Task";},1500);
	}
}

function makeNode(name, id) {
	var p = new dataItem(name, id);
	nodes.push(p);
	return p;
}

function getNode(id) {
	for (var i of nodes) {
		if (i.id == id)
			return i;
	} //if none found then return nothing
	return undefined;
}

function taskDone(){
	deletedNodes.push(currentNode);
	nodes.splice(nodes.indexOf(currentNode),1);
	drawCurrentScreen();
}

function deleteNode(e) {
	var div_to_delete = e.currentTarget.parentElement.parentElement;
	var deleteID = div_to_delete.id.split("_")[1];
	var gnd = getNode(deleteID);
	removeNode(gnd);
}

function removeNode(node){
	if (node.parent){
		if (node==currentNode && currentScreen==1)currentNode=node.parent;
		node.parent.children.splice(node.parent.children.indexOf(node), 1);
	}
	var rcn=false;
	var rhcn=false;
	if (node==currentNode)rcn=true;
	if (node==HRcurrentNode)rhcn=true;
	nodes.splice(nodes.indexOf(node),1);
	if (rcn)currentNode=nodes[0];
	if (rhcn)HRcurrentNode=nodes[0];
	deletedNodes.push(node);
	drawCurrentScreen();

}

function finishEdit(e) {
	var node_id = e.currentTarget.parentElement.parentElement.id.split("_")[1];
	getNode(node_id).setName(e.currentTarget.value);
}

function longdescedit(e) {
	var node_id = e.currentTarget.parentElement.id.split("_")[1];
	getNode(node_id).setlongdesc(e.currentTarget.value);
}
function dateEdit(e) {
	var node_id = e.currentTarget.parentElement.id.split("_")[1];
	var t = new Date(e.currentTarget.value);
	getNode(node_id).setDate(t.valueOf());
	drawCurrentScreen();
}
