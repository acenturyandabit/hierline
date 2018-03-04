var sharedList=[];//name key hesh

function sharedTasks(){
	$("#sharedTasks").show().css('display','flex');
	$('#floatingMenu').hide();
	
}

function hideShared(){
	$('#sharedTasks').hide();
}

$(document).ready(()=>{setInterval(upSync,2000)});

var isUpdating=false;
//make them sync all at the same time?
function upSync(){
	//do not upsync if update is ready
	if (!isUpdating){
		for (var i of sharedList){
			$.ajax("https://hierline.herokuapp.com/sync?groupName="+i.name+"&key="+i.key+"&hesh="+i.hesh,{cache:false,method:'GET',success:syncOK});
		}
	}
}


function syncOK(data){
	if (data=="NO_CHANGE"){
		return;
	}else{
		data=JSON.parse(data);
		var k = {
			"name":data.name,"key": data.key, "hesh":data.hesh
		}
		sharedList.push(k);
		$("#sharedStat").html("Set Added!");
		mergin(JSON.parse(data.data));
	}
}

function stUpdate(setName){
	isUpdating=true;
	//compile relevant nodes
	var sendData=[];
	for (var i of nodes){
		if (i.id.split("~")[0]==setName){
			sendData.push(i.toNodeBit);
		}
	}
	for (var i of sharedList){
		if (i.name==setNsame){
			$.ajax("https://hierline.herokuapp.com/update?groupName="+i.name+"&key="+i.key,{cache:false,success: updateOK,method:'POST',data:sendData});
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
		$("#sharedStat").html("Set added. Password:" + k.key);
		var p=makeNode(k.name,k.name+"~"+Date.now());
		p.parent=HRgetNode("rootNode");
		p.parent.children.push(p);
		p.siblings = p.parent.children;
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
			"name":data.name,"key": data.key, "hesh":data.hesh
		}
		sharedList.push(k);
		$("#sharedStat").html("Set Added!");
		mergin(JSON.parse(data.data));
	}
}

function mergin(loadedData){
	//an array of nodes
	//for each node,find corresponding ID
	if (loadedData) {
		for (var i of loadedData) {
			var p = getNode(i.id);
			if (!p)p = makeNode(i.name,i.id);
			p.setName(i.name);
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
	}
}
