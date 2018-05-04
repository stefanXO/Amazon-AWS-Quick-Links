var AWSServiceGroup = React.createFactory(React.createClass({
	getInitialState:function(){
		return {};
	},
	render:function(){
		var hideWindow = true;
		var tabsperrow = (this.props.layout.indexOf("blocks")>-1)?Math.ceil(Math.sqrt(this.props.tabs.length+2)):(this.props.layout=="vertical"?1:15);
		var tabs = this.props.tabs.map(tab => {
			var isHidden = !!this.props.hiddenTabs[tab.id] && this.props.filterTabs;
			var isSelected = !!this.props.selection[tab.id];
			if(this.props.searchActive && this.props.filterTabs.length > 1 && this.props.window.id == 0) isHidden = true;
			hideWindow &= isHidden;
			return AWSService({
				window:this.props.window,
				layout:this.props.layout,
				tab:tab,
				selected:isSelected,
				hidden:isHidden,
				hoverHandler:this.props.hoverHandler,
				searchActive:this.props.searchActive,
				select:this.props.select,
				ref:"tab"+tab.id
			});
		});
		if(!hideWindow) {
			if(!!this.props.tabactions) {
				tabs.push(
					React.DOM.div(
						{className:"window-actions"}
					)
				);
			}
			var children = [];
			children.push(React.DOM.h4({}, this.props.window.name));
			for(var j = 0; j < tabs.length; j++){
				if(j % tabsperrow == 0 && j && (j < tabs.length-1 || (this.props.layout.indexOf("blocks")>-1))){
					children.push(React.DOM.div({className:"newliner"}));
				}
				children.push(tabs[j]);
			}
			return React.DOM.div({
						className:"window "+(this.props.layout.indexOf("blocks")>-1?"block":"")+" "+this.props.layout+" "+(this.props.window.focused?" focused":""),
					}, React.DOM.div({className:"windowcontainer"},children));
		} else {
			return null;
		}
	}
}));
