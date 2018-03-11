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
	this.taskDate = undefined;
	this.endDate=undefined;
	this.parent = undefined; //reference to parent
	
	//cloning, adding events etc
	this.div = $("#item_template")[0].cloneNode(true); //clone the template
	this.div.classList.add("activeBlocks");
	//name box
	this.div.children[0].children[0].addEventListener("keyup", finishEdit);
	this.div.children[0].children[0].addEventListener("change", showCurrentScreen);
	//description box
	this.div.children[2].addEventListener("keyup", longdescedit);
	this.div.children[2].addEventListener("change", showCurrentScreen);
	//tag box
	this.div.children[1].addEventListener("keyup", tagParse);
	//this.div.children[0].children[2].addEventListener("click", reanchor);
	this.div.children[0].children[1].addEventListener("click", deleteNode);
	this.div.id = "d_" + this.id;
	this.div.children[0].children[0].value = this.name; //set heading inside div to my name
	//record the parent element and all the children for the node; just cos
	
	this.children = []; //define an empty set. this will be filled with references to children.
	this.UIverify=function(){
		this.name=this.div.children[0].children[0].value;
		this.longdesc=this.div.children[2].value;
	}
	this.upperindex = function () { // upperindex might change so this is a function
		index = this.parent.children.findIndex(x => x.id == this.id);
		return index;
	}
	
	this.setName = function (name,auto){
		changesMade=true;
		this.name=name;
		this.div.children[0].children[0].value=name;
	}
	this.setlongdesc = function (ld,auto) {
		changesMade=true;
		this.longdesc = ld;
		this.div.children[2].value = this.longdesc;
		if ((!auto) && this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}
	}
	//timeline
	
	this.setDate = function (date,auto) {
		if (!date){
			this.taskDate = undefined;
			this.endDate=undefined;
		}
		else {
			var interval;
			if (this.taskDate){
				interval=this.endDate.valueOf()-this.taskDate.valueOf();
			}else{
				interval=30*60*1000;
			}
			this.taskDate = new Date(date);
			this.endDate=new Date();
			this.endDate.setTime(this.taskDate.valueOf()+interval);
			if(!auto)this.updateTag();
		}
		changesMade=true;
		/*if (this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}*/
	}
	this.setInterval = function (intv) {
		if  (this.taskDate){
			this.endDate=new Date(this.taskDate.valueOf()+intv*1800000);
			this.updateTag();
			changesMade=true;
		}
		/*if (this.id.toString().split("~").length>1){
			stUpdate(this.id.split("~")[0]);
		}*/
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
	this.genTag=function(){
		var tagstring="";
		for (var i of this.tags){
			tagstring+="#"+i+";";
		}
		if (this.taskDate)tagstring+="d:"+this.taskDate.toLocaleString()+";i:"+((this.endDate.valueOf()-this.taskDate.valueOf())/1800000)+";";
		if (this.parent)tagstring+="p:("+this.parent.id+"):"+this.parent.name+";";
		return tagstring;
	}
	this.burn=false;
	this.updateTag=function(){
		this.burn=true;
		this.div.children[1].value=this.genTag();
	}
	this.tagParse=function(){
		if (this.burn){
			this.burn=false;
			return false;
		}
		//verify stuff first
		var input = this.div.children[1].value;
		this.div.children[1].style.backgroundColor="white";
		var bits=input.split(";");
		this.tags=[];
		var returner=false;
		for (var i=0;i<bits.length;i++){
			/*
			#sometag
			d:sometag
			p:(ID):flavourtext
			*/
			switch(bits[i][0]){
				case "#":
					this.tags.push(bits[i].slice(1));
					break;
				case "d":
					var testTime=new Date(bits[i].slice(2));
					if (testTime.getTime()) {
						if(this.taskDate){
							if(testTime.valueOf()!=this.taskDate.valueOf()){
								this.setDate(bits[i].slice(2),true); 
								returner=true;
							}
						}else{
							this.setDate(bits[i].slice(2),true); 
							returner=true;
						}
					}else this.div.children[1].style.backgroundColor="orange";
					break;
				case "p":
					if(this.parent.id!=bits[i].split(/\(|\)/)[1])attachTo(this,HRgetNode(bits[i].split(/\(|\)/)[1]));
					break;
				case "i":
					if (!this.taskDate || isNaN(bits[i].slice(2)) || bits[i].slice(2)==""){
						this.div.children[1].style.backgroundColor="orange";
					}else{
						if ((this.endDate.valueOf()-this.taskDate.valueOf())/1800000!=bits[i].slice(2)){
							this.setInterval(bits[i].slice(2));
							returner=true;
						}
					}
					break;
			}
		}
		return returner;
	}
	this.toNodeBit =function(){
		var underDate;
		var underCD;
		var underIntv;
		if (this.creationDate)underCD=this.creationDate.valueOf();
		if (this.taskDate){
			underDate=this.taskDate.valueOf();
			underIntv=(this.endDate.valueOf()-this.taskDate.valueOf())/1800000;
		}
		var node_bit = {
			id: this.id,
			name: this.name,
			longdesc: this.longdesc,
			date: underDate,
			cd: underCD,
			parent: this.parent ? this.parent.id : undefined, // ternary operator: bascially a mini if statement
			intv:underIntv
		}
		return node_bit;
	}
	this.linkedHesh=0;
	this.ref=undefined;
	this.refstring="";
	this.linkedupdate=function(){
		if (this.refstring){
			var p = "/heirline/"+this.refstring+"/"+this.id.toString();
			var data={
				"hesh":this.linkedHesh,
				"name":this.name,
				"longdesc": this.longdesc,
				"parent":this.parent.id
			}
			firebase.database(p).ref().update(data);
		}
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
		showCurrentScreen();
		$("#newTaskBox")[0].value="";
	}else{
		$("#newTaskBox")[0].placeholder="Please enter a task name.";
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
	showCurrentScreen();
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
	resetStatus();
	showCurrentScreen();
}

function verifyAll(){
	for (var i of nodes){
		i.UIverify();
	}
}

function finishEdit(e) {
	var node_id = e.currentTarget.parentElement.parentElement.id.split("_")[1];
	getNode(node_id).setName(e.currentTarget.value);
}

function longdescedit(e) {
	var node_id = e.currentTarget.parentElement.id.split("_")[1];
	getNode(node_id).setlongdesc(e.currentTarget.value);
}
function tagParse(e) {
	var node_id = e.currentTarget.parentElement.id.split("_")[1];
	getNode(node_id).tagParse(e.currentTarget.value);
	//if (getNode(node_id).tagParse(e.currentTarget.value))
	drawCurrentScreen();
}
