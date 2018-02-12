var itemCount;
function dataItem(p){//initialiser for dataItem
	//self properties
	this.id=itemCount;//this property should be unique! I'm just going to assign it to a counter which increments every time we make a new element
	itemCount++;
	this.name = "";
	this.longdesc="";
	//div for the big block displays; just keeping it on hand. Might take up a ton of memory but we'll see
	this.div=$("something")[0].cloneNode(true);//not yet defined
	//record the parent element and all the children for the node; just cos
	this.parent = p;//reference to parent
	this.children=[];//define an empty set. this will be filled with references to children.
	if (this.parent)this.siblings = this.parent.children; //orphans dont have siblings 
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
	this.taskDate=new Date();
	
	//some functions which i'm sure will be useful
	this.contains=function(item){//does this node contain the node specified?
		if (this==item) return 2; //return 2 if I am the node
		else{
			for (var c of this.children){
				//https://stackoverflow.com/questions/29285897/what-is-the-difference-between-for-in-and-for-of-in-javascript
				if (c.contains(item)) return 1; //if any of my children are/contain the element return 1.
			}
		}
		return 0;
	}
}





//some basic functions
var rootnode = new dataItem(undefined);
function drawHierarchy(lastNode){
	//draw root node
	//identify which child contains the lastNode
	//draw that child and its children 
	//if lastnode is a direct ancestor, draw it in expanded form
	///////uhm nevermind better idea
	//draw lastnode and all its siblings
	
	//draw lastnode's parent and all its siblings
	//recurse until root node
	
}

function drawTimeline(){
	
	
	
	
	
}