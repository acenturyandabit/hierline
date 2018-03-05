var sharedList=[];//name key hesh

function sharedTasks(){
	$("#sharedTasks").show().css('display','flex');
	$('#floatingMenu').hide();
	
}

function hideShared(){
	$('#sharedTasks').hide();
}

$(document).ready(()=>{setInterval(upSync,30000)});

var isUpdating=false;
//make them sync all at the same time?
function upSync(){
	//do not upsync if update is ready
	if (!isUpdating){
		isUpdating=true;
		for (var i of sharedList){
			$.ajax("https://hierline.herokuapp.com/sync?groupName="+i.name+"&key="+i.key+"&hesh="+i.hesh,{cache:false,method:'GET',success:syncOK});
		}
	}
}


function syncOK(_data){
	isUpdating=false;
	if (_data=="NO_CHANGE"){
		setTimeout(upSync,10000);
		return;
		
	}else if (_data == "undefined"){
		$("#status").html ("Sync error.");
	}else{
		var data=JSON.parse(_data);
		data.name=data.name.trim();
		if (data.data){
			for (var i of sharedList){
				if (i.name==data.name)i.hesh=data.hesh;
			}
			mergin(JSON.parse(data.data),data.name);
		}else{
			$("#status").html ("Sync error.");
		}
	}
	setTimeout(upSync,1000);
}



function stUpdate(setName){
	isUpdating=true;
	//compile relevant nodes
	var sendData=[];
	for (var i of nodes){
		if (i.id.toString().split("~")[0]==setName){
			sendData.push(i.toNodeBit());
		}
	}
	for (var i of sharedList){
		if (i.name==setName){
			$.ajax("https://hierline.herokuapp.com/update?groupName="+i.name+"&key="+i.key,{cache:false,success: updateOK,method:'POST',data:JSON.stringify(sendData)});
		}
	}
}
function updateOK(){
	isUpdating=false;
}
function createSet(){
	$.ajax("https://hierline.herokuapp.com/create?groupName="+$("#st_crename")[0].value,{cache:false,method:'POST',success:createSetOK});
	
}
function createSetOK(data){
	if (data=="ERR_NAME_IN_USE"){
		$("#sharedStat").html("Name in use ;-;");
	}else{
		var k=JSON.parse(data);
		sharedList.push(k);
		$("#sharedStat").html("Set created. Password:" + k.key);
		var p=makeNode(k.name,k.name+"~"+Date.now());
		p.parent=HRgetNode("rootNode");
		p.parent.children.push(p);
		p.siblings = p.parent.children;
		stUpdate(k.name);
	}
}

function tryAddSet(){
	$.ajax("https://hierline.herokuapp.com/sync?groupName="+$("#st_addname")[0].value+"&key="+$("#st_addkey")[0].value+"&hesh=0",{cache:false,method:'get',success:addSetOK});
}

function addSetOK(data){
	if (data=="INVALID_KEYPAIR"){
		$("#sharedStat").html("Could not find set. Check your spelling?");
	}else{
		data=JSON.parse(data);
		var k = {
			"name":data.name.trim(),"key": data.key.trim(), "hesh":data.hesh
		}
		sharedList.push(k);
		$("#sharedStat").html("Set Added!");
		mergin(JSON.parse(data.data),data.name.trim());
	}
}

function mergin(_loadedData,setName){
	//delete all the previous ones mwahahah
	for (var i of nodes){
		if (i.id.toString().split("~")[0]==setName){
			removeNode(i);
		}
	}
	//an array of nodes
	//for each node,find corresponding ID
	if (_loadedData) {
		for (var _i in _loadedData) {
			loadedData=JSON.parse("["+_i+"]");
		}
		for (var i of loadedData) {
			var p = getNode(i.id);
			if (!p)p = makeNode(i.name,i.id);
			p.setName(i.name,true);
			p.setlongdesc(i.longdesc,true);
			if (i.date) p.setDate(i.date);
			if (i.cd) p.creationDate=new Date().setTime(i.cd);
		}
		//second pass for parents
		for (var i of loadedData) {
			var p = getNode(i.id);
			attachTo(p,HRgetNode(i.parent),true);
		}
	}
}
