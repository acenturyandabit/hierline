var count=0;
function dataItem(p, name,id) { //initialiser for dataItem
	//self properties
	if (!id)this.id = Date.now()*10+count; //for deleting nodes i need strictly unique node ID's - this should generate unique ID's even between runs
	else this.id=id;
	count++;
	this.name = name;
	this.longdesc = "";
	//div for the big block displays; just keeping it on hand. Might take up a ton of memory but we'll see
	
	
	//cloning, adding events etc
	this.div = $("#item_template")[0].cloneNode(true); //clone the template
	this.div.classList.add("activeBlocks");
	this.div.children[0].children[0].addEventListener("change",finishEdit);
	this.div.children[0].children[2].addEventListener("click",reanchor);
	this.div.children[0].children[1].addEventListener("click",deleteNode);
	this.div.id = "d_" + this.id;
	this.div.children[0].children[0].value = this.name; //set heading inside div to my name
	//record the parent element and all the children for the node; just cos
	this.parent = p; //reference to parent
	this.children = []; //define an empty set. this will be filled with references to children.
	if (this.parent) {
		this.siblings = this.parent.children; //orphans dont have siblings
		this.upperindex = function () { // upperindex might change so this is a function
			index = this.parent.children.findIndex(x => x.id == this.id);
			return index;
		}
	}
	/*
	javascript is kinda funny because there are some strange distinctions between an object and a reference. For example, if i do:
	var i=5;
	var j=i;
	i=6;
	j will be equal to 5 still, as per usual
	but if i do:
	var i={}; // declare i as an object
	i.property=5;
	var j=i;
	i.property=6;
	then j.property will be equal to 6; because j is a reference to i instead of a separate object.
	As a general rule, if i is anything other than a direct value e.g. 1,2,3, "a","b","caterpillar", j is probably going to be a reference.
	 */
	//timeline
	this.taskDate = new Date();

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

	this.getPath = function () {
		if (!this.parent)
			return this.name;
		else
			return this.parent.getPath() + " :: " + this.name;

	}

}
var nodes = []; //store all nodes in an array so we can quickly access them
function makeNode(parent, name,id) {
	var p = new dataItem(parent, name,id);
	nodes.push(p);
	return p;
}

function getNode(id){
	for (var i of nodes){
		if (i.id==id)return i;
	}//if none found then return nothing
	return undefined;
}

function selectNode(e) {
	if (anchorID!=-1){
		var sNode=getNode(anchorID);
		if (sNode.contains(getNode(e.path[0].id))){
			$("#status").html("Cannot anchor node on its children!");
			anchorID=-1;
			return;
		}
		
		sNode.parent.children.splice(getNode(anchorID).parent.children.indexOf(getNode(anchorID)),1);
		sNode.parent=getNode(e.path[0].id);
		sNode.siblings=getNode(e.path[0].id).children;
		getNode(e.path[0].id).children.push(sNode);
		this.siblings = this.parent.children;
		anchorID=-1;
		$("#status").html("Select new anchor node");
	}
	drawHierarchy(getNode(e.path[0].id));
	currentNode=getNode(e.path[0].id);
}

function finishEdit(e) {
	var node_id = e.currentTarget.parentElement.parentElement.id.split("_")[1];
	getNode(node_id).name = e.currentTarget.value;
	drawHierarchy(currentNode);
}

var anchorID=-1;
function reanchor(e) {
	$("#status").html("Select new anchor node");
	anchorID=e.currentTarget.parentElement.parentElement.id.split("_")[1];
}
function deleteNode(e) {
	var deleteID=e.currentTarget.parentElement.parentElement.id.split("_")[1];
	getNode(deleteID).parent.children.splice(getNode(deleteID).parent.children.indexOf(getNode(deleteID)),1);
	drawHierarchy(currentNode);
}
function drawTimeline() {}
