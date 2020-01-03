# 2.1.1jQuery整体架构，核心功能函数分析

## 为什么jQuery能够用$符进行操作 
```
  (function(root){
    var jQuery = function(){

    }
    root.$ = root.jQuery = jQuery;
  })(this)
```
### 这里为什么传入的是this，而不是window呢？
 1. 如果传入window的话，那么在node环境下去运行这一段代码他会报错，因为node环境下没有全局对象window
 2. 在window环境下指的是window，在node环境下应该具体的分为两种，如果没有进行var声明的变量，他是挂载到全局对象global身上，如果直接在全局里面打印this的话，那么获得的是一个{}
###

通过`root.$ = root.jQuery = jQuery`就可以用$符进行操作

## 怎么样让jQuery能够无new进行实例化
~~错误的代码展示~~
```
(function(root){
  var jQuery = function(){
    return new jQuery();
  }
  root.$ = root.jQuery = jQuery;
})(this)

```
***按照我们正常的想法，既然你想要进行实例化的话，那么我们可以用new运算符去运行jQuery这个构造函数，但是new运算符有一个功能是去运行这个构造函数里面的函数体，那么当他再一次运行到这里的时候，他就会再去执行一次这一段代码，这样的话就进入了一个死循环，所以这种方法是不可取的***
- 解决方法
  - jQuery想到了一种共享原型的方式，他将原型的init方法当做构造函数，并且将init的原型指向了jQuery本身的原型，这样达到了init方法和jQuery本身共享一个原型，这样不管在jQuery原型上面扩展多少方法，init所创建出来的实例都可以调用原型上的方法

_正确写法应该如下_
```
  (function(root){
    var jQuery = function(){
      return new jQuery.prototype.init();
    }
    jQuery.prototype = {
      init: function(){

      },
      css: function(){

      }
    }
    jQuery.prototype.init.prototype = jQuery.prototype;
    root.$ = root.jQuery = jQuery;
  })(this)
```
这样写的话才不会产生刚才上面所描述的死循环的情况，并且还可以进行实例化操作

## jQuery的extend方法的实现
```
  //在通常情况下 jQuery的extend方法有如下三种作用
  //1.任意对象扩展  浅拷贝
  $.extend({}, {name: "max", list: {age: "30"}, {list:{sex: "男"}}})  ==> //{name: "max", list: {sex: "男"}}
  //2.任意对象扩展 深拷贝
  $.extend(true, {}, {name: "max", list: {age: "30"}}, {list: {sex: "男"}}) ==> //{name: "max", list: {age: "30", sex: "男"}}
  //3.给jQuery本身或者实例身上添加方法
  $.extend({
    sport: function(){

    }
  })
  $.fn.extend({
    work: function(){

    }
  })
```
### $.fn是什么东西
`$.fn`就是jQuery的原型，也就是$.prototype的简写
```
(function(root){
  jQuery.fn = jQuery.prototype = {
    init: function(){

    }
  }
  jQuery.fn.init.prototype = jQuery.fn
  root.$ = root.jQuery = jQuery;
})(this)
```
他是通过把jQuery.prototype赋值给jQuery.fn
### 怎样实现一个浅拷贝
```
(function(root){
  var jQuery = function(){
    
  }
  jQuery.fn = jQuery.prototype = {
    init: function(){

    }
  }
  jQuery.fn.extend = jQuery.extend = function(){
    var target = arguments[0] || {};
    var length = arguments.length;
    var i = 1;
    var option, name;
    if (typeof target !== "object") {
      target = {};
    }
    // 如果他只传入一个参数的话，说明是要往自身或者原型身上添加方法
    if (length === i) {
      target = this;
      i--;
    }
    for (;i < length;i++) {
      //这里的arguments[i]表示的调用这个方法每一个被传入的参数 
      //在这里用option去存放他
      if ((option = arguments[i]) != null) {
        //遍历当前被遍历的这个参数的每一项
        for (name in option) {
          //只需要把被遍历的这个参数的每一项赋值给被插入的对象身上就行了 
          //这样就完成了浅拷贝
          target[name] = option[name];
        }
      }
    }
  }
  jQuery.fn.init.prototype = jQuery.fn;
  root.$ = root.jQuery = jQuery;
})(this)
```
- `var target = arguments[0] || {}` 在浅拷贝中第一个参数是要被插入的对象，如果第一个参数没值的话，我们默认给他一个{}，好让代码能够运行下去
- `var length = arguments.length` 来获取所传入的参数的个数，为接下来判断是往自己身上添加方法还是扩展对象的运行做准备
- `var i = 1` 这个个人认为非常棒，这条代码的作用可以和length一起配合判断他传入的参数是不是只有1个，还可以在接下来的for循环的时候跳过第一个被插入的参数，从第2个开始循环，因为第一个是被插入的对象，所以第一个是可以不用被循环的
- `if (typeof target !== "object") {target = {};}` 先判断被插入的对象究竟是不是一个对象，如果不是的话，那就给他赋值为{}
- `if (length === i) {target = this;i--;}` 如果他只传入一个参数的话，说明是要往自身或者原型身上添加方法
  - 因为我们不知道究竟是往jQuery自身还是原型身上添加方法，所以我们这里可以把this传给target，这里的this指的就是被调用的那个对象
  - `i--` 是因为我们只需要遍历一次，不然你不i--的话，你连遍历都进不去，也就不能进行浅拷贝了

