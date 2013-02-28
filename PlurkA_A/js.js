// JavaScript Document
var plurkA_A_Version = '1.2a';
var friendThresHold = 300;
function plurk(data, callback){
	$.ajax({
		url:'main.php',
		type:'POST',
		data:data,
		dataType:"json",
		success: callback,
	});
}
function getFriendList(id, callback, offset){
	if(!offset){
		if(friendList[id])return callback(id);
		offset = 0;
		friendList[id] = new Array();
		friendList[id].push(id);//One is friend of himself
		debug('Getting ID:'+id);
	}
	plurk({
		resource:'/APP/FriendsFans/getFriendsByOffset',
		method:'POST',
		data:{
			user_id: id,
			offset: offset,
			limit: 40
		}
	},function(data){
		if(!data || !data.length)return callback(id);
		var div = $('#friend');
		for(var i=0; i<data.length; ++i){
			friendName[data[i].uid] = data[i].display_name;
			friendLink[data[i].uid] = data[i].nick_name;
			friendList[id].push(data[i].uid);
		}
		getFriendList(id, callback, offset+40);
	});
}
function myFriendListOK(id){
	if(!sortedList[id]){
		friendList[id].sort();
		sortedList[id] = true;
	}
	info('');
	debug('My Friends OK');
	btn_on();
}
function myFriendFriendListOK(id){
	if(!sortedList[id]){
		friendList[id].sort();
		sortedList[id] = true;
	}
	set_progress_part(100 - (friendListStack.length*100/friendListStackTotal));
	debug(friendName[id]+'('+id+') has '+friendList[id].length + ' friend(s)');
	if(suspectList == null)//first run
		suspectList = friendList[id];
	else
		suspectList = arrayIntersection(suspectList, friendList[id]);
	updateSuspect();
	debug('Remain Friends\' Friends '+friendListStack.length);
	if(friendListStack.length)
		getFriendList(friendListStack.pop(), myFriendFriendListOK);
	else{
		--friendThreadRunning;
		debug('Friend Thread Finished: '+ (friendThread-friendThreadRunning)+'/'+friendThread);
		if(!friendThreadRunning){
			info('');
			set_progress_total(-1);
			set_progress_part(-1);
			btn_on();
		}
	}
}
function updateSuspect(){
	var div = $('#suspect div');
	div.empty();
	var h3 = $('<h3>').appendTo(div);
	h3.text('以下可能是原PO (總共 '+suspectList.length+' 人)');
	for(var i=0; i<suspectList.length; ++i){
		var row = $('<div>').appendTo(div);
		var a = $('<a>').appendTo(row);
		a.attr('target', '_blank');
		a.attr('href', 'http://www.plurk.com/'+friendLink[suspectList[i]]);
		a.text(friendName[suspectList[i]]);
	}
}
var btn_enable = false;
function btn_off(){
	btn_enable = false;
	btn_set();
}
function btn_on(){
	btn_enable = true;
	btn_set();
}
function btn_set(){
	if(btn_enable){
		$('button#stop_trace').attr('disabled', 'disabled');
		$('button.gogo').attr('disabled', false);
	}else{
		$('button#stop_trace').attr('disabled', false);
		$('button.gogo').attr('disabled', 'disabled');
	}
}
var my_plurk_id = 0;
var totalFriends = 0;
var friendCountFinished = 0;
var friendList = new Array();
var friendName = new Array();
var friendLink = new Array();
var friendCount = new Array();
var friendListStack = new Array();
var friendListStackTotal = 0;
var sortedList = new Array();
var suspectList = new Array();
var dateOffset = new Date();
var friendThread = 3;
var friendThreadRunning = 0;

var totalStep = 3;
var curStep = 0;

