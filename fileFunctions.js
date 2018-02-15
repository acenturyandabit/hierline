function generateSave(){
	var saveData=[];
	/*
	for all elements
	name, longdesc, children; index is preserved
	*/
	for (var i of nodes){
		var node_bit={
			name: i.name,
			longdesc: i.longdesc,
			date:i.taskDate,
			parent: i.parent ? i.parent.id : undefined, // ternary operator: bascially a mini if statement
			children:[]
		}
		for (var j of i.children)node_bit.children.push(j.id);
		saveData.push(node_bit);
		
	}		
	return JSON.stringify(saveData);
}

const MIME_TYPE = 'application/json';
function saveFile(){
	$("#top_bar span a").remove();
	
	var bb = new Blob([generateSave()], {type: MIME_TYPE});
	
	var a = document.createElement('a');
	a.download = nodes[0].name+".heir";
	a.href = window.URL.createObjectURL(bb);
	a.textContent = '.';
	
	a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
	$("#top_bar span")[0].append(a);
	a.click();
};


function loadFile(e){
	$("#loadFile")[0].parentElement.innerHTML=$("#loadFile")[0].parentElement.innerHTML.replace("Load:","Loading...");
	var reader = new FileReader();
	reader.onload = fileLoaded;
	reader.readAsText(e.currentTarget.files[0], "UTF-8");
}

function fileLoaded(e){
	var output = e.target.result;
	var loadedData=JSON.parse(output);
	$("#loadFile")[0].parentElement.innerHTML=$("#loadFile")[0].parentElement.innerHTML.replace("Loading...","Load:");
	nodes=[];
	for (var i of loadedData){
		var p=makeNode(nodes[i.parent],i.name);
		p.longdesc=i.longdesc;
		if (p.parent)p.parent.children.push(p);
	}
	drawHierarchy(nodes[0]);
}