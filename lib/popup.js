window.loaded = false;
window.onload = function() {
	window.requestAnimationFrame(loadApp);
}
setTimeout(loadApp, 75);
setTimeout(loadApp, 125);
setTimeout(loadApp, 250);
setTimeout(loadApp, 375);
function loadApp() {
	var root = document.getElementById("root");
	if(root != null) {
		var bodyHeight = window.getComputedStyle(root).getPropertyValue('height').split("px")[0];
		if(bodyHeight < 300) {
			document.body.style.minHeight = "351px";
		}
	}

	if(!!window.loaded) return;
	//document.body.style.paddingBottom = "0";
	window.loaded = true;
	ReactDOM.render(AWSQuickLinks({}), document.body);
}

window.addEventListener("contextmenu", function(e) { e.preventDefault(); })