### 在jQuery中他会传入一个true去让extend方法进行深拷贝
```
(function(root){
  var jQuery = function(){

  }
  jQuery.fn = jQuery.prototype = {
    init: function(){

    }
  }
  jQuery.fn.extend = jQuery.extend = function(){
    var target = arguments[0] || {};
    var length = arguments.length;
    var i = 1;
    var deep = false;
    var option, name, copy, src, clone;
    //如果第一个参数是布尔值的话
    if (typeof target === "boolean") {
      deep = target;
      //将被插入的对象调为第二个参数
      target = arguments[1];
      //并且让遍历对象从第3个开始遍历
      i = 2;
    }
    //注意这个判断必须放在判断被插入的对象是不是为boolean的后面，不然的话 当我们传入true的时候，他会把我们转成{}，那么就永远不会进行深拷贝了
    if (typeof target !== "object") {
      target = {};
    }
    if (length === i) {
      target = this;
      i--;
    }
    for (;i<length;i++) {
      if ((option = arguments[i]) != null) {
        for (name in option) {
          //这个是将要和被插入对象合并的值
          copy = option[name];
          //这个是被插入对象相同属性名称的值
          src = target[name]
          //如果是深拷贝的话 那么他还要去检测将要被插入对象的合并值是不是一个对象或者数组
          //如果不进行这一步检测的话，那么使用者随便传了一个1和字符串之类的 那我们这里就乱套了
          if (deep && (jQuery.isObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            //如果copy是数组的话 那么我们要被插入的对象的值也应该是数组格式
            //如果copy是对象的话 那么我们要被插入的对象的值也应该是对象格式的
            if (copyIsArray) {
              //这里要将copyIsArray重置一下 防止下次进入的时候再次按copy为数组的格式来进行
              copyIsArray = false;
              clone = src && jQuery.isArray(src)? src: []
            } else {
              clone = src && jQuery.isObject(src)? src: {}
            }
            //这里是进行一次浅拷贝
            //为什么说这个是浅拷贝呢?
            //这里我们拿 $.extend(true, {}, {list: {a: 1}})来说明  
            //当我们第一次进行遍历的时候 我们这个copy的值为{a:1}，src因为没有相对应属性名称的值所以为undefined
            //因为copy是一个对象的数据格式，所以这里我们的clone也应该是一个对象
            //那么我们在进行这一段代码的时候 他会再次执行这一整段代码 这时候target为{} copy是他要被插入的对象 然后遍历的时候 这里的copy是1，因为1既不符合数组也不是对象，所以将进行浅拷贝
            target[name] = jQuery.extend(deep, clone, copy);
          } else if (copy != null) {
            //如果copy不为null的话 那么就进行浅拷贝
            target[name] = copy
          }
        }
      }
    }
    return target;
  }
  //向自身身上去扩展几个工具函数
  jQuery.entend({
    isArray: function(obj){
      return toString.call(obj) === "[object Array]";
    },
    isObject: function(obj){
      return toString.call(obj) === "[object Object]";
    }
  })
  jQuery.fn.init.prototype = jQuery.fn;
  root.$ = root.jQuery = jQuery;
})(this)
```
- `var deep = false` 用于接下来判断是否进行深拷贝的判断值，默认为浅拷贝