function goA_A(){
	var plurk_id = $(this).attr('id').split('_')[1];
	var suspecth2 = $('#suspect h2');
	$('#suspect div').empty();
	suspecth2.text('邪王真眼注視著 ' + $('#see_text_'+plurk_id).text());	
	$('#suspect').show('fast');;
	debug('---Plurk ID: ' + plurk_id + '---');
	suspectList = new Array();
	btn_off();
	curStep = 0;
	info('正在取得回覆者');
	set_progress_total(0);
	set_progress_part(0);
	plurk({
		resource:'/APP/Responses/get',
		method:'POST',
		data:{
			plurk_id:plurk_id
		}
	},function(data){
		if(!data)return do_reload();
		set_progress_total((++curStep/totalStep)*100);
		set_progress_part(100);
		var hasMe = false;
		$.each(data.friends, function(i, v){
			friendName[v.uid] = v.display_name;
			friendLink[v.uid] = v.nick_name;
			friendListStack.push(v.uid);
			if(v.uid == my_plurk_id)
				hasMe = true;
		});
		if(!hasMe)
			friendListStack.push(my_plurk_id);
		friendThreadRunning = 0;
		friendCountFinished = 0;
		suspectList = null;
		//Sort stack
		info('正在取的回覆者的好友數量...');
		set_progress_part(0);
		for(var i=0; i<friendListStack.length; ++i){
			if(friendCount[friendListStack[i]]){
				getFriendCount(friendListStack[i]);
				continue;
			}
			plurk({
				resource:'/APP/Profile/getPublicProfile',
				method:'POST',
				data:{
					user_id: friendListStack[i]
				}
			},function(data){
				friendCount[data.user_info.uid] = data.friends_count;
				friendName[data.user_info.uid] = data.user_info.display_name;
				friendLink[data.user_info.uid] = data.user_info.nick_name;
				getFriendCount(data.user_info.uid);
			});
		};
	});
}
function getFriendCount(id){
	++friendCountFinished;
	set_progress_part(friendCountFinished*100/friendListStack.length);
	if(friendCountFinished == friendListStack.length){
		info('正在取得回覆者的好友名單, 此步驟計算量大, 請耐心等候...');
		set_progress_total((++curStep/totalStep)*100);
		set_progress_part(0);
		friendListStack.sort(function(a, b){
			return friendCount[b] - friendCount[a];
		});
		var str='';
		for(var i=0; i<friendListStack.length; ++i){
			var fid = friendListStack[i];
			if(!friendList[fid] && friendCount[fid] > friendThresHold){
				var c = confirm(friendName[fid] + '好友名單有' + friendCount[fid] + '人, 可能會使計算時間大幅增加, 要計算他的好友名單嗎?');
				if(!c){
					debug('Ignore ' + friendName[fid] + '(' + fid + ')');
					friendListStack.splice(i, 1);
					--i;
					continue;
				}
			}
			str += friendCount[fid] + '(' + fid + '), ';
		}
		debug(str);
		for(var i=0; i<friendThread; ++i){
			debug('Remain Friends\' Friends '+friendListStack.length);
			friendListStackTotal = friendListStack.length;
			if(friendListStack.length){
				++friendThreadRunning;
				getFriendList(friendListStack.pop(), myFriendFriendListOK);
			}else{
				break;
			}
		}
	}
}
function arrayIntersection(a, b){
	var ai=0, bi=0;
	var c = new Array();
 
	while(ai<a.length && bi<b.length){
    	if(a[ai]<b[bi])++ai;
	    else if(a[ai]>b[bi])++bi;
		else{// equal
			c.push(a[ai]);
			++ai;
			++bi;
		}
	}
	return c;
}
function getPlurks(){
	var btn = $('button#get_more_plurks');
	btn.attr('disabled', 'disabled');
	btn.text('載入中...');
	var date_string = dateOffset.getUTCFullYear() + '-' + (dateOffset.getUTCMonth()+1) + '-' + dateOffset.getUTCDate() + 'T'+
		dateOffset.getUTCHours() + ':' + dateOffset.getUTCMinutes() + ':' + dateOffset.getUTCSeconds();
	plurk({
		resource:'/APP/Timeline/getPlurks',
		method:'POST',
		data:{
			offset: date_string
		}
	},function(data){
		if(!data)return do_reload();
		var anonymous_id = 99999;
		$.each(data.plurk_users, function(i, v){
			if(v.nick_name == 'anonymous'){
				anonymous_id = v.id;
				debug('Found Anonymous: '+anonymous_id);
			}
		});
		var div = $('#plurks');
		for(var i=0; i<data.plurks.length; ++i){
			var entry = data.plurks[i];
			dateOffset = new Date(Date.parse(entry.posted)+2000);
			if(entry.user_id != anonymous_id)continue;
			var row = $('<div>').appendTo(div);
			var span = $('<span>').appendTo(row);
			span.attr('id', 'see_text_'+entry.plurk_id);
			span.text(entry.content);
			var btn = $('<button>').prependTo(row);
			btn.addClass('btn btn-primary gogo')
			btn_set();
			btn.text('看看是誰');
			btn.attr('id', 'see_'+entry.plurk_id);
			btn.click(goA_A);
		}
		var morebtn = $('button#get_more_plurks');
		morebtn.attr('disabled', false);
		morebtn.text('載入更多');
	});
}
function set_progress_total(percent){
	set_progress('#progress_total', percent);
}
function set_progress_part(percent){
	set_progress('#progress_part', percent);
}
function set_progress(s, percent){
	var div = $(s);
	if(percent <0){
		set_progress(s, 0);
		return div.hide('fast');
	}
	if(percent > 100)percent = 100;
	div.show('fast');
	var bar = div.find('.bar');
	bar.css('width', percent+'%');
}
function info(msg){
	var div = $('#info');
	if(msg.length){
		div.text(msg);
		div.show('fast');
	}else
		div.hide('fast');
}
function do_reload(){
	window.location.href = 'index2.php';
}

$(function(){
	info('正在取得好友名單與匿名噗');
	plurk({
		resource:'/APP/Users/currUser',
		method:'POST'
	},function(data){
		$('#name').text(data.display_name+'你好~');
		my_plurk_id = data.id;
		friendName[my_plurk_id] = data.display_name;
		friendLink[my_plurk_id] = data.nick_name;
		debug('Get My ID:'+my_plurk_id);
		info('');
		btn_on();
//		getFriendList(data.id, myFriendListOK);

	});
	btn_off();
	getPlurks();
	var morebtn = $('button#get_more_plurks');
	morebtn.click(getPlurks);
	$('#stop_trace').click(function(){
		friendListStack = new Array();
	});
	$('#version').text('偷偷說愉愉悅 Version ' + plurkA_A_Version);
});
function debug(msg){
	$('<div>').appendTo($('#debug')).text(msg);
}
function report(){
	$('#debug h3').text('回報錯誤');
	$('#debug').show('fast');
	$('body').animate({
		scrollTop: $('#debug').offset().top
	},'fast');
}