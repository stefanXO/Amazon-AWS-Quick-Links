function createWindowWithTabs(tabs){
	var t = [];
	console.log(tabs);
	for (var i = 0; i < tabs.length; i++) {
		t.push(tabs[i].link);
	};
	for (var i = t.length - 1; i >= 0; i--) {
		chrome.tabs.create({url:t[i]});
	};
}


