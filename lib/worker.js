function awsQuicklinks() {
	var nums = document.getElementById("nav-history");
	if(nums === null) return;

	var awsc = document.getElementById("awsc-services-container");
	if(awsc === null) return;

	var icons = document.getElementById('nav-shortcut-columns');
	if(icons === null) return;

	var qListItem = nums.getElementsByTagName("a");
	if(qListItem.length == 0) return;
	var listItem = awsc.getElementsByTagName("li");
	if(listItem.length == 0) return;
	var iconItem = icons.getElementsByTagName("li");
	if(iconItem.length == 0) return;

	var allIcons = [];
	for (var i=0; i < iconItem.length; i++) {
		var liItem = iconItem[i];
		var icon = liItem.getElementsByClassName("service-icon")[0];
		allIcons[awsQuickSlugify(liItem.dataset.serviceHref)] = icon.style.backgroundPosition;
		var label = awsQuickSlugify(liItem.getElementsByClassName("service-label")[0].innerText);
		allIcons[label] = icon.style.backgroundPosition;
	}

	console.log(allIcons);

	var allServices = [];
	var section = "Recently Used";
	var sections = [];
	sections.push(section);
	allServices[section] = [];

	for (var i=0; i < qListItem.length; i++) {
		var link = qListItem[i];
		var obj = {}
		obj.link = link.href;
		obj.name = link.innerText;
		if(!!allIcons[awsQuickSlugify(link.href)]) obj.icon = allIcons[awsQuickSlugify(link.href)];
		if(!!allIcons[awsQuickSlugify(link.innerText)]) obj.icon = allIcons[awsQuickSlugify(link.innerText)];
		if(!obj.icon) obj.icon = "-0px -24px";
		allServices[section].push( obj );
	}

	for (var i=0; i < listItem.length; i++) {
		var liItem = listItem[i];
		if(awsQuickElementHasClass(liItem, "awsc-header")) {
			section = liItem.innerText;
			allServices[section] = [];
			sections.push(section);
			continue;
		}
		var link = liItem.getElementsByTagName("a")[0];
		var obj = {}
		obj.link = link.href;
		obj.name = link.innerText;
		if(!!allIcons[awsQuickSlugify(link.href)]) obj.icon = allIcons[awsQuickSlugify(link.href)];
		if(!!allIcons[awsQuickSlugify(link.innerText)]) obj.icon = allIcons[awsQuickSlugify(link.innerText)];
		if(!obj.icon) obj.icon = "-0px -24px";
		allServices[section].push( obj );
		console.log()
	}


	for (var i = sections.length - 1; i >= 0; i--) {
		var obj = {};
		obj['aws-quicklinks-services-'+i] = {
			name: sections[i],
			items: allServices[sections[i]],
			awsquick: true,
			id: i
		}
		chrome.storage.sync.set(obj, function() {
			// console.log('Settings saved');
		});
	};
}

awsQuicklinks();

function awsQuickElementHasClass(element, className) {
	return ( (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(" "+className+" ") > -1 ) ;
}

function awsQuickSlugify(text)
{
	return text.toString().toLowerCase()
	.replace(/\s+/g, '-')           // Replace spaces with -
	.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
	.replace(/\-\-+/g, '-')         // Replace multiple - with single -
	.replace(/^-+/, '')             // Trim - from start of text
	.replace(/-+$/, '');            // Trim - from end of text
}