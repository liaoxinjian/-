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