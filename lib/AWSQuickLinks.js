var AWSQuickLinks = React.createFactory(React.createClass({
	getInitialState:function(){
		this.update();

		return {
			layout:"vertical",
			animations:true,
			compact:false,
			windows:[],
			selection:{},
			hiddenTabs:{},
			tabsbyid:{},
			windowsbyid:{},
			height:400,
			hasScrollBar:false,
			focusUpdates:0,
			topText: "",
			bottomText: "",
			optionsActive:false,
			filterTabs:true
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return true;
	},
	hoverHandler(tab) {
		this.setState({ topText : tab.name });
		this.setState({ bottomText : tab.link });
	},
	hoverIcon(e) {
		var text = e.target.title || " ";
		var bottom = " ";
		if(text.indexOf("\n") > -1) {
			var a = text.split("\n");
			text = a[0];
			bottom = a[1];
		}
		this.setState({ topText : text });
		this.setState({ bottomText : bottom });
	},
	render:function(){
		var hiddenCount = this.state.hiddenCount || 0;
		var tabCount = this.state.tabCount || 0;
		return React.DOM.div({id:"root",className:(this.state.compact?"compact":"") + " " + (this.state.animations?"animations":"no-animations"),onKeyDown:this.checkKey,ref:"root",tabIndex:0},
			React.DOM.div({className:"window-container " + this.state.layout + " " + (this.state.optionsActive?"hidden":""),ref:"windowcontainer",tabIndex:2},
				this.state.windows.map(window => {
					return AWSServiceGroup({
						window,
						tabs:window.items,
						layout:this.state.layout,
						selection:this.state.selection,
						searchActive:(this.state.searchLen > 0),
						hiddenTabs:this.state.hiddenTabs,
						filterTabs:this.state.filterTabs,
						hoverHandler:this.hoverHandler,
						hoverIcon:this.hoverIcon,
						select:this.select.bind(this),
						ref:"window"+window.id
					});
				})
			),
			React.DOM.div({className:"window top",ref:"tophover"},
				React.DOM.input({type:"text",disabled:true,className:"tabtitle",ref:"topbox",placeholder:tabCount + " Amazon services in " + this.state.windows.length + " sections", value:this.state.topText }),
				React.DOM.input({type:"text",disabled:true,className:"taburl",ref:"topboxurl",placeholder:this.getTip(), value:this.state.bottomText}),
			),
			React.DOM.div({className:"window searchbox " + (this.state.optionsActive?"hidden":"")},
				React.DOM.input({type:"text",placeholder:"Start typing to search Amazon Services...",tabIndex:"1",onChange:this.search,ref:"searchbox"}),
			),
			React.DOM.div({className:"window placeholder"})
		)
	},
	componentDidMount:function(){
		this.refs.root.focus();
		this.focusRoot();
	},
	focusRoot:function(){
		this.state.focusUpdates++;
		setTimeout(function() { 
			if(document.activeElement == document.body) {
				this.refs.root.focus();
				this.forceUpdate();
				if(this.state.focusUpdates < 5) this.focusRoot();
			}
		}.bind(this), 500);
	},
	update:function(){
		if(!!this.state) return;
		var windows = [];

		chrome.storage.sync.get(function(storage) {
			console.log(storage);
			for (var key in storage) {
				if (storage.hasOwnProperty(key)) {
					if(!!storage[key].items && !!storage[key].awsquick) {
						windows.push(storage[key]);
					}
				}
			}
			//windows = [];

			if(windows.length == 0) {
				storage = this.defaultWindows();
				for (var key in storage) {
					if (storage.hasOwnProperty(key)) {
						if(!!storage[key].items && !!storage[key].awsquick) {
							windows.push(storage[key]);
						}
					}
				}
			}

			this.state.windows = windows;
			this.state.windowsbyid = {};
			this.state.tabsbyid = {};
			var tabCount = 0;
			for(var i = 0; i < windows.length; i++){
				var window = windows[i];
				//console.log(window);
				this.state.windowsbyid[window.id] = window;
				for(var j = 0; j < window.items.length; j++){
					var tab = window.items[j];
					tab.id = tab.name;
					this.state.tabsbyid[tab.id] = tab;
					tabCount++;
				}
			}
			for(var id in this.state.selection){
				if(!this.state.tabsbyid[id]) delete this.state.selection[id];
			}
			this.state.tabCount = tabCount;
			//this.state.searchLen = 0;
			this.forceUpdate();
		}.bind(this));
	},
	addWindow:function(){
		var count = Object.keys(this.state.selection).length;
		var tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]);

		if(count == 0) {
			
		}else{
			chrome.runtime.getBackgroundPage(function callback(tabs, backgroundPage) {
				backgroundPage.createWindowWithTabs(tabs);
			}.bind(null, tabs));
		}
	},
	pinTabs:function(){
		var tabs = Object.keys(this.state.selection).map(id => this.state.tabsbyid[id]).sort((a,b) => a.index-b.index);
		if(tabs.length ){
			if(tabs[0].pinned) tabs.reverse();
			for(var i = 0; i < tabs.length; i++){
				chrome.tabs.update(tabs[i].id,{pinned:!tabs[0].pinned});
			}

		}else{
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					chrome.tabs.update(t.id,{pinned:!t.pinned});
				});
			});
		}
	},
	search:function(e){
		var hiddenCount = this.state.hiddenCount || 0;
		var searchLen = (e.target.value || "").length;
		if(!searchLen){
			this.state.selection = {};
			this.state.hiddenTabs = {};
			hiddenCount = 0;
		}else{
			var idList;
			var lastSearchLen = this.state.searchLen;
			if(!lastSearchLen){
				idList = this.state.tabsbyid;
			}else if(lastSearchLen > searchLen){
				idList = this.state.hiddenTabs;
			}else if(lastSearchLen < searchLen){
				idList = this.state.selection;
			}else{
				return;
			}
			for(var id in idList){
				var tab = this.state.tabsbyid[id];
				var link = tab.link.split("amazon.com/")[1];
				if((tab.name+link).toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0){
					hiddenCount -= (this.state.hiddenTabs[id] || 0);
					this.state.selection[id] = true;
					delete this.state.hiddenTabs[id];
				}else{
					hiddenCount += 1 - (this.state.hiddenTabs[id] || 0);
					this.state.hiddenTabs[id] = true;
					delete this.state.selection[id];
				}
			}
		}
		this.state.hiddenCount = hiddenCount;
		this.state.searchLen = searchLen;
		var matches = Object.keys(this.state.selection).length;
		var matchtext = "";
		if(matches == 0 && searchLen > 0) {
			this.setState({
				topText : "No matches for '" + e.target.value + "'",
				bottomText : ""
			});
		} else if(matches == 0) {
			this.setState({
				topText : "",
				bottomText : ""
			});
		} else if(matches > 1) {
			this.setState({
				topText : Object.keys(this.state.selection).length + " matches for '" + e.target.value + "'",
				bottomText : "Press enter to open them"
			});
		}else if(matches == 1){
			this.setState({
				topText : Object.keys(this.state.selection).length + " match for '" + e.target.value + "'",
				bottomText : "Press enter to open it"
			});
		}
		this.forceUpdate();
	},
	checkKey:function(e){
		if(e.keyCode == 13) this.addWindow();
		// any typed keys
		if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 186 && e.keyCode <= 192) || (e.keyCode >= 219 && e.keyCode <= 22) || e.keyCode == 8 || e.keyCode == 46 || e.keyCode == 32) {
			if(document.activeElement != this.refs.searchbox) this.refs.searchbox.focus();
		}
		// arrow keys
		if(e.keyCode >= 37 && e.keyCode <= 40) {
			if(document.activeElement != this.refs.windowcontainer && document.activeElement != this.refs.searchbox) {
				this.refs.windowcontainer.focus();
			}
		}
		// page up / page down
		if(e.keyCode == 33 || e.keyCode == 34) {
			if(document.activeElement != this.refs.windowcontainer) {
				this.refs.windowcontainer.focus();
			}
		}
		this.forceUpdate();
	},
	nextlayout:function(){
		if(this.state.layout == "blocks"){
			return "blocks-big";
		}else if(this.state.layout == "blocks-big"){
			return "horizontal";
		}else if(this.state.layout == "horizontal"){
			return "vertical";
		}else{
			return "blocks";
		}
	},
	readablelayout:function(layout){
		if(layout == "blocks"){
			return "Block";
		}else if(layout == "blocks-big"){
			return "Big Block";
		}else if(layout == "horizontal"){
			return "Horizontal";
		}else{
			return "Vertical";
		}
	},
	select:function(id){
		if(this.state.selection[id]){
			delete this.state.selection[id];
		}else{
			this.state.selection[id] = true;
		}
		var selected = Object.keys(this.state.selection).length;
		if(selected == 0) {
			this.setState({
				topText : "No services selected",
				bottomText : " "
			});
		}else if(selected == 1){
			this.setState({
				topText : "Found " + selected + " service",
				bottomText : "Press enter to open it"
			});
		}else{
			this.setState({
				topText : "Found " + selected + " services",
				bottomText : "Press enter to open them in a new window"
			});
		}
		
		this.forceUpdate();
	},
	getTip:function(){
		var tips = [
			"AWS Quicklinks updates recent items when you visit the AWS Console",
			"AWS Quicklinks loves saving time",
			"Type the service you need and press enter",
			"The default shortcut to open this popup is Ctrl+Shift+A / Cmd+Shift+A"
		];
		return "" + tips[Math.floor(Math.random()*tips.length)];
	},
	defaultWindows:function(){
		return {
		  "aws-quicklinks-services-1": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/ec2/v2/home",
		        "name": "EC2",
		        "id": "EC2"
		      },
		      {
		        "link": "https://lightsail.aws.amazon.com/ls/webapp/home",
		        "name": "Lightsail",
		        "id": "Lightsail"
		      },
		      {
		        "link": "https://console.aws.amazon.com/ecs/home",
		        "name": "Elastic Container Service",
		        "id": "Elastic Container Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/lambda/home",
		        "name": "Lambda",
		        "id": "Lambda"
		      },
		      {
		        "link": "https://console.aws.amazon.com/batch/home",
		        "name": "Batch",
		        "id": "Batch"
		      },
		      {
		        "link": "https://console.aws.amazon.com/elasticbeanstalk/home",
		        "name": "Elastic Beanstalk",
		        "id": "Elastic Beanstalk"
		      }
		    ],
		    "name": "Compute",
		    "id": 1
		  },
		  "aws-quicklinks-services-10": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/athena/home",
		        "name": "Athena",
		        "id": "Athena"
		      },
		      {
		        "link": "https://console.aws.amazon.com/elasticmapreduce/home",
		        "name": "EMR",
		        "id": "EMR"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloudsearch/home",
		        "name": "CloudSearch",
		        "id": "CloudSearch"
		      },
		      {
		        "link": "https://console.aws.amazon.com/es/home",
		        "name": "Elasticsearch Service",
		        "id": "Elasticsearch Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/kinesis/home",
		        "name": "Kinesis",
		        "id": "Kinesis"
		      },
		      {
		        "link": "https://quicksight.aws.amazon.com/",
		        "name": "QuickSight",
		        "id": "QuickSight"
		      },
		      {
		        "link": "https://console.aws.amazon.com/datapipeline/home",
		        "name": "Data Pipeline",
		        "id": "Data Pipeline"
		      },
		      {
		        "link": "https://console.aws.amazon.com/glue/home",
		        "name": "AWS Glue",
		        "id": "AWS Glue"
		      }
		    ],
		    "name": "Analytics",
		    "id": 2
		  },
		  "aws-quicklinks-services-11": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/iam/home",
		        "name": "IAM",
		        "id": "IAM"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cognito/home",
		        "name": "Cognito",
		        "id": "Cognito"
		      },
		      {
		        "link": "https://console.aws.amazon.com/secretsmanager/home",
		        "name": "Secrets Manager",
		        "id": "Secrets Manager"
		      },
		      {
		        "link": "https://console.aws.amazon.com/guardduty/home",
		        "name": "GuardDuty",
		        "id": "GuardDuty"
		      },
		      {
		        "link": "https://console.aws.amazon.com/inspector/home",
		        "name": "Inspector",
		        "id": "Inspector"
		      },
		      {
		        "link": "https://us-east-1.redirection.macie.aws.amazon.com/",
		        "name": "Amazon Macie",
		        "id": "Amazon Macie"
		      },
		      {
		        "link": "https://console.aws.amazon.com/singlesignon/home",
		        "name": "AWS Single Sign-On",
		        "id": "AWS Single Sign-On"
		      },
		      {
		        "link": "https://console.aws.amazon.com/acm/home",
		        "name": "Certificate Manager",
		        "id": "Certificate Manager"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloudhsm/home",
		        "name": "CloudHSM",
		        "id": "CloudHSM"
		      },
		      {
		        "link": "https://console.aws.amazon.com/directoryservice/home",
		        "name": "Directory Service",
		        "id": "Directory Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/waf/home",
		        "name": "WAF & Shield",
		        "id": "WAF & Shield"
		      },
		      {
		        "link": "https://console.aws.amazon.com/artifact/home",
		        "name": "Artifact",
		        "id": "Artifact"
		      }
		    ],
		    "name": "Security, Identity & Compliance",
		    "id": 3
		  },
		  "aws-quicklinks-services-12": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/mobilehub/home",
		        "name": "Mobile Hub",
		        "id": "Mobile Hub"
		      },
		      {
		        "link": "https://console.aws.amazon.com/appsync/home",
		        "name": "AWS AppSync",
		        "id": "AWS AppSync"
		      },
		      {
		        "link": "https://console.aws.amazon.com/devicefarm/home",
		        "name": "Device Farm",
		        "id": "Device Farm"
		      },
		      {
		        "link": "https://console.aws.amazon.com/mobileanalytics/home",
		        "name": "Mobile Analytics",
		        "id": "Mobile Analytics"
		      }
		    ],
		    "name": "Mobile Services",
		    "id": 4
		  },
		  "aws-quicklinks-services-13": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://us-west-2.sumerian.amazonaws.com/",
		        "name": "Amazon Sumerian",
		        "id": "Amazon Sumerian"
		      }
		    ],
		    "name": "AR & VR",
		    "id": 5
		  },
		  "aws-quicklinks-services-14": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/states/home",
		        "name": "Step Functions",
		        "id": "Step Functions"
		      },
		      {
		        "link": "https://console.aws.amazon.com/amazon-mq/home",
		        "name": "Amazon MQ",
		        "id": "Amazon MQ"
		      },
		      {
		        "link": "https://console.aws.amazon.com/sns/home",
		        "name": "Simple Notification Service",
		        "id": "Simple Notification Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/sqs/home",
		        "name": "Simple Queue Service",
		        "id": "Simple Queue Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/swf/home",
		        "name": "SWF",
		        "id": "SWF"
		      }
		    ],
		    "name": "Application Integration",
		    "id": 6
		  },
		  "aws-quicklinks-services-15": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/connect/home",
		        "name": "Amazon Connect",
		        "id": "Amazon Connect"
		      },
		      {
		        "link": "https://console.aws.amazon.com/pinpoint/home",
		        "name": "Pinpoint",
		        "id": "Pinpoint"
		      },
		      {
		        "link": "https://console.aws.amazon.com/ses/home",
		        "name": "Simple Email Service",
		        "id": "Simple Email Service"
		      }
		    ],
		    "name": "Customer Engagement",
		    "id": 7
		  },
		  "aws-quicklinks-services-16": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/a4b/home",
		        "name": "Alexa for Business",
		        "id": "Alexa for Business"
		      },
		      {
		        "link": "https://chime.aws.amazon.com/",
		        "name": "Amazon Chime",
		        "id": "Amazon Chime"
		      },
		      {
		        "link": "https://console.aws.amazon.com/zocalo/home",
		        "name": "WorkDocs",
		        "id": "WorkDocs"
		      },
		      {
		        "link": "https://console.aws.amazon.com/workmail/home",
		        "name": "WorkMail",
		        "id": "WorkMail"
		      }
		    ],
		    "name": "Business Productivity",
		    "id": 8
		  },
		  "aws-quicklinks-services-17": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/workspaces/home",
		        "name": "WorkSpaces",
		        "id": "WorkSpaces"
		      },
		      {
		        "link": "https://console.aws.amazon.com/appstream2/home",
		        "name": "AppStream 2.0",
		        "id": "AppStream 2.0"
		      }
		    ],
		    "name": "Desktop & App Streaming",
		    "id": 9
		  },
		  "aws-quicklinks-services-18": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/iot/home",
		        "name": "IoT Core",
		        "id": "IoT Core"
		      },
		      {
		        "link": "https://console.aws.amazon.com/iotdm/home",
		        "name": "IoT Device Management",
		        "id": "IoT Device Management"
		      },
		      {
		        "link": "https://console.aws.amazon.com/iotanalytics/home",
		        "name": "IoT Analytics",
		        "id": "IoT Analytics"
		      },
		      {
		        "link": "https://console.aws.amazon.com/greengrass/home",
		        "name": "Greengrass",
		        "id": "Greengrass"
		      },
		      {
		        "link": "https://console.aws.amazon.com/freertos/home",
		        "name": "Amazon FreeRTOS",
		        "id": "Amazon FreeRTOS"
		      }
		    ],
		    "name": "Internet of Things",
		    "id": 10
		  },
		  "aws-quicklinks-services-19": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/gamelift/home",
		        "name": "Amazon GameLift",
		        "id": "Amazon GameLift"
		      }
		    ],
		    "name": "Game Development",
		    "id": 11
		  },
		  "aws-quicklinks-services-2": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://s3.console.aws.amazon.com/s3/home",
		        "name": "S3",
		        "id": "S3"
		      },
		      {
		        "link": "https://console.aws.amazon.com/efs/home",
		        "name": "EFS",
		        "id": "EFS"
		      },
		      {
		        "link": "https://console.aws.amazon.com/glacier/home",
		        "name": "Glacier",
		        "id": "Glacier"
		      },
		      {
		        "link": "https://console.aws.amazon.com/storagegateway/home",
		        "name": "Storage Gateway",
		        "id": "Storage Gateway"
		      }
		    ],
		    "name": "Storage",
		    "id": 12
		  },
		  "aws-quicklinks-services-3": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/rds/home",
		        "name": "RDS",
		        "id": "RDS"
		      },
		      {
		        "link": "https://console.aws.amazon.com/dynamodb/home",
		        "name": "DynamoDB",
		        "id": "DynamoDB"
		      },
		      {
		        "link": "https://console.aws.amazon.com/elasticache/home",
		        "name": "ElastiCache",
		        "id": "ElastiCache"
		      },
		      {
		        "link": "https://console.aws.amazon.com/redshift/home",
		        "name": "Amazon Redshift",
		        "id": "Amazon Redshift"
		      }
		    ],
		    "name": "Database",
		    "id": 13
		  },
		  "aws-quicklinks-services-4": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/migrationhub/home",
		        "name": "AWS Migration Hub",
		        "id": "AWS Migration Hub"
		      },
		      {
		        "link": "https://console.aws.amazon.com/discovery/home",
		        "name": "Application Discovery Service",
		        "id": "Application Discovery Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/dms/home",
		        "name": "Database Migration Service",
		        "id": "Database Migration Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/servermigration/home",
		        "name": "Server Migration Service",
		        "id": "Server Migration Service"
		      },
		      {
		        "link": "https://console.aws.amazon.com/importexport/home",
		        "name": "Snowball",
		        "id": "Snowball"
		      }
		    ],
		    "name": "Migration",
		    "id": 14
		  },
		  "aws-quicklinks-services-5": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/vpc/home",
		        "name": "VPC",
		        "id": "VPC"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloudfront/home",
		        "name": "CloudFront",
		        "id": "CloudFront"
		      },
		      {
		        "link": "https://console.aws.amazon.com/route53/home",
		        "name": "Route 53",
		        "id": "Route 53"
		      },
		      {
		        "link": "https://console.aws.amazon.com/apigateway/home",
		        "name": "API Gateway",
		        "id": "API Gateway"
		      },
		      {
		        "link": "https://console.aws.amazon.com/directconnect/home",
		        "name": "Direct Connect",
		        "id": "Direct Connect"
		      }
		    ],
		    "name": "Networking & Content Delivery",
		    "id": 15
		  },
		  "aws-quicklinks-services-6": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/codestar/home",
		        "name": "CodeStar",
		        "id": "CodeStar"
		      },
		      {
		        "link": "https://console.aws.amazon.com/codecommit/home",
		        "name": "CodeCommit",
		        "id": "CodeCommit"
		      },
		      {
		        "link": "https://console.aws.amazon.com/codebuild/home",
		        "name": "CodeBuild",
		        "id": "CodeBuild"
		      },
		      {
		        "link": "https://console.aws.amazon.com/codedeploy/home",
		        "name": "CodeDeploy",
		        "id": "CodeDeploy"
		      },
		      {
		        "link": "https://console.aws.amazon.com/codepipeline/home",
		        "name": "CodePipeline",
		        "id": "CodePipeline"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloud9/home",
		        "name": "Cloud9",
		        "id": "Cloud9"
		      },
		      {
		        "link": "https://console.aws.amazon.com/xray/home",
		        "name": "X-Ray",
		        "id": "X-Ray"
		      }
		    ],
		    "name": "Developer Tools",
		    "id": 16
		  },
		  "aws-quicklinks-services-7": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/cloudwatch/home",
		        "name": "CloudWatch",
		        "id": "CloudWatch"
		      },
		      {
		        "link": "https://console.aws.amazon.com/awsautoscaling/home",
		        "name": "AWS Auto Scaling",
		        "id": "AWS Auto Scaling"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloudformation/home",
		        "name": "CloudFormation",
		        "id": "CloudFormation"
		      },
		      {
		        "link": "https://console.aws.amazon.com/cloudtrail/home",
		        "name": "CloudTrail",
		        "id": "CloudTrail"
		      },
		      {
		        "link": "https://console.aws.amazon.com/config/home",
		        "name": "Config",
		        "id": "Config"
		      },
		      {
		        "link": "https://console.aws.amazon.com/opsworks/landing/home",
		        "name": "OpsWorks",
		        "id": "OpsWorks"
		      },
		      {
		        "link": "https://console.aws.amazon.com/catalog/home",
		        "name": "Service Catalog",
		        "id": "Service Catalog"
		      },
		      {
		        "link": "https://console.aws.amazon.com/systems-manager/home",
		        "name": "Systems Manager",
		        "id": "Systems Manager"
		      },
		      {
		        "link": "https://console.aws.amazon.com/trustedadvisor/home",
		        "name": "Trusted Advisor",
		        "id": "Trusted Advisor"
		      },
		      {
		        "link": "https://console.aws.amazon.com/managedservices/home",
		        "name": "Managed Services",
		        "id": "Managed Services"
		      }
		    ],
		    "name": "Management Tools",
		    "id": 17
		  },
		  "aws-quicklinks-services-8": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/elastictranscoder/home",
		        "name": "Elastic Transcoder",
		        "id": "Elastic Transcoder"
		      },
		      {
		        "link": "https://console.aws.amazon.com/kinesisvideo/home",
		        "name": "Kinesis Video Streams",
		        "id": "Kinesis Video Streams"
		      },
		      {
		        "link": "https://console.aws.amazon.com/mediaconvert/home",
		        "name": "MediaConvert",
		        "id": "MediaConvert"
		      },
		      {
		        "link": "https://console.aws.amazon.com/medialive/home",
		        "name": "MediaLive",
		        "id": "MediaLive"
		      },
		      {
		        "link": "https://console.aws.amazon.com/mediapackage/home",
		        "name": "MediaPackage",
		        "id": "MediaPackage"
		      },
		      {
		        "link": "https://console.aws.amazon.com/mediastore/home",
		        "name": "MediaStore",
		        "id": "MediaStore"
		      },
		      {
		        "link": "https://console.aws.amazon.com/mediatailor/home",
		        "name": "MediaTailor",
		        "id": "MediaTailor"
		      }
		    ],
		    "name": "Media Services",
		    "id": 18
		  },
		  "aws-quicklinks-services-9": {
		    "awsquick": true,
		    "items": [
		      {
		        "link": "https://console.aws.amazon.com/sagemaker/home",
		        "name": "Amazon SageMaker",
		        "id": "Amazon SageMaker"
		      },
		      {
		        "link": "https://console.aws.amazon.com/comprehend/home",
		        "name": "Amazon Comprehend",
		        "id": "Amazon Comprehend"
		      },
		      {
		        "link": "https://console.aws.amazon.com/deeplens/home",
		        "name": "AWS DeepLens",
		        "id": "AWS DeepLens"
		      },
		      {
		        "link": "https://console.aws.amazon.com/lex/home",
		        "name": "Amazon Lex",
		        "id": "Amazon Lex"
		      },
		      {
		        "link": "https://console.aws.amazon.com/machinelearning/home",
		        "name": "Machine Learning",
		        "id": "Machine Learning"
		      },
		      {
		        "link": "https://console.aws.amazon.com/polly/home",
		        "name": "Amazon Polly",
		        "id": "Amazon Polly"
		      },
		      {
		        "link": "https://console.aws.amazon.com/rekognition/home",
		        "name": "Rekognition",
		        "id": "Rekognition"
		      },
		      {
		        "link": "https://console.aws.amazon.com/transcribe/home",
		        "name": "Amazon Transcribe",
		        "id": "Amazon Transcribe"
		      },
		      {
		        "link": "https://console.aws.amazon.com/translate/home",
		        "name": "Amazon Translate",
		        "id": "Amazon Translate"
		      }
		    ],
		    "name": "Machine Learning",
		    "id": 19
		  }
		}
	}
}));
