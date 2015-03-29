SlackTeam = function(accessToken, name, url) {
	this.accessToken = accessToken;
	this.name = name;
	this.url = url;
	this.channels = [];
	this.groups = [];
	this.ims = [];

	this.users = {};

	this.setAccessToken = function(accessToken) {
		this.accessToken = accessToken;
	};
	this.getAccessToken = function() {
		return this.accessToken;
	};
	this.loadChannels = function() {
		var that = this;
		$.post('https://slack.com/api/channels.list', {token: this.getAccessToken(), exclude_archived: '1'},
			function(data) {
				if (typeof(data.channels) != 'undefined')
					for (var k in data.channels)
						that.channels.push(new SlackChannel(data.channels[k].id, data.channels[k].name, that, 'channel'));
			}, "JSON");
	};
	this.loadGroups = function() {
		var that = this;
		$.post('https://slack.com/api/groups.list', {token: this.getAccessToken(), exclude_archived: '1'},
			function(data) {
				if (typeof(data.groups) != 'undefined')
					for (var k in data.groups)
						that.groups.push(new SlackChannel(data.groups[k].id, data.groups[k].name, that, 'group'));
			}, "JSON");
	};
	this.loadIMs = function() {
		var that = this;
		$.post('https://slack.com/api/im.list', {token: this.getAccessToken()},
			function(data) {
				if (typeof(data.ims) != 'undefined')
					for (var k in data.ims)
						that.ims.push(new SlackChannel(data.ims[k].id, data.ims[k].user, that, 'im'));
			}, "JSON");
	};
	this.loadUsers = function() {
		var that = this;
		$.post('https://slack.com/api/users.list', {token: this.getAccessToken()},
			function(data) {
				if (typeof(data.members) != 'undefined')
					for (var k in data.members)
						that.users[data.members[k].id] = data.members[k].name;
				that.onUpdated();
			}, "JSON");
	};
	this.onUpdated = function() {
		app.fillItems();
	};
	this.getUserNameById = function(id) {
		if (typeof(this.users[id]) !== 'undefined')
			return this.users[id];
		else
			return id;
	}
	this.fetch = function() {
		for (var k in this.channels)
			this.channels[k].fetch();
		for (var k in this.groups)
			this.groups[k].fetch();
		for (var k in this.ims)
			this.ims[k].fetch();
	};

	this.loadChannels();
	this.loadGroups();
	this.loadIMs();
	this.loadUsers();
}