function dataItem(p, name){//initialiser for dataItem
	//self properties
	this.id=nodes.length;//does the same thing as before since all nodes should be in nodes[];
	this.name = name;
	this.longdesc="";
	//div for the big block displays; just keeping it on hand. Might take up a ton of memory but we'll see
	this.div=$("#item_template")[0].cloneNode(true);//clone the template
	this.div.classList.add("activeBlocks");
	this.div.id="d_"+this.id;	
	this.div.children[0].children[0].innerHTML=this.name;//set heading inside div to my name
	//record the parent element and all the children for the node; just cos
	this.parent = p;//reference to parent
	this.children=[];//define an empty set. this will be filled with references to children.
	if (this.parent){
		this.siblings = this.parent.children; //orphans dont have siblings 
		this.upperindex=function(){// upperindex might change so this is a function
			index = this.parent.children.findIndex(x => x.id==this.id);
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
	
	this.getPath=function(){
		if (!this.parent)return this.name;
		else return this.parent.getPath()+" :: " + this.name;
		
	}
	
}
var nodes=[];//store all nodes in an array so we can quickly access them
function makeNode(parent, name){
	var p = new dataItem(parent,name);
	nodes.push(p);
	return p;
}
function registerEvents(){
	$(".taskNameBody").on("keydown",finishEdit);
	$(".taskNameBody").on("click",startEdit);
}


/*
	jquery 101:
	$("same things you use in css to select elements")
	this returns an array holding all elements which would be selected by the provided string.
	To access an element directly to modify its properties, we would have to get it by its index e.g. $("hierarchy_div")[0].width=100;
	you can also perform some jquery specific functions e.g. add(): 
	$(".some_class").add("click", function) means every time an element with some_class is clicked, function() will run.
*/





//some basic functions
var hier_svg;
var currentNode;
function drawHierarchy(lastNode){
	currentNode=lastNode;
	//change h1 to the path of the node
	$("h1")[0].innerHTML="Heirline - " + lastNode.getPath();
	
	//clear everything
	hier_svg.each(function(i, children) {
		this.remove();
	})
	$(".activeBlocks").remove();//class activeblocks will be given to "real" block divs
	//remove them from the document but don't destroy them
	var recursionDepth=-1;
	
	var currentItem=lastNode;
	var centrex=hier_svg.width()/2;
	var item_height=20;
	var item_width=40;
	//draw direct children for navigation
	for (var x of currentItem.children){
		//draw the box
		var tmp=hier_svg.rect(item_width, item_height);
		tmp.attr({
			x:((x.upperindex() - (currentItem.children.length-1)/2)*(item_width+5)-item_width/2+centrex),
			y:hier_svg.height()+recursionDepth*(item_height+10),
			id:x.id
		}).click(selectNode);
		//if i have children then colour me pink
		if (x.children.length)tmp.attr("fill","#ffcccc");
		//draw the stick
		tmp=hier_svg.line(
			(x.upperindex() - (currentItem.children.length-1)/2)*(item_width+5)+centrex,
			hier_svg.height()+recursionDepth*(item_height+10),
			(x.upperindex() - (currentItem.children.length-1)/2)*(item_width+5)+centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-5
		).stroke({ width: 1 });
		//draw line connecting children
		tmp=hier_svg.line(
			(-(currentItem.children.length-1)/2)*(item_width+5)+centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-5,
			((currentItem.children.length-1)/2)*(item_width+5)+centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-5
		).stroke({ width: 1 });
		//draw upper little connector line
		tmp=hier_svg.line(
			centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-5,
			centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-10
		).stroke({ width: 1 });
		//put their divs onto the blocks chain
		//yay blockschain
		$("#addMore").before(x.div);
		
	}
	recursionDepth--;
	
	//recurisvely:	
	while (currentItem){ // while we haven't gone past the root level node
		//draw currentItem and all its siblings
		if (currentItem.parent){
			for (var x of currentItem.siblings){
				//draw the box
				var tmp=hier_svg.rect(item_width, item_height);
				tmp.attr({
					x:((x.upperindex() - currentItem.upperindex())*(item_width+5)-item_width/2+centrex),
					y:hier_svg.height()+recursionDepth*(item_height+10),
					id:x.id
				}).click(selectNode);
				if (x.id==lastNode.id)tmp.attr('fill','#00ff00');
				else if (x.children.length)tmp.attr("fill","#ffcccc");
				
				//draw the stick
				tmp=hier_svg.line(
				((x.upperindex() - currentItem.upperindex())*(item_width+5)+centrex),
				hier_svg.height()+recursionDepth*(item_height+10),
				((x.upperindex() - currentItem.upperindex())*(item_width+5)+centrex),
				hier_svg.height()+recursionDepth*(item_height+10)-5
				).stroke({ width: 1 });
				
			}
			//draw lines connecting all these siblings
			tmp=hier_svg.line(
			((-currentItem.upperindex())*(item_width+5)+centrex),
			hier_svg.height()+recursionDepth*(item_height+10)-5,
			((currentItem.parent.children.length -1 - currentItem.upperindex())*(item_width+5)+centrex),
			hier_svg.height()+recursionDepth*(item_height+10)-5
			).stroke({ width: 1 });
			
			//move centre position for parent draw
			centrex=(-currentItem.upperindex()+(currentItem.parent.children.length-1)/2)*(item_width+5)+centrex;
			//draw upper little connector line
			tmp=hier_svg.line(
			centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-5,
			centrex,
			hier_svg.height()+recursionDepth*(item_height+10)-10
			).stroke({ width: 1 });
			
			}else{
			var tmp=hier_svg.rect(item_width, item_height);
			tmp.attr({
				x:(centrex-item_width/2),
				y:hier_svg.height()+recursionDepth*(item_height+10),
				id:0//root level node should always have id 0
			}).click(selectNode);
			if (0==lastNode.id)tmp.attr('fill','#00ff00');
			else tmp.attr("fill","#ffcccc");
			
		}
		//do the same thing for the currentItem's target
		recursionDepth--;
		
		currentItem=currentItem.parent;
	}
	registerEvents();//make sure all the div buttons do what they're meant to
}

function selectNode(e){
	drawHierarchy(nodes[e.path[0].id]);
}


function finishEdit(e){
	var node_id=e.currentTarget.parentElement.parentElement.id.split("_")[1];
	nodes[node_id].name=e.currentTarget.innerHTML;
	if (e.key=="Enter"){
		$("body").focus();
		return false;
	}
}

function drawTimeline(){
	
	
	
	
	
}

function loadFile(){
	
	
	
}

function saveFile(){
	window.URL = window.webkitURL || window.URL;

  var prevLink = output.querySelector('a');
  if (prevLink) {
    window.URL.revokeObjectURL(prevLink.href);
    output.innerHTML = '';
  }

  var bb = new Blob([typer.textContent], {type: MIME_TYPE});

  var a = document.createElement('a');
  a.download = container.querySelector('input[type="text"]').value;
  a.href = window.URL.createObjectURL(bb);
  a.textContent = 'Download ready';

  a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
  a.draggable = true; // Don't really need, but good practice.
  a.classList.add('dragout');
  
  output.appendChild(a);

  a.onclick = function(e) {
    if ('disabled' in this.dataset) {
      return false;
    }

    cleanUp(this);
  };
};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}


$(document).ready(initialise);//register initialise() to be run when document loads - safer than just running it when this script is loaded because then we're guarunteed some elements will be loaded.
function initialise(){
	hier_svg = SVG('hierarchy_div').size($("body").width(), $("body").height()*0.2);
	//generate some sample nodes
	var rootnode = makeNode(undefined,"new project");
	rootnode.children.push(makeNode(rootnode,"split a"));
	rootnode.children.push(makeNode(rootnode,"split b"));
	rootnode.children[1].children.push(makeNode(rootnode.children[1],"split b"));
	rootnode.children[1].children.push(makeNode(rootnode.children[1],"split b.2"));
	//draw a node (testing)
	drawHierarchy(rootnode.children[1].children[1]);	
}

function moreBoxes(){
	currentNode.children.push(makeNode(currentNode,"New node"));
	drawHierarchy(currentNode);
	
}

