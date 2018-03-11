$(document).ready(checkphone);
function checkphone(){
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
		if (window.location.href.indexOf("phone")==-1)window.location="/phono/index.html"
	}
}