var sharedList=[];//name 
var fireWatch={};


function sharedTasks(){
	$("#sharedTasks").show().css('display','flex');
	$('#floatingMenu').hide();
	
}

function hideShared(){
	$('#sharedTasks').hide();
}


var config = {
	apiKey: "AIzaSyDKPYbPTX6cVCDrv5vXNFKAjfO_gpPFgt8",
	authDomain: "heirline-3fb1c.firebaseapp.com",
	databaseURL: "https://heirline-3fb1c.firebaseio.com",
	projectId: "heirline-3fb1c",
	storageBucket: "heirline-3fb1c.appspot.com",
	messagingSenderId: "1080694993278"
};
var firebase;
function sharedSetup(){
	if(firebase){
		firebase.initializeApp(config);
		if (!personalID){
			//generate a personal ID
		var p=firebase.database().ref("/heirline").push();
			
		}
		for (var i in sharedList){
			firebase.database().ref("/heirline/"+sharedList[i]).on("value",updateBlock);
		}
	}	
}

function updateBlock(datasnapshot){
	var outval=datasnapshot.val();
	var data=JSON.parse(outval);//array of nodeBits
	mergin(data, datasnapshot.key);	
}
//root level, nodes, properties.

function createSet(){
	var attSN=$("#st_crename")[0].value;
	//verify not already taken
	firebase.database().ref("/heirline/").once('value').then(function(snapshot){
		if (snapshot.hasChild(attSN)){
			$("#sharedStat").html("Name already taken ;-;");
		}else{
			var midobj={};
			midobj[attSN]="[]";
			firebase.database().ref("/heirline").update(midobj);
			p=makeNode(attSN,attSN+"~"+Date.now());
			attachTo(p,rootNode);
			sharedList.push(attSN);
			pushUpdate(attSN);
			firebase.database().ref("/heirline/"+attSN).on('value',updateBlock);
			$("#sharedStat").html("Set Added!");
		}
	});
}

function tryAddSet(){
	var attSN=$("#st_addname")[0].value;
	var p = firebase.database().ref("/heirline/"+attSN);
	if (p){
		fireWatch[attSN]=p;
		p.on("value",updateBlock);
		sharedList.push(attSN);
		$("#sharedStat").html("Set Added!");
		return;
	}else{
		$("#sharedStat").html("Could not find set. Check your spelling?");
	}
}

function pushUpdate(setName){
	var bitList=[];
	for (var i of nodes){
		if (i.id.toString().split("~")[0]==setName){
			bitList.push(i.toNodeBit());
		}
	}
	var midbit={};
	midbit[setName]=JSON.stringify(bitList);
	firebase.database().ref("/heirline/").update(midbit);
}



//list of previous nodes, for deletion.
var prelist={};
//start as false, turn to true. if still false, hunt n delete

function mergin(loadedData,setName){
	if (!loadedData)return;
	for (var i of loadedData){
		var p = getNode(i.id);
		if (prelist[setName]) for (var j of prelist[setName]){
			if (j.id==i.id)j.keep=true;
		}
		fromNodeBit(p,i);
		//STUFFF
		
		
	}
	//kill the onse that no longer exist
	for (var i of prelist[setName]){
		if (!i.keep){
			removeNode(getNode(i.id));
		}
	}
	//second pass for parents
	for (var i of loadedData) {
		var p = getNode(i.id);
		attachTo(p,HRgetNode(i.parent),true);
	}
	//repopulate prelist
	prelist[setName]=[];
	for (var i of loadedData){
		var kek={"id": i.id,"keep":false};
		prelist[setName].push(kek);
	}
}
