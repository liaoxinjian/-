# 2.8.1动画队列/动画设计/动画实现

## 我们怎么往dom元素身上添加属性

1. 一般我们的做法如下
```js
  var box = document.querySelector(".box");
  box[sayhi] = function(){}
```
但是这样添加的自定义属性和过多的数据极容易造成内存泄漏，什么是内存泄漏呢？（套用老师的回答）
维基百科中说一块内存被长期持有，得不到释放。不必要的内存损耗都是内存泄漏。
这里为什么说会内存泄漏呢？因为我们的dom元素会常驻于内存当中，这个元素只要浏览器还开着就一直渲染在页面上，不会被垃圾回收机制收回，除非你把页面关掉，他才会被释放，加上你把一些数据和属性添加到这个dom元素身上，他所占的内存会越来越大，会严重影响到内存的消耗。

2. 所以为了性能考虑我们应该采取一种，在内存中开辟一个缓存空间，这个缓存空间可以存放dom元素的一些数据和属性，但是我们要拿到dom元素身上的一个唯一凭证去拿到缓存空间中相对应的缓存空间，这个凭证就相当于是一个钥匙，这个钥匙就在每一个已有缓存空间dom元素身上，当然如果一个dom元素身上没有缓存空间的话，缓存空间会去创建一个空间给你存储数据和属性。

## 实现一个入列和出列的行为
```js
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
    },
    set: function(elem, key, value){
      var prop;
      // 拿到这个dom元素身上的uuid 唯一凭证
      var unlock = this.key(elem);
      // 获取这个uuid所对应的数据仓库
      var cache = this.cache[unlock];
      if (typeof key === "string") {
        // 给这个type所对应的数据缓存空间附上所对应的数据
        cache[key] = value;
      }
      // 这个还不知道什么时候我们所传过来的是一个对象 先放着放一放
      if (jQuery.isObject(key)) {
        for (prop in key) {
          cache[prop] = key[prop];
        }
      }
    },
    access: function(elem, key, value){
      // 调用这个方法 这个方法其实就是给这个dom元素对应的type中缓存数据的
      this.set(elem, key, value);
      // 当value没有传过来的时候，直接返回一个key
      // 传过来的时候 直接返回这个value
      // 如果传过来 那么这个value必定是一个数组[function(){}]
      return value !== undefined ? value : key;
    },
    remove: function(elem, key){
      var unlock = this.key(elem);
      var cache = this.cache[unlock];
      var i = key.length;
      while(i--) {
        delete cache[key[i]];
      }
    }
  }
  // 创建一个内部私有的数据
  var data_priv = new Data();
  jQuery.extend({
    // 这个elem对应的是dom元素
    // 这个type就是用户传过来的这个队列的名称
    // 这个data就是要进入队列的函数
    queue: function(elem, type, data) {
      var queue;
      // 当dom元素存在的时候进入这里面
      if (elem) {
        // 给用户所传过来的队列加个queue 最后变为firstqueue这种队列名称
        type = (type || "fx") + "queue";
        // 去缓存空间里面去查找这个dom元素相对应的空间里面有没有这个队列名称相关的数据 如果有的话 直接拿出来 没有的话 创建一个
        // 一开始刚创建的时候这个dom元素中缓存空间中对应的type是一个undefined，因为刚创建出来的是一个空对象{} 身上没有相对应的type(队列名称)
        // 然后当第二次进入这个queue方法的时候， queue是一个数组 并且data也不是一个数组 所以会执行下面的else  把函数传进queue里面去
        queue = data_priv.get(elem, type);
        if (data){
          if (!queue || jQuery.isArray(data)) {
            // jQuery.makeArray()是为了将我们所传过来的函数变成一个数组类型的
            // data_priv.access 的作用就是给这个dom元素身上的type的缓存空间缓存相对应的value 并且把这个value返回出来
            queue = data_priv.access(elem, type, jQuery.makeArray(data));
          } else {
            // 这是第二次往相同的队列里面添加数据的时候
            queue.push(data);
          }
        }
      }
      // 整体的架构就是当dom元素不存在的时候，直接返回一个空的数组
      // 当dom元素存在的时候返回一个queue
      return queue || [];
    },
    // hooks是用于清理的工作 他是为了动画队列来做的 我们这里还用不太到
    dequeue: function(elem, type){
      type = type || "fx";

			var queue = jQuery.queue(elem, type), //"firstqueue"相对应的缓存空间
				startLength = queue.length,
				fn = queue.shift(), // func   [function wait(){}]
				hooks = jQuery._queueHooks(elem, type), //钩子
				next = function() { //作用
					jQuery.dequeue(elem, type);
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if (fn === "inprogress") {
				fn = queue.shift();
				startLength--;
			}

			if (fn) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if (type === "fx") {
					queue.unshift("inprogress");
				}

				// clear up the last queue stop function
				fn.call(elem, next, hooks); // func
			}

			//清除工作
			if (!startLength && hooks) {
				hooks.empty.fire();
			}
    },
    _queueHooks: function(elem, type) {
			var key = type + "queueHooks"; //key == firstqueueHooks
			return data_priv.get(elem, key) || data_priv.access(elem, key, {
				empty: jQuery.callbacks("once memory").add(function() {
					data_priv.remove(elem, [type + "queue", key]); //["firstqueue","firstqueueHooks"]
				})
			});
		}
  })
```
