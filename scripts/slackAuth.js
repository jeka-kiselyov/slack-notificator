var slackAuth = {
	clientId: '2960868201.4139681332',
	clientSecret: '176db916bbd2bd828eaab2a886444a2b',
	redirectURL: 'http://l-github.com/slacknotify/',
	accessTokens: []
};

slackAuth.init = function() {
	var sTokens = localStorage.getItem("tokens");
	if (sTokens)
	{
		slackAuth.accessTokens = JSON.parse(sTokens);
	}

	slackAuth.checkForCode();
}

slackAuth.addToken = function(token, teamName, teamURL) {
	for (var k in slackAuth.accessTokens)
		if (slackAuth.accessTokens[k].token == token)
		{
			document.location = slackAuth.redirectURL;
			return false;
		}

	slackAuth.accessTokens.push({
		token: token,
		name: teamName,
		url: teamURL
	});

	slackAuth.saveTokens();
	document.location = slackAuth.redirectURL;

	return true;
}

slackAuth.removeToken = function(token) {
    slackAuth.accessTokens = slackAuth.accessTokens.filter(function(i) {
      return i.token != token;
    });
	
	slackAuth.saveTokens();
	return true;
}

slackAuth.saveTokens = function() {
	localStorage.setItem("tokens", JSON.stringify(slackAuth.accessTokens));
}

slackAuth.authenticate = function(domain) {
	var oauthURL = 'https://slack.com/oauth/authorize';
	oauthURL+= '?client_id='+encodeURIComponent(slackAuth.clientId);
	oauthURL+= '&redirect_uri='+encodeURIComponent(slackAuth.redirectURL);
	oauthURL+= '&scope=read,identify';
	//oauthURL+= '&team='+encodeURIComponent(domain);
	oauthURL+= '&state='+encodeURIComponent(domain);

	document.location = oauthURL;

	return true;
}

slackAuth.checkForCode = function(callbackFunc) {
	if (slackAuth.getParameterByName('code') != '')
	{
		/// retrieve token
		
		var tokenURL = 'https://slack.com/api/oauth.access';
		tokenURL+= '?client_id='+encodeURIComponent(slackAuth.clientId);
		tokenURL+= '&client_secret='+encodeURIComponent(slackAuth.clientSecret);
		tokenURL+= '&code='+encodeURIComponent(slackAuth.getParameterByName('code'));
		tokenURL+= '&redirect_uri='+encodeURIComponent(slackAuth.redirectURL);

		$.post(tokenURL, {}, function(data){
			if (typeof(data.access_token) !== 'undefined')
			{
				var access_token = data.access_token;
				$.post("https://slack.com/api/auth.test", {token: access_token}, function(data){
					if (typeof(data.team) !== 'undefined')
						slackAuth.addToken(access_token, data.team, data.url);
					if (typeof(callbackFunc) == 'function')
						callbackFunc();

				}, "JSON");
			}
		}, "JSON");

		return true;
	}

	return false;
}

slackAuth.saveAccessToken = function(token) {
	var tokens = localStorage.getItem('tokens');
}

slackAuth.getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}