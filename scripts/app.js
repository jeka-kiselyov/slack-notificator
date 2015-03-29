app = {};
app.teams = [];
app.alreadyInNotificationsIDs = [];

app.initInterface = function()
{
  for (var k in slackAuth.accessTokens)
  {
    app.addAuthTokenItem(slackAuth.accessTokens[k].name, slackAuth.accessTokens[k].token, slackAuth.accessTokens[k].url);
    var team = new SlackTeam(slackAuth.accessTokens[k].token, slackAuth.accessTokens[k].name, slackAuth.accessTokens[k].url);
    app.teams.push(team);
  }

  $("#authes_container").on('click', 'a', function(){
    var token = $(this).parents().data('token');

    if (token)
    {
      slackAuth.removeToken(token);
      $("#authes_container").html('');
      for (var k in slackAuth.accessTokens)
        app.addAuthTokenItem(slackAuth.accessTokens[k].name, slackAuth.accessTokens[k].token);
    }
  });

  if (!desktopNotificator.hasPermission())
    desktopNotificator.requestPermission(function(){
        /// permissions updated
    });

  desktopNotificator.config({defaultIcon: 'https://slack.global.ssl.fastly.net/ba3c/img/icons/app-256.png'});
  desktopNotificator.start(); 
  setInterval(app.fetch, 600000);
}

app.addAuthTokenItem = function(name, token, url)
{
  var html = "<li class=\"list-group-item\" data-token=\""+token+"\"><a href=\"#\"><span class=\"glyphicon glyphicon-remove\"></span></a> "+name+"</li>";
  $('#authes_container').prepend(html);
}

app.fetch = function() 
{
  for (var k in app.teams)
    app.teams[k].fetch();
}

app.fillItems = function()
{
  var messages = [];

  var addMessage = function(message) {
    messages.push(message);

    if (typeof(app.alreadyInNotificationsIDs[message.id]) == 'undefined')
    {
      app.alreadyInNotificationsIDs[message.id] = true;
      desktopNotificator.addItem(message.getNotificationTitle(), message.getNotificationDescription());
    }
  }

  for (var tk in app.teams)
    for (var ck in app.teams[tk].channels)
      for (var mk in app.teams[tk].channels[ck].messages)
        addMessage(app.teams[tk].channels[ck].messages[mk]);

  for (var tk in app.teams)
    for (var ck in app.teams[tk].groups)
      for (var mk in app.teams[tk].groups[ck].messages)
        addMessage(app.teams[tk].groups[ck].messages[mk]);

  for (var tk in app.teams)
    for (var ck in app.teams[tk].ims)
      for (var mk in app.teams[tk].ims[ck].messages)
        addMessage(app.teams[tk].ims[ck].messages[mk]);

  messages.sort(function(a,b) { return parseFloat(b.ts) - parseFloat(a.ts) } );


  var html = '';

  for (var k in messages)
    html += messages[k].getHTML();

  $('#items_container').html(html);
}


$(function(){

  (function() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document)
      document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
      document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
      document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
      document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ("onfocusin" in document)
      document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
      window.onpageshow = window.onpagehide
      = window.onfocus = window.onblur = onchange;

    function onchange (evt) {
      var v = "visible", h = "hidden",
          evtMap = {
            focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
          };

      var isVisible = h;

      evt = evt || window.event;
      if (evt.type in evtMap)
        isVisible = evtMap[evt.type];
      else
        isVisible = this[hidden] ? "hidden" : "visible";

      if (isVisible == 'visible')
        desktopNotificator.clear();
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if( document[hidden] !== undefined )
      onchange({type: document[hidden] ? "blur" : "focus"});
  })();

});