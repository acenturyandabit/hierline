
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
var item_height = 20;
var item_width = 60;
function drawHierarchy(lastNode) {
	currentNode = lastNode;
	//change h1 to the path of the node
	$("h1")[0].innerHTML = "Heirline - " + lastNode.getPath();

	//clear everything
	hier_svg.each(function (i, children) {
		this.remove();
	})
	$(".activeBlocks").remove(); //class activeblocks will be given to "real" block divs
	//remove them from the document but don't destroy them
	var recursionDepth = -1;
	var tmp;
	var currentItem = lastNode;
	var centrex = hier_svg.width() / 2;
	
	//draw direct children for navigation
	for (var x of currentItem.children) {
		//draw the box
		drawNode(x,((x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) - item_width / 2 + centrex),hier_svg.height() + recursionDepth * (item_height + 10),false);
		//draw the stick
		tmp = hier_svg.line(
				(x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				hier_svg.height() + recursionDepth * (item_height + 10),
				(x.upperindex() - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				hier_svg.height() + recursionDepth * (item_height + 10) - 5).stroke({
				width: 1
			});

		//draw line connecting children
		tmp = hier_svg.line(
				( - (currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				hier_svg.height() + recursionDepth * (item_height + 10) - 5,
				((currentItem.children.length - 1) / 2) * (item_width + 5) + centrex,
				hier_svg.height() + recursionDepth * (item_height + 10) - 5).stroke({
				width: 1
			});

		//draw upper little connector line
		tmp = hier_svg.line(
				centrex,
				hier_svg.height() + recursionDepth * (item_height + 10) - 5,
				centrex,
				hier_svg.height() + recursionDepth * (item_height + 10) - 10).stroke({
				width: 1
			});

		//put their divs onto the blocks chain
		//yay blockschain
		$("#addMore").before(x.div);

	}
	recursionDepth--;

	//recurisvely:
	while (currentItem) { // while we haven't gone past the root level node
		//draw currentItem and all its siblings
		if (currentItem.parent) {
			for (var x of currentItem.siblings) {
				//draw the box
				drawNode(x,((x.upperindex() - currentItem.upperindex()) * (item_width + 5) - item_width / 2 + centrex),hier_svg.height() + recursionDepth * (item_height + 10),x.id==lastNode.id)
				//draw the stick
				tmp = hier_svg.line(
						((x.upperindex() - currentItem.upperindex()) * (item_width + 5) + centrex),
						hier_svg.height() + recursionDepth * (item_height + 10),
						((x.upperindex() - currentItem.upperindex()) * (item_width + 5) + centrex),
						hier_svg.height() + recursionDepth * (item_height + 10) - 5).stroke({
						width: 1
					});

			}
			//draw lines connecting all these siblings
			tmp = hier_svg.line(
					((-currentItem.upperindex()) * (item_width + 5) + centrex),
					hier_svg.height() + recursionDepth * (item_height + 10) - 5,
					((currentItem.parent.children.length - 1 - currentItem.upperindex()) * (item_width + 5) + centrex),
					hier_svg.height() + recursionDepth * (item_height + 10) - 5).stroke({
					width: 1
				});

			//move centre position for parent draw
			centrex = (-currentItem.upperindex() + (currentItem.parent.children.length - 1) / 2) * (item_width + 5) + centrex;
			//draw upper little connector line
			tmp = hier_svg.line(
					centrex,
					hier_svg.height() + recursionDepth * (item_height + 10) - 5,
					centrex,
					hier_svg.height() + recursionDepth * (item_height + 10) - 10).stroke({
					width: 1
				});

		} else {
			drawNode(nodes[0],(centrex - item_width / 2),hier_svg.height() + recursionDepth * (item_height + 10),lastNode==nodes[0]);
		}
		//do the same thing for the currentItem's target
		recursionDepth--;

		currentItem = currentItem.parent;
	}
}

//helper function draw node
function drawNode(node, x, y, state) {
	//draw the box
	var tmp = hier_svg.rect(item_width, item_height);
	tmp.attr({
		'x': x,
		'y': y,
		id: node.id
	}).click(selectNode);
	//if i am selected color me green
	if (state)
		tmp.attr('fill', '#00ff00');
	//if i have children then colour me pink
	else if (node.children.length)
		tmp.attr("fill", "#ffcccc");
	else
		tmp.attr("fill", "#aaffff");
	//draw name of node
	tmp = hier_svg.text(node.name).attr('pointer-events','none').move(x, y);
}

$(document).ready(initialise); //register initialise() to be run when document loads - safer than just running it when this script is loaded because then we're guarunteed some elements will be loaded.
function initialise() {
	hier_svg = SVG('hierarchy_div').size($("body").width(), $("body").height() * 0.15);
	//generate some sample nodes
	$("#loadFile").on("change", loadFile);
	var rootnode = makeNode(undefined, "new project");
	//draw a node (testing)
	setInterval(autoSave, 2000);
	autoLoad();
	currentNode=nodes[0];
	drawHierarchy(currentNode);
}

function moreBoxes() {
	currentNode.children.push(makeNode(currentNode, "New node"));
	drawHierarchy(currentNode);
}
