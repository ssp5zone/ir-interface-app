/**
* HTML controll -- STARTS
*/

// global page var
var htmlApp = {

	readButton: undefined,
	writeButton: undefined,
	jamButton: undefined,
	buttonContainer: undefined,
	primaryButtons: undefined,

	disconnectTimer: undefined,
	readStartTimer: undefined,
	writeStartTimer: undefined,
	readStopTimer: undefined,
	writeStopTimer: undefined,

	isConnected: undefined,
	isReading: undefined,
	isWriting: undefined,
	isJamming: undefined,

	inputPageHash: undefined,
	outputPageHash: undefined,

	init: function() {
		this.readButton = $('#read');
		this.writeButton = $('#write');
		this.jamButton = $('#jam');
		this.buttonContainer = $('.button-container');
		this.primaryButtons = $('.button-container>.button');

		this.writeButton.hide();
		this.jamButton.hide();

		this.inputPageHash = "#i-page";
		this.outputPageHash = "#o-page";

		this.bindEvents();
	},

	bindEvents: function () {
		this.primaryButtons.bind('click.init', $.proxy(this.togglePrimaryButtons, this));
	},	

	I: function() {
		if (this.isReading) {
			this.blinkButton(this.readButton);
			this.readStopTimer = window.setTimeout($.proxy(function() {
				this.buttonContainer.addClass('fullscreen').delay('2000').queue(() => {
					this.buttonContainer.addClass('column');
					this.writeButton.slideDown('2000').css('display','inline-block'); 
					this.jamButton.slideDown('2000').css('display','inline-block');
					this.readButton.removeClass('active');
					this.stopBlinking(this.readButton);
					this.buttonContainer.dequeue();
				});				
				this.readStopTimer = undefined;
				this.isReading = false;
			}, this), 4000);
		} else {
			this.readStartTimer = window.setTimeout($.proxy(function() {
				this.changePageHash(this.inputPageHash);
				this.blinkButton(this.readButton);
				this.writeButton.slideUp('2000'); 
				this.jamButton.slideUp('2000');
				this.readButton.delay('3000').queue(() => {
					this.buttonContainer.removeClass('column').removeClass('fullscreen');
					this.readButton.dequeue();
					this.stopBlinking(this.readButton);
				});				
				this.readStartTimer = undefined;
				this.isReading = true;
			}, this), 3000);			
		}
	},

	O: function() {
		if (this.isWriting) {
			this.blinkButton(this.writeButton);
			this.writeStopTimer = window.setTimeout($.proxy(function() {
				this.buttonContainer.addClass('fullscreen').delay('2000').queue(() => {
					this.buttonContainer.addClass('column');
					this.readButton.slideDown('2000').css('display','inline-block'); 
					this.jamButton.slideDown('2000').css('display','inline-block');
					this.writeButton.removeClass('active');
					this.stopBlinking(this.writeButton);
					this.buttonContainer.dequeue();
				});				
				this.writeStopTimer = undefined;
				this.isWriting = false;
			}, this), 40);
		} else {
			this.writeStartTimer = window.setTimeout($.proxy(function() {
				this.changePageHash(this.outputPageHash);
				this.clearList();
				this.populateList(this.outputPageHash, this.getOutputData());
				this.blinkButton(this.writeButton);
				this.readButton.slideUp('2000'); 
				this.jamButton.slideUp('2000');
				this.writeButton.delay('3000').queue(() => {
					this.buttonContainer.removeClass('column').removeClass('fullscreen');
					this.writeButton.dequeue();
					this.stopBlinking(this.writeButton);
				});				
				this.writeStartTimer = undefined;
				this.isWriting = true;
			}, this), 30);			
		}
	},

	J: function() {
		
	},

	connect: function() {
		this.isConnected = true;
		window.setTimeout($.proxy(function() {
			this.writeButton.slideDown('2000').css('display','inline-block'); 
			this.jamButton.slideDown('2000').css('display','inline-block');			
		}, this), 2000);
		window.setTimeout($.proxy(function() {
			this.readButton.removeClass('active');
		}, this), 3000);
	},

	disconnect: function() {
		console.log('Auto disconnect in 5 seconds...');
		this.disconnectTimer = window.setTimeout($.proxy(function() {
			this.writeButton.slideUp('2000'); 
			this.jamButton.slideUp('2000');
			this.disconnectTimer = undefined;
			this.isConnected = false;
		}, this), 10000);		
	},

	changePageHash: function(hash) {
		$.mobile.changePage(hash);
	},

	clearList: function(pageHash) {
		$(pageHash).find('ul>li').remove();
	},

	populateList: function(pageHash, data) {
		var list = $(pageHash).find('ul');
		list.empty();
		$.each(data, (index, node) => {
			var listElement = $('<li><a href="#">' + node.name + '</a></li>');
			if (node.children) {
				listElement.on('click', () => {
					this.populateList(pageHash, node.children);
				});
			} else {
				listElement.attr('data-icon',"false");
			}
		    list.append(listElement);
		});
		if (data.parent) {
			var backElement = $('<li class="back" data-icon="back"><a href="#">Back</a></li>');
			backElement.on("click", () => {
				this.populateList(pageHash, data.parent);
			});
			list.append(backElement);
			list.listview({autodividers: false});
		} else {
			list.listview({autodividers: true});
		}
		list.listview("refresh");
	},

	togglePrimaryButtons: function(event) {
		var button = event.target;

		if (this.disconnectTimer || this.readStartTimer || this.writeStartTimer) 
		{
			console.log('Aborting operation');
			window.clearTimeout(this.disconnectTimer);
			window.clearTimeout(this.readStartTimer);
			window.clearTimeout(this.writeStartTimer);
			this.disconnectTimer = undefined;
			this.readStartTimer = undefined;
			this.writeStartTimer = undefined;
		} else if (this.readStopTimer) {
			window.clearTimeout(this.readStopTimer);
			this.readStopTimer = undefined;
			this.stopBlinking(this.readButton);
			return;
		} else if (this.writeStopTimer) {
			window.clearTimeout(this.writeStopTimer);
			this.writeStopTimer = undefined;
			this.stopBlinking(this.writeButton);
			return;
		}

		if (this.isReading) {
			this.I();
			return;
		} else if (this.isWriting) {
			this.O();
			return;
		}

		if (this.isConnected) {
			if ($(button).hasClass('active')) {
				$(button).removeClass('active');
				this.disconnect();
			} else {
				this.primaryButtons.removeClass('active');					
				if (button === this.readButton[0]) {
					this.readButton.addClass('active');
					this.I();
				} else if (button === this.writeButton[0]) {
					this.writeButton.addClass('active');
					this.O();
				} else if (button === this.jamButton[0]) {
					this.jamButton.addClass('active');
					this.J();
				}
			}
		} else {
			if (button === this.readButton[0]) {
				this.readButton.addClass('active');
			}
			this.connect();
		}		
	},

	blinkButton: function(button) {
		button.addClass('blink');
	},

	stopBlinking: function(button) {
		button.removeClass('blink');
	},

	getOutputData: function() {
		var data = [{"name":"Akai"},{"name":"Akari"},{"name":"AOC TV"},{"name":"Acer"},{"name":"Bush"},
		{"name":"Blue Star", "children": [{"name": "A/C", "children": [{"name" : "OverHead", "children" : [{"name": "17&deg;"}, {"name": "25&#xb0;"}, {"name": "28&#xb0;"}, {"name": "Swith ON"}, {"name": "Switch OFF"},]}]}]},
		{"name":"Daikin"},{"name":"Dish TV"},{"name":"Emerson"},{"name":"Fujitsu"},{"name":"Haier"},{"name":"Hitachi"},
		{"name":"LG"},{"name":"Micromax"},{"name":"Onida"},{"name":"Panasonic"},{"name":"Philips"},{"name":"Samsung"},
		{"name":"Sansui"},{"name":"Sanyo"},{"name":"Sharp"},{"name":"Sony"},{"name":"Sparc"},{"name":"Tata Sky"},
		{"name":"TCL"},{"name":"Universal"},{"name":"Videocon"},{"name":"Voltas"},{"name":"Vu"},{"name":"Whirlpool"},
		{"name":"Zenith"}];
		this.addParentInfo(data);
		return data;
	},

	addParentInfo: function(data) {
		$.each(data, (index, node) => {
			if (node.children) {
				node.children.parent = data;
				this.addParentInfo(node.children);
			} 
		});
	}
};
// on page load
$(function(){
	htmlApp.init();
	app.Start();
});

/**
* HTML controll -- ENDS
*/


/**
* ANDROID controll -- STARTS
*/
function OnStart() {
	app.SetScreenMode("Full");
}
/**
* ANDROID controll -- ENDS
*/

/**
* Dummy app for non-android -- STARTS
*/
if (app === undefined) {
	var app = {
		Start: function() {
			OnStart();
		},
		SetScreenMode: function() {
			console.log("Entering fullscreen mode");
		},
	};
}
/**
* Dummy app for non-android -- ENDS
*/