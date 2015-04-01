SlackMessage = function(data, channel, team) {
	this.id = data.id || null;
	this.text = data.text || '';
	this.ts = data.ts || 0;
	this.user = data.user || '';

	this.channel = channel;
	this.team = team;

	this.attachments = data.attachments || [];

	this.template = '<li class="list-group-item message-type-%type%" id="m_%id%">%icon% <a href="%url%">%team% / %channel%</a><br> %user%: %body% %preview%</li>';

	this.getNotificationTitle = function() {
		return this.team.name + '/' + this.getChannelName();
	};
	this.getNotificationDescription = function() {
		var that = this;
		this.text = this.text.replace(/<@([^>]+)>/gi, function(m, p){ return that.team.getUserNameById(p); });

		return this.text;
	};
	this.getHTML = function() {
		var that = this;
		this.text = this.text.replace(/<@([^>]+)>/gi, function(m, p){ return that.team.getUserNameById(p); });
		return  this.template.split('%id%').join(this.id).
			split('%body%').join(this.text).
			split('%type%').join(this.channel.type).
			split('%icon%').join(this.getIcon()).
			split('%preview%').join(this.getPreviewImage()).
			split('%team%').join(this.team.name).
			split('%url%').join(this.getURL()).
			split('%user%').join(this.team.getUserNameById(this.user)).
			split('%channel%').join(this.getChannelName());
	};
	this.getPreviewImage = function() {
		if (typeof(this.attachments) === 'undefined' || this.attachments.length == 0)
			return '';

		var html = '<br>';
		for (var k in this.attachments)
			{
				if (typeof(this.attachments[k].title) !== 'undefined' && this.attachments[k].title != '')
				{
					if (typeof(this.attachments[k].title_link) !== 'undefined' && this.attachments[k].title_link != '')
						html += '<a href="'+this.attachments[k].title_link+'" target="_blank">'+this.attachments[k].title+'</a><br>';
					else
						html += this.attachments[k].title+'<br>';
				}
				if (typeof(this.attachments[k].image_url) !== 'undefined' && this.attachments[k].image_url != '')
					html += '<img src="'+this.attachments[k].image_url+'" style="max-width: 100%;">';
			}

		return html;
	}
	this.getChannelName = function() {
      if (this.channel.type == 'im')
        return this.team.getUserNameById(this.channel.name);
      else
        return this.channel.name;		
	}
	this.getURL = function() {
      if (this.channel.type == 'im')
        return this.team.url+'/messages/@'+this.team.getUserNameById(this.channel.name)+'/';
      else
        return this.team.url+'/messages/'+this.channel.name+'/';
	};
	this.getIcon = function() {
	    if (this.channel.type == 'channel')
	      return '<span class="glyphicon glyphicon-th-list"></span>';
	    if (this.channel.type == 'group')
	      return '<span class="glyphicon glyphicon-align-justify"></span>';
	    if (this.channel.type == 'im')
	      return '<span class="glyphicon glyphicon-user"></span>';
	}

}