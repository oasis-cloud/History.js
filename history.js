(function(global, history){
	if(global.hjs){
		//防止多次初始化
		return
	}
	var hjs = global.hjs = {
		//hjs的版本
		version : '1.0.0',
		//用于统一绑定变化事件
		bind : null
	}
	var dataList = new Array(),
		subscribeId = -1,
		doc = document,
		_title = doc.title,
		prewd = cwd = document.URL,
		noHashCwd = document.URL.replace(/[\#\!](.*)/g,''),
		uri = {}
		

	var bind = hjs.bind = function(evtName, callback){
		//模拟变化发生的触发逻辑
		setInterval(function(){
			if(!history.state) {//非现代浏览器使用
				hjs.fire(callback)
				return
			}
			//现代浏览器使用，当地址发生变化则认定触发生效
			cwd = document.URL
			if(cwd != prewd) {
				hjs.fire(callback)
				prewd = cwd
			}	
		},100)
	}
	//用于触发
	hjs.fire = function(callback){
		var dataListLen = dataList.length,
			i = dataListLen - 1,
			hash = (hash = document.URL.match(/[\#\!](.*)/g)) ? hash[0].replace(/[\#\!]/g, '') : ''
		//现代浏览器则直接触发
		if(history.state){
			callback(dataList[subscribeId])
			return
		}
		//非现代浏览器，需要先通过hash比对，通过则触发
		for(i; i >= 0; i--) {
			if(dataList[i].path == hash) {
				callback(dataList[i])
			}
		}
	}
	//包裹history.replaceState，达到向下兼容
	hjs.replaceState = function(data, title, path){
		if(data == undefined) data = {}
		if(!title) title = _title
		if(!path || typeof path != 'string') return

		changeTitle(title)

		subscribeId++
		dataList[subscribeId] = {
			'target':global,
			'data':data,
			'title':title,
			'path':path
		}
		if(typeof history.replaceState == 'function'){
			history.replaceState(data, title, path)
			return subscribeId
		} else {
			//处理不兼容情况
			setTimeout(function(){
				window.location.href = makeUrl(path)	
			},10)
		}
	}
	function makeUrl(path){
		return noHashCwd+'#!'+path
	}
	function changeTitle(title){
		doc.title = title
	}
})(window, history)
// console.log(hjs)
// function parseUrl(){
	// 	var fragElement = doc.createElement('a'),
	// 		uri = {}
	// 	fragElement.href = cwd
	// 	uri['protocol'] = fragElement.protocol.replace(':', '')
	// 	uri['hostname'] = fragElement.hostname
	// 	uri['port'] = fragElement.port
	// 	uri['search'] = fragElement.search
	// 	uri['path'] = fragElement.pathname
	// 	uri['hash'] = fragElement.hash
	// 	return uri
	// }

// hjs.bind('popstate',function(evt){
// 	alert(evt)
// })
// hjs.replaceState('test', "test title", "/2");
