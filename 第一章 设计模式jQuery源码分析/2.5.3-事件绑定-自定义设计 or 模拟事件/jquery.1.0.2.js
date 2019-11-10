(function(root){
  var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var optionsCache = [];
  var ver_sion = "1.0.2";
  function returnFalse(){
    return false;
  }
  var jQuery = function(selector, context){
    return jQuery.fn.init(selector, context)
  }
  jQuery.fn = jQuery.prototype = {
    length: 0,
    init: function(selector, context){
      context = context || document;
			var match, elem, index = 0;
			//$()  $(undefined)  $(null) $(false)  
			if (!selector) {
				return this;
			}

			if (typeof selector === "string") {
				if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
					match = [selector]
				}
				//创建DOM
				if (match) {
					//this  
					jQuery.merge(this, jQuery.parseHTML(selector, context));
					//查询DOM节点
				} else {
					elem = document.querySelectorAll(selector);
					var elems = Array.prototype.slice.call(elem);
					this.length = elems.length;
					for (; index < elems.length; index++) {
						this[index] = elems[index];
					}
					this.context = context;
					this.selector = selector;
				}
			} else if (selector.nodeType) {
				this.context = this[0] = selector;
				this.length = 1;
			}
      return this;

    }
  }
  jQuery.fn.extend = jQuery.extend = function(){
    var target = arguments[0] || {};
    var i = 1;
    var length = arguments.length;
    var deep = false;
    var option, name, copy, src, clone, copyIsArray;
    if (typeof target === "boolean") {
      deep = target;
      i = 2;
      target = arguments[1];
    }
    if (typeof target !== "object") {
      target = {};
    }
    if (i === length) {
      target = this;
      i = 0;
    }
    for (;i < length; i++) {
      if ((option = arguments[i]) != null) {
        for (name in option) {
          copy = option[name];
          src = target[name];
          if (deep && (jQuery.isObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && jQuery.isArray(src) ? src: [];
            } else {
              clone = src && jQuery.isObject(src) ? src: {};
            }
            target[name] = jQuery.extend(deep, clone, copy);
          } else if (copy != null) {
            target[name] = copy;
          }
        }
      }
    }
  }
  jQuery.extend({
    expando: "jQuery" + (ver_sion + Math.random()).replace(/\D/g, ""),
    guid: 1,
    // 获得的将是一个时间戳 这个时间戳是从1970年1月1日 00:00:00 UTC到现在的毫秒
    now: Date.now,
    isArray: function(obj){
      return toString.call(obj) === "[object Array]";
    },
    isObject: function(obj){
      return toString.call(obj) === "[object Object]";
    },
    makeArray: function(arr, results){
      var ret = results || [];
			if (arr != null) {
				jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
			}
			return ret;
    },
    parseHtml: function(selector, context){
      if (!selector || typeof selector !== "string") {
        return null;
      }
      var parse = rejectExp.exec(selector);
      return [context.createElement(parse[1])];
    },
    merge: function(first, second){
      // 先获取第一个参数和第二个参数的长度
      var l = second.length,
          j = first.length,
          i = 0;
      // 然后判断一下被合并的参数的长度是不是为数字类型
      if (typeof l === "number") {
        // 如果是的话 进行循环 将第二个参数的值copy到第一个参数上面
        for (;i<l;i++) {
          first[j++] = second[i];
        }
      } else {
        while(second[i] != null) {
          first[j++] = second[i++];
        }
      }
      // 再把新的长度赋值给第一个参数
      first.length = j;
      return first;
    },
    callbacks: function(options){
      options = typeof options === "string" ? (optionsCache[options] || jQuery.createOptions(options)) : {};
      var list = [];
      var index, length, testting, memory,starts, start;
      var fire = function(data){
        memory = options.memory && data;
        testting = true;
        index = starts || 0;
        length = list.length;
        starts = 0;
        for (;index < length; index++) {
          if (list[index].apply(data[0], data[1]) === false && options.stopOnFalse) {
            break;
          }
        }
      }
      var self = {
        add: function(){
          var args = Array.prototype.slice.call(arguments);
          start = list.length;
          args.forEach(function(fn){
            if (toString.call(fn) === "[object Function]") {
              list.push(fn);
            }
          })
          if (memory) {
            starts = start;
            fire(memory)
          }
          return this;
        },
        fireWith: function(context, arguments){
          if (!options.once || !testting) {
            fire(context, arguments);
          }
        },
        fire: function(){
          self.fireWith(this, arguments);
        }
      }
      return self;
    },
    createOptions: function(options){
      var object = optionsCache[options] = {};
      options.split(/\s+/).forEach(function(value){
        object[value] = true;
      })
      return object;
    },
    // 异步回调解决方案
    Deferred: function(func){
      // tuples用来存储延迟对象三种不同的状态信息
      // 每一种状态的第0项指 延迟对象的状态
      // 第1项指 往队列中添加处理函数的方法
      // 第2项指 创建一个队列，获取到callbacks返回的self
      // 第3项指 最终状态的信息描述
      var tuples = [
        ["resolve", "done", jQuery.callbacks("once memory"), "resolved"],
        ["reject", "fail", jQuery.callbacks("once memory"), "rejected"],
        ["notify", "progress", jQuery.callbacks("memory")]
      ],
      // 设定一个初始值 pedding
      state = "pedding",
      // 创建一个promise对象
      promise = {
        state: function(){
          return state;
        },
        then: function(){

        },
        promise: function(obj) {
          return obj !=null ? jQuery.extend(obj, promise) : promise
        }
      },
      // 创建一个deferred对象 接下来得注重关注他身上有哪些属性 方法
      deferred = {};
      tuples.forEach(function(tuple, i){
        // 创建队列，其实就是把callbacks身上的self方法挂载到list上面
        var list = tuple[2],
        // 将最终状态值保存下来
        stateString = tuple[3];
        // promise[done|fail|progress]
        // 将注册事件处理函数的方法挂载到promise身上
        promise[tuple[1]] = list.add;
        // 如果有值的话 那么修改一下deferred的初始状态 让他变为resolved或者rejected 把这个事件放在队列里面
        // 为什么要改变值呢
        // 因为只有等resolve，reject的时候可以修改状态 其他时间一律不能修改状态，状态一经修改就不能改变
        if (stateString) {
          list.add(function(){
            state = stateString;
          })
        }
        deferred[tuple[0]] = function(){
          // 只要一调用deferred[resolve|reject]的时候 就会调用list.fireWith()
          // 为什么this=== deferred的时候要把promise传过去呢 因为promise身上具有6个属性方法
          // 1. promise.state()
          // 2. promise.then()
          // 3. promise.promise()
          // 4. promise.done()
          // 5. promise.fail()
          // 6 promise.progress()
          // 后面的三个方法都是我们注册事件用的
          deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
        }
        // tuple[0]的值只有3个 分别是 resolve reject notify
        // 所以deferre[resolveWith] deferre[rejectWith] deferre[notifyWith]
        deferred[tuple[0] + "With"] = list.fireWith;
      })
      // 将promise身上的方法全都挂载到deferred身上
      // 那么最后deferred身上有了 done, fail, progress, resolve, reject, state , then ,promise这些方法
      promise.promise(deferred);
      return deferred;
    },
    when: function(deferredObj){
      //when方法接受的肯定是一个deferred对象 这个对象身上有promise方法
      // 当我们所传的参数为null的时候 他直接返回一个promise对象 这个promise身上有done,  fail， progress方法
      // 因此才能像demo中通过$.when(wait()).done(function(){})
      return deferredObj.promise();
    },
    each: function(object, callback, args){ 
      // 这里的object值的是目标源 也就是要将事件绑定上去的对象
      // callback指的就是 on方法里面return 出去的 function(){jQuery.event.add(this,types,fn)}
      // args是用来自定义事件的 这一节先不讨论这个
      // object可能是一个数组 也可能是一个对象
      // 照道理来说对象是没有length属性的 但是我们的jQuery实例对象身上我们给他添加了length属性 所以他是有值的 不是undefined
      var length = object.length;
      var name, i = 0;
      // 自定义callback参数
      if (args) {
        if (length === undefined) {
          for (name in object) {
            callback.apply(object, args);
          }
        } else {
          for (;i<length;) {
            callback.apply(object[i++], args);
          }
        }
      } else {
        if (length === undefined) {
          for (name in object) {
            callback.apply(object, name, object[name]);
          }
        } else {
          // 因为我们现在并没有把args参数传过来 并且length是有值的 所以走这一块
          // callback指的是 function(){jQuery.event.add(this, types, fn)}
          // 这里他将this指向了object[i]
          // 这个object[i] 其实指的就是一个dom对象
          for (;i<length;) {
            callback.call(object[i], i, object[i++]);
          }
        }
      }
    }
  })
  // 往实例身上添加方法 因为每次jQuery注册事件全都是在实例身上注册的
  jQuery.fn.extend({
    // 当给同一元素注册多个事件的时候，types是一个对象，fn则为null 例如
    /**
      $(".box").on({
        "mouseover": function(){

        },
        "click": function(){

        }
      }) 
     */
    // 当给多个事件绑定同一个函数的时候 types是一个字符串 fn则是事件函数 例如
    /**
       $('.box').on("mouseover click", function(){})
     */
    // 如果是自定义事件的话 那么types是一个事件名，fn是一个事件函数
    on: function(types, fn){
      // 先定义一个变量 提前申明可以减少内存消耗
      var type;
      // 如果传过来的types是一个对象的话 说明他是给同一元素注册多个事件的情况
      // 因此要把types中的属性名(方法名)和所对应的方法注册上去
      if (toString.call(types) === "[object Object]") {
        for (type in types) {
          this.on(type, fn);
        }
      } 
      return this.each(function(){
        jQuery.event.add(this, types, fn);
      })
    },
    each: function(callbacks, args){
      jQuery.each(this, callbacks, args);
    },
    // type这里指的就是用户自定义的事件名 当然这个也可以是系统里面有的事件名
    // 比如 click focus mouseover之类的
    // data指的是用户传过来的参数
    trigger: function(type, data){
      // 调用实例身上的each方法
      // 也就是上面这个each方法
      // each里面的callbacks指的就是function(){jQuery.event.trigger(type,data,this)}这个函数 args这里也没有传 所以不用管
      // 这里的type指的就是用户传过来的事件名
      // data指的就是用户所传过来的参数
      // this就是jQuery.each方法里面将this指向了当前这个dom对象
      // 这时候他就会调用jQuery身上的each方法 其实也就是将function(){jQuery.event.trigger(type,data,this)}这个函数里面的this指向了elem（dom元素）
      // 接下来我们去看一下jQuery.event身上的这个trigger方法
      return this.each(function(){
        jQuery.event.trigger(type, data, this)
      })
    }
  })

  function Data(){
    // 这个是jQuery每次运行加载期间时唯一的随机数
    // 也是存储在dom对象身上拿取存储事件仓库的凭证的钥匙
    this.expando = jQuery.expando + Math.random();
    this.cache = {};
  }
  Data.uid = 1;
  Data.prototype = {
    key: function(elem){
      // 定义一个空对象 这个空对象是接下来用于将jQUery的唯一随机数和凭证存储在dom对象身上
      var descriptor = {},
      // unlock就是拿到数据仓库的凭证
          unlock = elem[this.expando];
      // 如果没有unlock的话 那么就给unlock赋值 
      if (!unlock) {
        unlock = Data.uid++;
        // 这一步是为了配合Object.defineProperties使用的
        descriptor[this.expando] = {
          value: unlock
        }        
        Object.defineProperties(elem, descriptor);      // 得到的结果是  elem[jQuery23123123.23123]: 1  这种值 1是拿取事件函数仓库的凭证 前面那个Jquery的随机数就是查看这个dom对象身上有没有这个凭证的钥匙
      }
      // 确保缓存对象记录信息
      // 如果缓存对象上没有这个凭证相关的值的话
      // 那么就给他创建出来 并且赋值为{} 这个空对象里面保存着数据信息
      if (!this.cache[unlock]) {
        this.cache[unlock] = {};   
      }
      // 最后返回这个unlock
      return unlock;
    },
    get: function(elem, key){
      // 获取这个缓存里面所有有关这个dom元素身上的数据
      var cache = this.cache[this.key(elem)];
      // 有key的话 直接找到缓存中的数据
      return key === undefined? cache: cache[key];
    }
  }
  var data_priv = new Data();
  jQuery.event = {
    // add方法的作用
    // 1.是利用data_priv数据缓存，分离事件与数据
    // 2.元素与缓存中建立guid的映射关系用于查找
    add: function(elem, type, handler){
      var eventHandle, events, handlers;
      // 获取事件缓存对象
      var elemData = data_priv.get(elem)
      // 所有的事件查找删除都是根据这个guid进行查找和删除的
      if (!handler.guid) {
        handler.guid = jQuery.guid++;
      }
      // 给事件缓存添加处理具柄
      // elemtData = {events: , handler: }
      // 同一个元素 不同事件 不能重复绑定
      if (!(events = elemData.events)) {
        events = elemData.events = {};
      }
      if (!(eventHandle = elemData.handle)) {
        eventHandle = elemData.handle = function(e){

          return jQuery.event.dispatch.apply(eventHandle.elem, arguments);
        }
      }
      // 将绑定的dom元素绑定到eventHandle这个
      // 这个eventHandle指的就是function(e){return jQuery.event.dispatch.apply(this, arguments);} 这一个函数 
      eventHandle.elem = elem;
      // 这个events的值是这样的 {click: [{type:"click", guid: 1, handler: f}, delegateCount:0]}
      // 所以也就是把后面[{type:"click", guid: 1, handler: f}, delegateCount:0]这一段赋值给了handlers
      // 这里的type指的是用户想要注册的事件名
      // 这个events是刚才上面通过elemData.events创建出来的 也就是从缓存对象中拿取的events
      if (!(handlers = events[type])) {
        // 如果events身上没有这个事件的话 那么就给他一个空数组
        handlers = events[type] = [];
        // 有多少事件代理默认为0个
        handlers.deledateCount = 0;
      }
      handlers.push({
        // 这里的type指的是用户想要注册的事件名
        type: type,
        // 这个handler是传过来的参数handler 也就是用户想要执行的事件处理函数
        handler: handler,
        guid: handler.guid
      })
      if (elem.addEventListener) {
        // 这行上面eventHandle的函数 也就是下面的这一函数
        /**
         * function(e){
         *  return jQuery.event.dispatch.apply(eventHandle.elem, arguments)
         * }
         */
        // 这行上面这一段函数 他是要去执行dispatch dispatch里面的this指向的全都是这个注册的dom对象
        elem.addEventListener(type, eventHandle, false);
      }
    },
    // dispatch的作用 
    // 修建事件对象event(其实就是解决兼容性的问题) 从缓存中的events对象获取得到对应队列
    dispatch: function(event){
      // IE兼容性处理如 event.target 或者event.srcElement
      // event = jQuery.event.fix(event)

      // 提取当前元素在cache中的events属性 click
      // 这个event.type也就是用户要做的事件名
      // 这个handlers的值是这样的 [{type: "click", guid: 1, handler:f }, delegateCount: 0]
      // 这个是从刚才缓存对象中拿到的
      var handlers = (data_priv.get(this, "events") || {})[event.type] || [];
      // 这个this指的就是dom元素
      event.delegateTarget = this;

      var args = Array.prototype.slice.call(arguments);
      // 这个this指的是dom元素
      // event也就是事件处理对象
      // handlers指的就是刚才的这一段[{type: "click", guid: 1, handler:f }, delegateCount: 0]
      jQuery.event.handlers.call(this, handlers, args)
    },
    // 执行事件处理函数
    handlers: function(handlers, args){
      // 执行在缓存对象中的事件函数 将this指向这个dom对象
      handlers[0].handler.apply(this, args);
    },
    // 兼容事件处理
    fix: function(){

    },
    // trigger接受三个参数
    // event指的就是可以是自定义的事件名 也可以是系统内部就有的事件名
    // data指的是用户传过来的参数
    // elem也就是刚才上一步jQuery.event.trigger(type, data, this)中的this指向的也就是这个dom元素
    trigger: function(event, data, elem){
      var i, cur, tmp, bubbleType, onType, handle,
          i = 0, //这个暂时还不知道是什么东西 // 这个是最后让他从冒泡路线的最底部开始执行的
          // 因为在事件2.0级里面有三个步骤 事件捕获 处在目标阶段 冒泡阶段
          // 当我们点击一个元素的时候 触发该元素身上的事件
          // 然后经过事件冒泡以后，如果他的祖辈元素身上也有相同的事件名的话 那么也给他触发
          eventPath = [elem || document], //规定冒泡的路线
          // 将这个事件名存储到一个type变量里面
          // 如果这个event传过来是一个对象的话 那么将他身上的type相对应的值赋值过去
          // 但一般我们所传过来的都会是一个字符串
          type = event.type || event,
          // 获取当前的这个元素 
          // 如果没有传过来dom元素的话 那么默认为document 并且赋值给cur tmp elem
          cur = tmp = elem = elem || document,
          // 先看看用户传过来的自定义事件名是不是一个全是英文字母的事件名
          // 并且给他绑定上on事件名
          // 因为在原生里面所有的事件注册前面全都要加上on
          onType = /^\w+$/.test(type) && "on" + type;

      // 模拟事件对象 如果event身上有jQuery的唯一随机数的话 就说明event已经是一个模拟的事件对象了
      event = event[jQuery.expando]? event: new jQuery.Event(type, typeof event === "object" && event)
      // 最终这个event的值会是这么一个情况{delegateTarget: div#box,jQuery10107790883079992781: true,target: div#box,timeStamp: 1573366196613,type: "createEvent"}
      // 如果event身上没有target的值的话
      if (!event.target) {
        // 那么将当前这个dom对象赋值给event.target
        event.target = elem;
      }
      // 如果没有传过来data的话 那么就将event放进数组里面赋值过去 如果不为空的话 那么将data和event进行合并成为一个数组 
      // 因为每个事件处理函数的第一个参数都是event 第二个开始才是我们穿过去的参数
      // 所以这里要把event放在最前面 这个也是上面 “因为每个事件处理函数的第一个参数都是event 第二个开始才是我们穿过去的参数”这个的依据
      data = data == null ? [event] : jQuery.makeArray(data, [event]);
      console.log(data)
      // 事件类型是否需要特殊化处理 比如说如果我们用的事件名是一个系统默认的事件名的话 
      // 我们要对这个事件名进行处理 并且还要给他进行系统的默认行为
      // 如果不是一个系统默认的事件名的话 那么返回一个空对象给他
      special = jQuery.event.special[type] || {};
      // 如果事件类型已经有trigger方法 那么就调用他
      // 并且给他return掉
      // 这里的elem就是dom元素 将这个特殊类型的trigger方法里面的this指向了apply方法
      // 这里的data是一个数组 也就是上面这一段赋予的 data = data == null ? [event] : jQuery.makeArray(data, [event]);
      if (special.trigger && special.trigger.apply(elem, data) === fasle) {
        return;
      }
      //当前这个元素已经在冒泡路线中了 就不再重复添加
      cur = cur.parentNode;
      // 查找当前元素的所有父元素 并且将他们添加到冒泡路线上面
      for (;cur;cur = cur.parentNode) {
        eventPath.push(cur);
        tmp = cur;
      }
      // 当tmp为document的时候 cur为空 就退出了冒泡路线 （循环？不懂）
      if (tmp === (elem.ownerDocument || document)) {
        // 模拟冒泡到window上
        eventPath.push(tmp.defaultView || tmp.parentWindow || window);
      }
      while((cur = eventPath[i++])){
        // 看一下当前这个元素在缓存对象中有没有这个方法 如果有的话取出来 去调用
        handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
        if (handle) {
          handle.apply(cur, data)
        }
      }
    },
    special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// 执行默认focus方法
				trigger: function() {
					if (this !== safeActiveElement() && this.focus) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if (this === safeActiveElement() && this.blur) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function(event) {
					return jQuery.nodeName(event.target, "a");
				}
			},

			beforeunload: {
				postDispatch: function(event) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if (event.result !== undefined) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},
  }
  jQuery.Event = function(src, props){
    // 先进性判断一下当前的这个this是不是继承自jQuery.Event身上 
    // 如果不是的话 那么创建一个实例对象 并且返回出去
    // 如果创建一个实例对象的话 那么他又会走这个构造函数
    // 这时候this肯定是继承自这个构造函数的
    // 所以就不会再进入这个if判断里面了
    if (!(this instanceof jQuery.Event)) {
      return new jQuery.Event(src, props);
    }
    // 向这个构造函数的实例身上挂载type属性 并且这个type属性指的是用户所传来的事件名 click之类的
    this.type = src;
    // 如果传入的事件名里面没有时间戳的话 那么创建一个时间戳赋值给当前这个event对象身上的timeStamp身上
    this.timeStamp = src && src.timeStamp || jQuery.now();
    // jQuery.Event的实例对象身上标记一个true
    this[jQuery.expando] = true;
  }
  jQuery.Event.prototype = {
    isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		//取消事件的默认动作
		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if (e && e.preventDefault) {
				e.preventDefault();
			}
		},
		// 方法阻止事件冒泡到父元素,阻止任何父事件处理程序被执行。
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if (e && e.stopPropagation) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		}
  }
  root.$ = root.jQuery = jQuery;
})(this)