## 完整的代码如下
```
(function(root){
  var jQuery = function(){
    return new jQuery.prototype.init();
  };
  jQuery.fn = jQuery.prototype = {
    init: function(){

    },
    css: function(){

    }
  }
  // jquery里面有一个方法extend
  // 这个方法可以让任意参数合并  并且还可以给jQuery本身或者实例身上扩展方法
  jQuery.fn.extend = jQuery.extend = function(){
    // 获取第一个参数代表将要被插入的对象
    // 如果第一个参数获取不到的话 那么给他一个空对象 好让代码接着往下运行
    var target = arguments[0] || {};
    // 获取参数的长度 有多少个
    var length = arguments.length;
    // 默认不循环第一个参数，因为第一个参数是要被插入的对象，循环的意义不大
    var i = 1;
    // 是否进行深拷贝 默认浅拷贝
    var deep = false;
    // 准备一些参数容器
    var option, name, copy, src, copyIsArray, clone;
    // 这个判断必须得放在判断是不是对象的上面 不然的话 第一个参数就会被转成object
    if (typeof target === "boolean") {
      deep = target;
      // 因为如果第一个参数为boolean的话 那么我们要被插入的对象应该是第二个传入的参数
      target = arguments[1];
      // 因此i也是从第3个开始遍历
      i = 2;
    }
    if (typeof target !== "object") {
      target = {};
    }
    
    if (length === i) {
      // 如果传入的参数只有1个的话 那么说明是要往自身或者实例身上去添加方法
      // 这里this指的是调用他的对象 如果是jQuery.extend的话 指的是jQuery
      // 如果是jQuery.fn.extend的话 指的是他的原型
      target = this;
      // 因此只要让遍历一次就够了 所以这里i 得--
      i--;
    }
    // 这是浅拷贝
    // for (;i<length;i++) {
    //   // 将传入的参数放到一个暂时的容器里面
    //   if ((option = arguments[i]) != null) {
    //     for (name in option) {
    //       target[name] = option[name]
    //     }
    //   }
    // }
    // 这是深拷贝和浅拷贝
    for (;i<length;i++) {
      if ((option = arguments[i]) != null) {
        for (name in option) {
          copy = option[name];
          // 这个src可能为undefined 但是没关系可能下一次就不是undefined 因为已经给他赋值过一次 并且存在了
          src = target[name];
          // 判断当前遍历的这个参数的这一项是数组还是对象
          if (deep && (jQuery.isObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            // 当前遍历的这个参数的这一项如果是数组的话 那么我们要去判断被赋值的相同名称的值是不是数组 如果不是数组的话 那么我们对这个相同名称的值重新赋值为数组
            if (copyIsArray) {
              // 这里必须得对copyIsArray重新赋值一下变为false 因为如果不重新赋值的话 那么他的下一次遍历的时候 可能copy并不是array可能是object，如果是object的话 但由于上一次的copyIsArray状态没有消掉 导致代码走到这一判断里面 让被赋值相同名称的值本来应该变成object的导致变成了array
              copyIsArray = false;
              clone = src && jQuery.isArray(src)? src: [];
            } else {
            // 当前遍历的这个参数的这一项如果是对象的话 那么我们要去判断被赋值的相同属性名称的值是不是对象 如果不是对象的话 那么我们要对这个相同属性名称的值重新赋值为对象
              clone = src && jQuery.isObject(src)? src: {};
            }
            // 如果不对当前遍历的这个参数的这一项进行判断的话 那么如果使用者随便传了一个不是object也不是array的话 那我们的程序就该乱套了
            console.log('查看一下',deep);
            // 这里是浅拷贝
            // 为什么说这里是浅拷贝呢  
            // 这里拿 jQuery.extend(true, {}, {name: "max", list: {a: 1}}, {list: {b: 2}})
            // 因为deep是true 这个没错 clone是由判断copy是不是对象和数组而来的 如果是copy是对象的话 那么在src为undefined的情况下clone是一个{}， 在src不为undefined的时候并且跟copy数据格式相同的时候 ，clone就是src本身
            // 调用jQuery.extend的时候 deep是true, clone是{}，copy是{a:1}
            // 那么在执行这个方法的时候 遍历的是copy option[name]的值是1， 1既不是数组也不是对象 所以他应该走的是下面的target[name]=copy这一浅拷贝部分
            target[name] = jQuery.extend(deep, clone, copy);
          } else if (copy != undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  }
  // 得往jQuery身上添加一些工具函数 这里用到的将会是浅拷贝 然后往jQuery身上去拷贝
  jQuery.extend({
    isArray: function(obj){
      return toString.call(obj) === '[object Array]';
    },
    isObject: function(obj){
      return toString.call(obj) === '[object Object]';
    }
  })

  // 共享原型
  // 将jQuery的原型和init方法的原型进行共享
  // 为什么要这么做？
  // 因为： 1.当我们调用$()的时候，会创建一个实例，我们都知道创建实例得通过new运算符，那么我们在jQuery中可以写成function(){return new jQuery()};这么写是不行的，因为new运算符的功能是运行这个函数，当这个函数运行的时候一碰到new jQuery()的时候，那么又回重新去执行这个函数，相当于是一个死循环。这种时候jquery想出了一种共享原型的方式，并且还可以在原型上面去拓展
  // 原版
  // jQuery.prototype.init.prototype = jQuery.prototype
  // 为什么会发生这种变化呢 因为当我们调用$.fn.extend()的时候往实例身上添加方法，这个fn指的其实就是原型
  // 现版
  jQuery.fn.init.prototype = jQuery.fn;
  root.$ = root.jQuery = jQuery;
})(this)
```