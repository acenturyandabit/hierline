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
			parent:i.parent,
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
	a.textContent = 'Save to File...';
	
	a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
	$("#top_bar span")[0].append(a);
};


function loadFile(e){
	e.currentTarget.file=0;
	$("#loadFile")[0].value=;
	
	for (var i of loadedData){
		var p=makeNode(i.parent,i.name);
		p.longdesc=i.longdesc;
	}
	
}

