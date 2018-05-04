var AWSService = React.createFactory(React.createClass({
	getInitialState:function(){
		return {};
	},
	render:function(){
		var children = [];
		if(this.props.layout == "vertical"){
			children.push(React.DOM.div({className:"tab-pinned " + (!this.props.tab.pinned?"hidden":"")}, "Pinned"))
			children.push(React.DOM.div({className:"tab-highlighted " + (!this.props.tab.highlighted?"hidden":"")}, "Active"))
			children.push(React.DOM.div({className:"tab-selected " + (!this.props.selected?"hidden":"")}, "Selected"))
			children.push(React.DOM.div({className:"iconoverlay " + (!!this.props.tab.icon?"aws-icon":""), style:{
				backgroundImage:this.resolveFavIconUrl(false),
				backgroundPosition:this.resolveFavIconUrl(true)
			}}))
			children.push(React.DOM.div({className:"tabtitle"},this.props.tab.name))
		}
		return React.DOM.div({
			className:"icon tab "
				+ (this.props.selected?"selected ":"")
				+ (this.props.hidden?"hidden ":"")
				+ (this.props.layout=="vertical"?"full ":"")
				+ (this.props.searchActive?"search-active ":"")
				+ (this.props.layout=="vertical"?"vertical ":""),
			style:{
				backgroundImage:(this.props.layout=="vertical"?"":this.resolveFavIconUrl())
			},
			title:this.props.tab.name,
			onClick:this.click,
			onMouseDown:this.onMouseDown,
			onMouseEnter:this.onHover
		},
			children,
			React.DOM.div({className:"limiter"})
		);
	},
	onHover:function(e){
		this.props.hoverHandler(this.props.tab);
	},
	onMouseDown:function(e){
		if(e.button === 0) return;
		this.click(e);
	},
	click:function(e){
		e.nativeEvent.preventDefault();
		e.nativeEvent.stopPropagation();
		if(e.button === 1) return;
		if(e.button === 2) return;
		chrome.tabs.create({url:this.props.tab.link});
		return false;
	},
	resolveFavIconUrl:function(position){

		if(!!position) {
			if(!!this.props.tab.icon) {
				return this.props.tab.icon;
			}else{
				return "0 0";
			}
		}

		if(!!this.props.tab.icon) {
			return "url(../images/spritesheet.png)";
		}

		var images = [
			"AI_AmazonLex.png",
			"AI_AmazonMachineLearning.png",
			"AI_AmazonPolly.png",
			"AI_AmazonRekognition.png",
			"Analytics_AmazonAthena.png",
			"Analytics_AmazonCloudSearch.png",
			"Analytics_AmazonCloudSearch_searchdocuments.png",
			"Analytics_AmazonEMR-HDFScluster.png",
			"Analytics_AmazonEMR.png",
			"Analytics_AmazonEMR_cluster.png",
			"Analytics_AmazonEMR_EMRengine.png",
			"Analytics_AmazonEMR_EMRengineMapRM3.png",
			"Analytics_AmazonEMR_EMRengineMapRM5.png",
			"Analytics_AmazonEMR_EMRengineMapRM7.png",
			"Analytics_AmazonES.png",
			"Analytics_AmazonKinesis.png",
			"Analytics_AmazonKinesis_AmazonKinesis-enabledapp.png",
			"Analytics_AmazonKinesis_AmazonKinesisAnalytics.png",
			"Analytics_AmazonKinesis_AmazonKinesisFirehose.png",
			"Analytics_AmazonKinesis_AmazonKinesisStreams.png",
			"Analytics_AmazonQuickSight.png",
			"Analytics_AmazonRedshift.png",
			"Analytics_AmazonRedshift_densecomputenode.png",
			"Analytics_AmazonRedshift_densestoragenode.png",
			"Analytics_AWSDataPipeline.png",
			"Analytics_AWSGlue.png",
			"ApplicationServices_AmazonAPIGateway.png",
			"ApplicationServices_AmazonElasticTranscoder.png",
			"ApplicationServices_AmazonSWF.png",
			"ApplicationServices_AmazonSWF_decider.png",
			"ApplicationServices_AmazonSWF_worker.png",
			"ApplicationServices_AWSStepFunctions.png",
			"BusinessProductivity_AmazonChime.png",
			"BusinessProductivity_AmazonWorkDocs.png",
			"BusinessProductivity_AmazonWorkMail.png",
			"Compute_AmazonEC2.png",
			"Compute_AmazonEC2_AMI.png",
			"Compute_AmazonEC2_AutoScaling.png",
			"Compute_AmazonEC2_DBoninstance.png",
			"Compute_AmazonEC2_EC2rescue.png",
			"Compute_AmazonEC2_ElasticIPaddress.png",
			"Compute_AmazonEC2_instance.png",
			"Compute_AmazonEC2_instances.png",
			"Compute_AmazonEC2_instancewithCloudWatch.png",
			"Compute_AmazonEC2_optimizedinstance.png",
			"Compute_AmazonEC2_Spotfleet.png",
			"Compute_AmazonEC2_Spotinstance.png",
			"Compute_AmazonEC2_X1instance.png",
			"Compute_AmazonECR.png",
			"Compute_AmazonECR_ECRRegistry.png",
			"Compute_AmazonECS.png",
			"Compute_AmazonECS_ECScontainer-Alt1.png",
			"Compute_AmazonECS_ECScontainer-Alt2.png",
			"Compute_AmazonECS_ECScontainer.png",
			"Compute_AmazonLightsail.png",
			"Compute_AmazonVPC.png",
			"Compute_AmazonVPC_customergateway.png",
			"Compute_AmazonVPC_elasticnetworkadapter.png",
			"Compute_AmazonVPC_elasticnetworkinterface.png",
			"Compute_AmazonVPC_endpoints.png",
			"Compute_AmazonVPC_flowlogs.png",
			"Compute_AmazonVPC_Internetgateway.png",
			"Compute_AmazonVPC_networkaccesscontrollist.png",
			"Compute_AmazonVPC_router.png",
			"Compute_AmazonVPC_VPCNATgateway.png",
			"Compute_AmazonVPC_VPCpeering.png",
			"Compute_AmazonVPC_VPNconnection.png",
			"Compute_AmazonVPC_VPNgateway.png",
			"Compute_AWSBatch.png",
			"Compute_AWSElasticBeanstalk.png",
			"Compute_AWSElasticBeanstalk_application.png",
			"Compute_AWSElasticBeanstalk_deployment.png",
			"Compute_AWSLambda.png",
			"Compute_AWSLambda_LambdaFunction.png",
			"Compute_ElasticLoadBalancing.png",
			"Compute_ElasticLoadBalancing_ApplicationLoadBalancer.png",
			"Compute_ElasticLoadBalancing_ClassicLoadbalancer.png",
			"ContactCenter_AmazonConnect.png",
			"Database_AmazonDynamoDB.png",
			"Database_AmazonDynamoDB_attribute.png",
			"Database_AmazonDynamoDB_attributes.png",
			"Database_AmazonDynamoDB_globalsecondaryindex.png",
			"Database_AmazonDynamoDB_item.png",
			"Database_AmazonDynamoDB_items.png",
			"Database_AmazonDynamoDB_table.png",
			"Database_AmazonDynamoDBAccelerator.png",
			"Database_AmazonElasticCache.png",
			"Database_AmazonElasticCache_cachenode.png",
			"Database_AmazonElasticCache_Memcached.png",
			"Database_AmazonElasticCache_Redis.png",
			"Database_AmazonRDS.png",
			"Database_AmazonRDS_DBinstance.png",
			"Database_AmazonRDS_instancereadreplica.png",
			"Database_AmazonRDS_instancestandby.png",
			"Database_AmazonRDS_MSSQLinstance.png",
			"Database_AmazonRDS_MSSQLinstancealternate.png",
			"Database_AmazonRDS_MySQLDBinstance.png",
			"Database_AmazonRDS_MySQLinstancealternate.png",
			"Database_AmazonRDS_oracleDBinstance.png",
			"Database_AmazonRDS_OracleDBinstancealternate.png",
			"Database_AmazonRDS_PIOP.png",
			"Database_AmazonRDS_PostgreSQLinstance.png",
			"Database_AmazonRDS_SQLmaster.png",
			"Database_AmazonRDS_SQLslave.png",
			"Database_AmazonRedshift.png",
			"Database_AmazonRedshift_densecomputenode.png",
			"Database_AmazonRedshift_densestoragenode.png",
			"Database_AWSDMS.png",
			"Database_AWSDMS_databasemigrationworkflowjob.png",
			"DesktopAppStreaming_AmazonAppStream2.0.png",
			"DesktopAppStreaming_AmazonWorkSpaces.png",
			"DeveloperTools_AWSCodeBuild.png",
			"DeveloperTools_AWSCodeCommit.png",
			"DeveloperTools_AWSCodeDeploy.png",
			"DeveloperTools_AWSCodePipeline.png",
			"DeveloperTools_AWSCodeStar.png",
			"DeveloperTools_AWSX-Ray.png",
			"GameDevelopment_AmazonGameLift.png",
			"General_AWScloud.png",
			"General_AWSManagementConsole.png",
			"General_client.png",
			"General_corporatedatacenter.png",
			"General_disk.png",
			"General_forums.png",
			"General_genericdatabase.png",
			"General_Internet.png",
			"General_Internetalternate1.png",
			"General_Internetalternate2.png",
			"General_mobileclient.png",
			"General_multimedia.png",
			"General_officebuilding.png",
			"General_SAMLtoken.png",
			"General_SSLpadlock.png",
			"General_tapestorage.png",
			"General_traditionalserver.png",
			"General_user.png",
			"General_users.png",
			"General_virtualprivatecloud.png",
			"InternetOfThings_AWSIoT.png",
			"InternetOfThings_AWSIoT_action.png",
			"InternetOfThings_AWSIoT_actuator.png",
			"InternetOfThings_AWSIoT_alexaskill.png",
			"InternetOfThings_AWSIoT_alexasmarthomeskill.png",
			"InternetOfThings_AWSIoT_alexavoiceservice.png",
			"InternetOfThings_AWSIoT_AVSenableddevice.png",
			"InternetOfThings_AWSIoT_AWSGreengrass.png",
			"InternetOfThings_AWSIoT_certificate.png",
			"InternetOfThings_AWSIoT_desiredstate.png",
			"InternetOfThings_AWSIoT_echo.png",
			"InternetOfThings_AWSIoT_fireTV.png",
			"InternetOfThings_AWSIoT_fireTVstick.png",
			"InternetOfThings_AWSIoT_hardwareboard.png",
			"InternetOfThings_AWSIoT_HTTP2protocol.png",
			"InternetOfThings_AWSIoT_HTTPprotocol.png",
			"InternetOfThings_AWSIoT_lambdafunction.png",
			"InternetOfThings_AWSIoT_MQTTprotocol.png",
			"InternetOfThings_AWSIoT_policy.png",
			"InternetOfThings_AWSIoT_reportedstate.png",
			"InternetOfThings_AWSIoT_rule.png",
			"InternetOfThings_AWSIoT_sensor.png",
			"InternetOfThings_AWSIoT_servo.png",
			"InternetOfThings_AWSIoT_shadow.png",
			"InternetOfThings_AWSIoT_simulator.png",
			"InternetOfThings_AWSIoT_thingbank.png",
			"InternetOfThings_AWSIoT_thingbicycle.png",
			"InternetOfThings_AWSIoT_thingcamera.png",
			"InternetOfThings_AWSIoT_thingcar.png",
			"InternetOfThings_AWSIoT_thingcart.png",
			"InternetOfThings_AWSIoT_thingcoffeepot.png",
			"InternetOfThings_AWSIoT_thingdoorlock.png",
			"InternetOfThings_AWSIoT_thingfactory.png",
			"InternetOfThings_AWSIoT_thinggeneric.png",
			"InternetOfThings_AWSIoT_thinghouse.png",
			"InternetOfThings_AWSIoT_thinglightbulb.png",
			"InternetOfThings_AWSIoT_thingmedicalemergency.png",
			"InternetOfThings_AWSIoT_thingpoliceemergency.png",
			"InternetOfThings_AWSIoT_thingthermostat.png",
			"InternetOfThings_AWSIoT_thingtravel.png",
			"InternetOfThings_AWSIoT_thingutility.png",
			"InternetOfThings_AWSIoT_thingwindfarm.png",
			"InternetOfThings_AWSIoT_topic.png",
			"ManagementTools_AmazonCloudWatch.png",
			"ManagementTools_AmazonCloudWatch_alarm.png",
			"ManagementTools_AmazonCloudWatch_eventeventbased.png",
			"ManagementTools_AmazonCloudWatch_eventtimebased.png",
			"ManagementTools_AmazonCloudWatch_rule.png",
			"ManagementTools_AmazonEC2SystemsManager.png",
			"ManagementTools_AmazonEC2SystemsManager_Automation.png",
			"ManagementTools_AmazonEC2SystemsManager_documents.png",
			"ManagementTools_AmazonEC2SystemsManager_Inventory.png",
			"ManagementTools_AmazonEC2SystemsManager_MaintenanceWindow.png",
			"ManagementTools_AmazonEC2SystemsManager_ParameterStore.png",
			"ManagementTools_AmazonEC2SystemsManager_PatchManager.png",
			"ManagementTools_AmazonEC2SystemsManager_RunCommand.png",
			"ManagementTools_AmazonEC2SystemsManager_StateManager.png",
			"ManagementTools_AWSCloudFormation.png",
			"ManagementTools_AWSCloudFormation_changeset.png",
			"ManagementTools_AWSCloudFormation_stack.png",
			"ManagementTools_AWSCloudFormation_template.png",
			"ManagementTools_AWSCloudTrail.png",
			"ManagementTools_AWSConfig.png",
			"ManagementTools_AWSManagedServices.png",
			"ManagementTools_AWSOpsWorks.png",
			"ManagementTools_AWSOpsWorks_apps.png",
			"ManagementTools_AWSOpsWorks_deployments.png",
			"ManagementTools_AWSOpsWorks_instances.png",
			"ManagementTools_AWSOpsWorks_layers.png",
			"ManagementTools_AWSOpsWorks_monitoring.png",
			"ManagementTools_AWSOpsWorks_permissions.png",
			"ManagementTools_AWSOpsWorks_resources.png",
			"ManagementTools_AWSOpsWorks_stack.png",
			"ManagementTools_AWSServiceCatalog.png",
			"ManagementTools_AWSTrustedAdvisor.png",
			"ManagementTools_AWSTrustedAdvisor_checklist.png",
			"ManagementTools_AWSTrustedAdvisor_checklistcost.png",
			"ManagementTools_AWSTrustedAdvisor_checklistfaulttolerance.png",
			"ManagementTools_AWSTrustedAdvisor_checklistperformance.png",
			"ManagementTools_AWSTrustedAdvisor_checklistsecurity.png",
			"Messaging_AmazonPinpoint.png",
			"Messaging_AmazonSES.png",
			"Messaging_AmazonSES_email.png",
			"Messaging_AmazonSNS.png",
			"Messaging_AmazonSNS_emailnotification.png",
			"Messaging_AmazonSNS_HTTPnotification.png",
			"Messaging_AmazonSNS_topic.png",
			"Messaging_AmazonSQS.png",
			"Messaging_AmazonSQS_message.png",
			"Messaging_AmazonSQS_queue.png",
			"Migration_AWSApplicationDiscoveryService.png",
			"Migration_AWSDMS.png",
			"Migration_AWSDMS_databasemigrationworkflow-job.png",
			"Migration_AWSMigrationHub.png",
			"Migration_AWSSMS.png",
			"Migration_AWSSnowball.png",
			"Migration_AWSSnowball_importexport.png",
			"MobileServices_AmazonAPIGateway.png",
			"MobileServices_AmazonCognito.png",
			"MobileServices_AmazonMobileAnalytics.png",
			"MobileServices_AmazonPinpoint.png",
			"MobileServices_AWSDeviceFarm.png",
			"NetworkingContentDelivery_AmazonCloudFront.png",
			"NetworkingContentDelivery_AmazonCloudFront_downloaddistribution.png",
			"NetworkingContentDelivery_AmazonCloudFront_edgelocation.png",
			"NetworkingContentDelivery_AmazonCloudFront_streamingdistribution.png",
			"NetworkingContentDelivery_AmazonRoute53.png",
			"NetworkingContentDelivery_AmazonRoute53_hostedzone.png",
			"NetworkingContentDelivery_AmazonRoute53_routetable.png",
			"NetworkingContentDelivery_AmazonVPC.png",
			"NetworkingContentDelivery_AmazonVPC_customergateway.png",
			"NetworkingContentDelivery_AmazonVPC_elasticnetworkadapter.png",
			"NetworkingContentDelivery_AmazonVPC_elasticnetworkinterface.png",
			"NetworkingContentDelivery_AmazonVPC_endpoints.png",
			"NetworkingContentDelivery_AmazonVPC_flowlogs.png",
			"NetworkingContentDelivery_AmazonVPC_internetgateway.png",
			"NetworkingContentDelivery_AmazonVPC_networkaccesscontrollist_AmazonVPC_networkaccesscontrollist.png",
			"NetworkingContentDelivery_AmazonVPC_router.png",
			"NetworkingContentDelivery_AmazonVPC_VPCNATgateway.png",
			"NetworkingContentDelivery_AmazonVPC_VPCpeering.png",
			"NetworkingContentDelivery_AmazonVPC_VPNconnection.png",
			"NetworkingContentDelivery_AmazonVPC_VPNgateway.png",
			"NetworkingContentDelivery_AWSDirectConnect.png",
			"NetworkingContentDelivery_ElasticLoadBalancing.png",
			"NetworkingContentDelivery_ElasticLoadBalancing_ApplicationLoadBalancer.png",
			"NetworkingContentDelivery_ElasticLoadBalancing_ClassicLoadBalancer.png",
			"OnDemandWorkforce_AmazonMechanicalTurk.png",
			"OnDemandWorkforce_AmazonMechanicalTurk_assignmenttask.png",
			"OnDemandWorkforce_AmazonMechanicalTurk_humanintelligencetasks.png",
			"OnDemandWorkforce_AmazonMechanicalTurk_requester.png",
			"OnDemandWorkforce_AmazonMechanicalTurk_workers.png",
			"SDKs_Android.png",
			"SDKs_AWSCLI.png",
			"SDKs_AWSToolkitForEclipse.png",
			"SDKs_AWSToolkitForVisualStudio.png",
			"SDKs_AWSToolsForWindowsPowerShell.png",
			"SDKs_iOS.png",
			"SDKs_Java.png",
			"SDKs_JavaScript.png",
			"SDKs_Net.png",
			"SDKs_Nodejs.png",
			"SDKs_PHP.png",
			"SDKs_Python.png",
			"SDKs_Ruby.png",
			"SDKs_Xamarin.png",
			"SecurityIdentityCompliance_ACM_certificatemanager.png",
			"SecurityIdentityCompliance_AmazonCloudDirectory.png",
			"SecurityIdentityCompliance_AmazonInspector.png",
			"SecurityIdentityCompliance_AmazonInspector_agent.png",
			"SecurityIdentityCompliance_AmazonMacie.png",
			"SecurityIdentityCompliance_AWSArtifact.png",
			"SecurityIdentityCompliance_AWSCertificateManager.png",
			"SecurityIdentityCompliance_AWSCertificateManager_certificatemanager.png",
			"SecurityIdentityCompliance_AWSCloudHSM.png",
			"SecurityIdentityCompliance_AWSDirectoryService.png",
			"SecurityIdentityCompliance_AWSIAM.png",
			"SecurityIdentityCompliance_AWSIAM_addon.png",
			"SecurityIdentityCompliance_AWSIAM_AWSSTS-2.png",
			"SecurityIdentityCompliance_AWSIAM_AWSSTS.png",
			"SecurityIdentityCompliance_AWSIAM_dataencryptionkey.png",
			"SecurityIdentityCompliance_AWSIAM_encrypteddata.png",
			"SecurityIdentityCompliance_AWSKMS.png",
			"SecurityIdentityCompliance_AWSOrganizations.png",
			"SecurityIdentityCompliance_AWSShield.png",
			"SecurityIdentityCompliance_AWSWAF.png",
			"SecurityIdentityCompliance_AWSWAF_filteringrule.png",
			"SecurityIdentityCompliance_IAM_long-termsecuritycredential.png",
			"SecurityIdentityCompliance_IAM_MFAtoken.png",
			"SecurityIdentityCompliance_IAM_permissions.png",
			"SecurityIdentityCompliance_IAM_temporarysecuritycredential.png",
			"Storage_AmazonEBS.png",
			"Storage_AmazonEFS.png",
			"Storage_AmazonEFS_EFSfilesystem.png",
			"Storage_AmazonGlacier.png",
			"Storage_AmazonGlacier_archive.png",
			"Storage_AmazonGlacier_vault.png",
			"Storage_AmazonS3.png",
			"Storage_AmazonS3_bucket.png",
			"Storage_AmazonS3_bucketwithobjects.png",
			"Storage_AmazonS3_object.png",
			"Storage_AWSSnowball.png",
			"Storage_AWSSnowball_importexport.png",
			"Storage_AWSStorageGateway.png",
			"Storage_AWSStorageGateway_cachedvolume.png",
			"Storage_AWSStorageGateway_non-cachedvolume.png",
			"Storage_AWSStorageGateway_virtualtapelibrary.png",
			"Storage_snapshot.png",
			"Storage_volume.png"
		];
		var compare = this.props.tab.name;
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.match(/\b(\w)/g).join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		compare = compare.replace("AWS ", "");
		compare = compare.replace("Amazon ", "");
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.match(/\b(\w)/g).join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		compare = compare.split(" ")[0];
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")+".png") > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("_")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.split(" ").join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};
		for (var i = images.length - 1; i >= 0; i--) {
			if(images[i].indexOf(compare.match(/\b(\w)/g).join("")) > -1) {
				return "url(../icons/"+images[i]+")";
			}
		};

		return "url(../icons/Compute_Amazon"+compare+".png)";
	}
}));
