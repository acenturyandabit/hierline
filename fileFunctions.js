var saveList;
function generateSave(node) {
	/*
	add myself then add my children
	 */
	 var underDate;
	 var underCD;
	 if (node.creationDate)underCD=node.creationDate.valueOf();
	 if (node.taskDate)underDate=node.taskDate.valueOf();
	 
	var node_bit = {
		id: node.id,
		name: node.name,
		longdesc: node.longdesc,
		date: underDate,
		cd: underCD,
		parent: node.parent ? node.parent.id : undefined // ternary operator: bascially a mini if statement
	}
	saveList.push(node_bit);	
}

const MIME_TYPE = 'application/json';
function saveFile() {
	saveList=[];
	$("#top_bar span a").remove();
	for (var i of nodes)generateSave(i);
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
	if (nodes.length){
		saveList=[];
		localStorage.removeItem("data");
		var under_storage = window.localStorage;
		for (var i of nodes)generateSave(i);
		under_storage.setItem('data_'+Date.now(), JSON.stringify(saveList));
		var damt=0;
		for (var i in under_storage)if (i.includes("data_"))damt++;
		for (var i in under_storage)if (damt>5){under_storage.removeItem(i);damt--;}
	}
}

function autoLoad() {
	var under_storage = window.localStorage;
	for (var i in under_storage){
		if (i.includes("data")){
			var loadedData = under_storage.getItem(i);
			try{
				loadFromString(loadedData);
			}catch (err){
				continue;
			}
			break;
		}
	}
	setInterval(autoSave, 2000);
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
	if(!loadedData)throw "Data was empty!";
	//verify save data to ensure there are no duplicates
	var veri_array=[];
	for (var i of loadedData){
		if (veri_array.indexOf(i.id)!=-1){
			$("#status").html("Error loading data-Load cancelled.");
			throw "duplicateID";
			return;
		}
		veri_array.push(i.id);
	}	
	if (loadedData) {
		nodes = [];
		for (var i of loadedData) {
			var p = makeNode(i.name, i.id);
			p.setlongdesc(i.longdesc);
			if (i.date) p.setDate(i.date);
			if (i.cd) p.creationDate=new Date().setTime(i.cd);
		}
		
		//second pass for parents
		for (var i of loadedData) {
			var p = getNode(i.id);
			if (i.parent){
				p.parent=HRgetNode(i.parent);
				p.parent.children.push(p);
				p.siblings = p.parent.children;
			}
		}
		//drawHierarchy(nodes[0]);
	}
}
