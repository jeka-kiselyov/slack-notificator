SlackChannel = function(id, name, SlackTeam, type) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.team = SlackTeam;
	this.messages = [];
	this.messagesIds = {};
	this.mostRecentTimestamp = 0;

	this.fetch = function() {
		var that = this;
		var url = 'https://slack.com/api/channels.history';
		if (this.type == 'group')
			url = 'https://slack.com/api/groups.history';
		if (this.type == 'im')
			url = 'https://slack.com/api/im.history';

		$.post(url, 
			{
				token: this.team.getAccessToken(),
				channel: this.id,
				count: 10,
				oldest: this.mostRecentTimestamp
			},
			function(data) {
				if (typeof(data.messages) != 'undefined')
					for (var k in data.messages)
					{
						var id = that.id + '_' + data.messages[k].ts;

						if (typeof(that.messagesIds[id]) === 'undefined')
						{
							data.messages[k].id = id;

							that.messages.push(new SlackMessage(data.messages[k], that, that.team));
							that.messagesIds[id] = true;							
						}

						if (data.messages[k].ts > that.mostRecentTimestamp)
							that.mostRecentTimestamp = data.messages[k].ts;
					}

				that.team.onUpdated();
			}, "JSON");
	};

	this.fetch();
}