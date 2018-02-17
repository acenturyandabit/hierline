var saveList;
function generateSave(node) {
	/*
	add myself then add my children
	 */
	var node_bit = {
		id: node.id,
		name: node.name,
		longdesc: node.longdesc,
		date: node.taskDate,
		parent: node.parent ? node.parent.id : undefined // ternary operator: bascially a mini if statement
	}
	saveList.push(node_bit);
	for (var j of node.children)generateSave(j);
}

const MIME_TYPE = 'application/json';
function saveFile() {
	saveList=[];
	$("#top_bar span a").remove();
	generateSave(nodes[0]);
	var bb = new Blob([JSON.stringify(saveList)], {
			type: MIME_TYPE
		});

	var a = document.createElement('a');
	a.download = nodes[0].name + ".heir";
	a.href = window.URL.createObjectURL(bb);
	a.textContent = '.';

	a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
	$("#top_bar")[0].append(a);
	a.click();
};

var changesMade;
function autoSave() {
	saveList=[];
	localStorage.removeItem("data");
	var under_storage = window.localStorage;
	generateSave(nodes[0]);
	under_storage.setItem('data', JSON.stringify(saveList));
}

function autoLoad() {
	var under_storage = window.localStorage;
	var loadedData = under_storage.getItem('data');
	loadFromString(loadedData);
}

function loadFile(e) {
	var reader = new FileReader();
	reader.onload = fileLoaded;
	reader.readAsText(e.currentTarget.files[0], "UTF-8");
}

function fileLoaded(e) {
	var output = e.target.result;
	loadFromString(e.target.result);
}

function loadFromString(loadscript){
	nodes=[];
	loadedData = JSON.parse(loadscript);
	//verify save data to ensure there are no duplicates
	var veri_array=[];
	for (var i of loadedData){
		if (veri_array.indexOf(i.id)!=-1){
			$("#status").html("Error loading data-Load cancelled.");
		}
		veri_array.push(i.id);
	}	
	if (loadedData) {
		nodes = [];
		for (var i of loadedData) {
			var p = makeNode(getNode(i.parent), i.name, i.id);
			p.longdesc = i.longdesc;
			if (p.parent)p.parent.children.push(p);
		}
		drawHierarchy(nodes[0]);
	}
}

