# 2.6.1DOM操作方法-html css text方法

## 先来了解一下css，text的使用

```js
$(".box").text() // 获取类名.box元素的文本值  返回文本值
$(".box").text("你好") //设置类名.box元素的文本值  返回jQuery的实例对象
$(".box").css("color", "red") //设置类名.box元素的文字颜色 返回jQuery的实例对象
$(".box").css("color") //获取类名.box元素的文字颜色  返回文字颜色
$(".box").css(["color","background"]) //获取类名.box元素的相关的css样式，以一个对象形式返回
$(".box").css({
  "color": "red",
  "font-size": "14px"
}) // 传入一个对象，使类名.box元素的样式进行相对应的改变
```

## jQuery的text,css,html实现思路都是通过参数进行辨别他是想要获取值，还是进行设置值的，并且这三个方法，在内部都是通过`jQuery.access`方法进行返回值的，这三个方法的返回值只需要关注jQuery.access方法的返回值就好。

## 怎样来实现一个text方法呢

```js
(function(root){
  //...
  jQuery.extend({
    access: function(elems, callback, key, value){
      // 当key所传入的值为null的时候，把这个获取到的boolean值存储在testing里面
      var testing = key === null;
      // 获取elems的长度，因为elems有可能是通过类名.box获取到的多个元素
      var len = elems.length;
      // cache是用来存储callback的
      // 用来增强功能
      // chain是用来开启链式调用的
      // 当chain为true的时候，开启链式调用也就是说明用户是要进行设置值，而不是获取值
      var cache, chain;
      if (value !== undefined) {
        // 如果value不等于undefined的话 说明用户肯定是要进行设置值 那么chain就可以改为true
        chain = true;
        if (testing) {
          // 当key为null 的时候，进行缓存所传过来的callback，并对callback进行加强功能
          cache = callback;
          callback = function(key, value){
            // 增强功能
            // 这里的this指的是接下来的所有call方法指向的this 其实也就是实例对象
            cache.call(this, value)
          }
        }
        for (var i = 0 ; i < len ; i++) {
          // 因为通过类名.box可以获取到多个元素，要对每一个元素进行一次上下文调用，并且将key和value值穿过去
          callback.call(elems[i], key, value);
        }
      }
      // 当chain为true的话 说明是设置 那么返回实例对象回去
      // 如果为false的话 说明是要获取值
      chain ? elems : callback.call(elems[0], value);
    },
    text: function(ele){
      var nodeType = ele.nodeType;
      // nodeType 1为元素
      // 9为document
      // 11 为document的局部元素
      if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        return ele.textContent;
      }
    },
    textContent: function(ele, value){
       var nodeType = ele.nodeType;
      // nodeType 1为元素
      // 9为document
      // 11 为document的局部元素
      if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        ele.textContent = value;
      }
    }
  })
  jQuery.fn.extend({
    text: function(value){
      return jQuery.access(this, function(value){
        // 当value为undefined的时候 说明用户是要获取值 不为undefined的时候说明是要设置值
        return value === undefined ? jQuery.text(this) : jQuery.textContent(this, value);
        // 这个null是key值  但text方法没有传入key值 所以这里为null
        // 怎么辨别一个key值呢
        // 比如说像css("color", "red") 这种传值里面，color就属于一个key值
      },null, value)
    }
  })
  //...
})(this)
```

## 怎么来实现一个css方法
```js 
(function(root){
  //...
  jQuery.extend({
    access: function(elems, callback, key, value){
      // 当key所传入的值为null的时候，把这个获取到的boolean值存储在testing里面
      var testing = key === null;
      // 获取elems的长度，因为elems有可能是通过类名.box获取到的多个元素
      var len = elems.length;
      // cache是用来存储callback的
      // 用来增强功能
      // chain是用来开启链式调用的
      // 当chain为true的时候，开启链式调用也就是说明用户是要进行设置值，而不是获取值
      var cache, chain;
      // 当传过来的key值为对象时 要在进行一次递归操作 将它变为字符串传进去
      if (jQuery.isObject(key)) {
        chain = true;
        for (var name in key) {
          jQuery.access(elems, callback, name, key[name]);
        }
      }
      if (value !== undefined) {
        // 如果value不等于undefined的话 说明用户肯定是要进行设置值 那么chain就可以改为true
        chain = true;
        if (testing) {
          // 当key为null 的时候，进行缓存所传过来的callback，并对callback进行加强功能
          cache = callback;
          callback = function(key, value){
            // 增强功能
            // 这里的this指的是接下来的所有call方法指向的this 其实也就是实例对象
            cache.call(this, value)
          }
        }
        for (var i = 0 ; i < len ; i++) {
          // 因为通过类名.box可以获取到多个元素，要对每一个元素进行一次上下文调用，并且将key和value值穿过去
          callback.call(elems[i], key, value);
        }
      }
      // 当chain为true的话 说明是设置 那么返回实例对象回去
      // 如果为false的话 说明是要获取值
      // 当用户传过来key值的时候 那么我们要对这个callback进行传入key值 
      // 但是我们还要进行兼顾text方法 所以我们可以在进行一次判断 
      // 如果testing为true 说明用户没有传入key值 那么就进行callback.call(elems[0], value)
      // 如果testing为false说明用户传入了key值 那么就进行callback.call(elems[0], key, value)
      chain ? elems : testing ? callback.call(elems[0], value) : callback.call(elems[0], key ,value);
    },
    style: function(elems, key, value){
      // 当用户传进来的elem不是一个元素 没有传进来 没有style这个属性的话 就给他return掉
      if (!elems || elems.nodeType === 3 || !elems.style ) {
        return;
      }
      elems.style[key] = value;
    }
  })
  jQuery.fn.extend({
    css: function(key, value){
      return jQuery.access(this, function(key, value){
        // CSSStyleDeclaration是用来存储这个元素的所有css属性的
        var CSSStyleDeclaration, len;
        // 这个用来存储key为数组时候相对应的css属性的值
        var map = {};
        // 如果key是一个数组的话 那么就把相对应的值返回出去
        if (jQuery.isArray(key)) {
          CSSStyleDeclaration = window.getComputedStyle(this);
          len = key.length;
          // 通过for循环将css所传入的值是一个数组的时候返回出来的css值保存在map对象里面 然后并且把这个map返回出去
          for (var i = 0; i < len; i++) {
            map[key[i]] = CSSStyleDeclaration.getPropertyValue(key[i]); 
          }
          return map;
        }
         // 当value有值的时候 直接设置值
        // 没有值的话 那么直接通过window.getComputedStyle方法 可以返回一个元素的相关的css属性的对象  然后在调用getPropertyValue()方法 去获取相对应的value值
        return value !== undefined ? jQuery.style(this, key, value) : window.getComputedStyle(this).getPropertyValue(key) || value
      }, key, value)
    }
  })
  //...
})(this)
```