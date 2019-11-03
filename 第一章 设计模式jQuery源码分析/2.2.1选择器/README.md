# jQuery的选择器

## jQuery的选择器都有那几种写法
- `$("<a>")` 将标签传进去，创建一个dom节点
- `$(".box")` 将字符串传进去，代表查询dom节点
- `$(document")` 将对象传进去
- `$(function(){})` 将一个回调函数传进去，等页面所有元素全部加载完毕的时候，才执行函数里面的代码块

## 怎样实现`$("<a>")`创建一个dom节点
```
(function(root){
  var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var jQuery = function(selector, context){
    return new jQuery.fn.init(selector, context);
  }
  jQuery.fn = jQuery.prototype = {
    length: 0,
    init: function(selector, context){
      var match;
      // 判断这个所传入的选择器是不是一个字符串
      if (typeof selector === "string") {
        // 判断这个选择器的第一个索引值所对应的字符串是不是<，最后一个索引值对应的是不是>，并且还要满足选择器的字符串长度要>=3，不然的话我传入一个<>，我也不知道这该创建什么dom节点呀
        if (selector.charAt(0) === "<" && selector.charAt(selector.length-1) === ">" && selector.length >= 3) {
          //macth是用来判断是创建dom节点还是查询dom节点
          //如果满足了上面这个条件，那么说明这是要创建dom节点的，如果没有满足的话，那么match里面是没有值的，说明我是要去查询dom节点
          match = [selector];
        }
        // 创建dom节点
        if (match) {
          // merge和parseHtml两个方法都是在jQuery通过extend方法拓展的，extend方法的讲解在前面2.1.1jQuery整体架构，核心功能函数解析里面。
          // merge是合并数组 也就是把第二个参数的每一项合并到第一个参数
          // 但是这里的this是一个对象 该怎么合并呢?
          // 在看merge方法的源码之前得先看parseHtml的源码
          jQuery.merge(this, jQuery.parseHtml(selector, context));
        }
      }
    }
  }
  jQuery.fn.extend = jQuery.extend = function(){
    // 这一段的完整代码在最下面
    //...
  }
  jQuery.extend({
    // first指 jquery的实例
    // seconed指 [context.createElement("a")]
    merge: function(first, second) {
      // 先进性存储一下各参数的长度
      var l = second.length,
          i = first.length,
          j = 0;
      // 判断一下l是不是number类型的数据类型
      if (typeof l === "number") {
        for (;j < l; j++) {
          // 然后将数组里面的每一项赋值给第一个里面的每一项
          first[i++] = second[j];
        }
      } else {
        whild (second[j] != undefined) {
          first[i++] = second[j++];
        }
      }
    },
    parseHtml(data, context) {
      // 在执行下面的代码之前，先对参数进行一次判断
      if (!data || typeof data !== "string") {
        return null;
      }
      //parse =>   ["<a>", "a"] 我们这里只要第1项"a"
      var parse = rejectExp.exec(data);
      // 在context的范围内创建出一个dom节点
      // 并且放在一个数组里面返回
      return [context.createElement(parse[1])];
    }
  })
  jQuery.fn.init.prototype = jQuery.fn;
  root.$ = root.jQuery = jQuery;
})(this)
```
- `length: 0` 这一个length的作用为了接下来便于操作，~~比如说接下来有个方法`Array.prototype.slice.call(obj)`可以将带有length的对象转换成为一个数组~~,因为jQuery为了让自己的对象跟接近与一个类数组，并且方便里面使用者的使用,可能便于接下来jQuery有个each方法便于循环使用(仅个人理解)。
- `string.charAt()`传入一个索引值，返回索引值所对应的那个字符串
- `var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;`这个正则的解释
  - `< >` 表示标签的<>两个尖括号
  - `(\w+)` 其中`()`表示先进行匹配，`\w`表示[a-zA-Z0-9],`+`表示1次或多次
  - `\s` 表示空白符
  - `*` 表示出现0次或多次，所以 `\s*` 表示空白符可以出现0次或多次
  - `\/` 表示转义/
  - `?` 表示可选可不选
  - `(?:<\/\1>|)` 这里用括号扩起来表示一个整体
  - `?:` 如果出现在()里面的最前面的话，代表接下来的内容是个非提取组，不进行存储，也就是说不会产生一个子表达式
  - `\1` 表示第一个匹配到的内容，在这里表示(\w+)，因为执行顺序是从左至右，\w+又用括号扩起来，所以他是第一个进行匹配的
  - `|` 表示逻辑或，表示这个内容要么有，要么没有
- `rejectExp.exec(data);`中的exec方法如果匹配到内容的话返回一个数组，如果匹配不到内容的话返回一个null。数组的第0项表示正则匹配到的内容，数组的第1项表示第一个子表达式匹配到的内容文本，数组的第2项表示第二个子表达式匹配到的内容文本

## 怎样查询dom节点
```
// ...... 以上代码省略
//创建dom节点
jQuery.fn = jQuery.prototype = {
  length: 0,
  init: function(selector, context){
    var match, elem, index = 0;
    if (match) {
    // 查询dom节点
    } else {
      // 这个查询到所有的dom节点
      elem = document.querySelectorAll(selector);
      // 因为通过querySelectorAll找到的数组是一个类数组，这里要把它转成真正的数组
      var elems = Array.prototype.slice.call(elem);
      // 将查询到的dom节点的length赋值给jQuery实例身上
      this.length = elems.length;
      for (;index< elems.length; index++) {
        // 跟merge方法一样，将所有的dom节点挂载到jquery的实例身上
        this[index] = elems[index];
      }
      // 并且将context和selector赋值给jquery实例身上
      // context(选择范围) selector(选择器))
      this.context = context;
      this.selector = selector;
    }
  }
}
// ...
```
- `Array.prototype.slice.call()`将带有length属性的对象转换成数组

## 怎么把对象传进去
```
// ...
jQuery.fn = jQuery.prototype = {
  index: 0,
  init: function(selector, context){
    if (typeof selector === "string") {

    } else if (selector.nodeType) {
      this.context = this[0] = selector;
      this.length = 1;
      return this
    }
  }
}
// ...
```
- 对象.nodeType会返回一个正整数，如果是字符串.nodeType的话会返回一个undefined

值|对应的内容
--|:--:|
1|代表元素
2|代表属性
3|代表元素或属性中的文本内容
4|代表文档中的CDATA部分（不会由解析器解析的文本）
5|代表实体引用
6|代表实体
7|代表处理指令
8|代表注释
9|代表整个文档
10|向为文档定义的实体提供接口
11|代表轻量级的Document对象 能够容纳文档的某个部分
12|代表DTD中声明的符号

## 完整代码如下
```
  (function(root){
  //这个正则表达的意思是
  //<  > 表达的也就是标签里面的<>两个符号
  //(\w+)表示先匹配这一字段 \w表示[a-zA-Z0-9] +表示1个或多个
  //\s表示空白符
  //*表示0个或多个 
  //那么这里的\s*也就是表示空白符可以0个或多个
  //(?:<\/\1>|)这里用括号扩起来代表的是一个整体
  //后面的|代表逻辑或，你可以匹配前面的<(\w+)\s*\/?>也可以匹配后面的部分
  //?:放在()里面的最前面使用的时候，代表接下来所匹配的结果是个非提取组，不进行存储
  // \/也就是转义成/
  // \1表示第一个匹配的内容 也就是(\w+),因为这里\w+用括号扩起来，并且执行顺序默认是从左到右，所以\w+是第一个匹配的
  // 然后正则.exec()方法返回的是一个数组，要是匹配不到内容的话，返回null，匹配到内容，那么数组的第0项是也就是匹配到的那个内容，数组的第1项是与第一个子表达式匹配到的内容的文本，数组的第2项是与第二个子表达式匹配到的内容的文本
  var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  var jQuery = function(selector, context){
    return new jQuery.fn.init(selector, context)
  }
  jQuery.fn = jQuery.prototype = {
    length: 0,
    init: function(selector, context){
      var match, elem, index = 0;
      //context是告诉我该从哪个范围去搜寻selector  也就是选择的范围
      //如果没传值是document（文档中查找），有传值的话那就是从传过来的方向去查找
      context = context || document;
      //当传入进来的选择器为空 或者undefined 或者null “”的时候 直接返回一个this；
      if (!selector) {
        //这里的this指的就是init创建出来的空实例
        return this;
      }
      if (typeof selector === "string") {
        if (selector.charAt(0) === "<" && selector.charAt(selector.length-1) === ">" && selector.length >= 3) {
          //这里的match其实就是把你传过来的字符串是要创建dom节点的保存起来，把这个保存着要创建dom节点的字符串的数组的地址引用给match
          //比如我传进去了 "<a>" 那么这个match的值就为 ["<a>"]
          match = [selector];
          console.log(match)
        }
        if (match) {
          //merge方法是合并数组的作用
          //但是这里的第一项是个对象
          //jQuery.parseHtml()的返回值是一个[]这个数组里面存储的是一个dom节点
          jQuery.merge(this, jQuery.parseHtml(selector, context));
        } else {
          // 找到所有的这个元素
          elem = document.querySelectorAll(selector);
          // 将拥有length属性的对象转化成数组
          var elems = Array.prototype.slice.call(elem);
          // 将数组的长度赋值给this
          this.length = elems.length;
          for (;index < elems.length; index++) {
            this[index] = elems[index]
          }
          this.context = context;
          this.selector = selector;
        }
      } else if (selector.nodeType) {
        //对象身上的nodeType有12种值 都是以整数类型的值
        //1 代表元素
        //2 代表属性
        //3 代表元素或属性中的文本内容
        //4 代表文档中的CDATA部分（不会由解析器解析的文本）
        //5 代表实体引用
        //6 代表实体
        //7 代表处理指令
        //8 代表注释
        //9 代表整个文档
        //10 向为文档定义的实体提供接口
        //11 代表轻量级的Document对象 能够容纳文档的某个部分
        //12 代表DTD中声明的符号

        //将this身上的context和第0项都附上selector选择器 也就是一个对象
        // 并且将它的长度变为1
        this.context = this[0] = selector;
        this.length = 1;
        return this;
      }
    },
    css: function(){

    }
  }
  jQuery.fn.extend = jQuery.extend = function(){
    var target = arguments[0] || {};
    var length = arguments.length;
    var i = 1;
    var deep = false;
    var option, name, copy, src, copyIsArray;
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[1];
      i = 2;
    }
    if (typeof target !== "object") {
      target = {}
    }
    if (i === length) {
      target = this;
      i = 0;
    }
    for (;i < length; i++) {
      if ((option = arguments[i]) != null) {
        for (name in option) {
          copy = option[name];
          src = option[name];
          if (deep && (jQuery.isObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && jQuery.isArray(src)? src: [];
            } else {
              clone = src && jQuery.isObject(src)? src: {};
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
    isArray: function(obj){
      return toString.call(obj) === "[object Array]";
    },
    isObject: function(obj){
      return toString.call(obj) === "[object Object]";
    },
    merge: function(first, second) {
      // 这里的first其实指的就是jQuery的实例
      // second就是[context.createElement("a")]
      var l = second.length,
          i = first.length,
          j = 0;
      if (typeof l === "number") {
        for (; j < l;j++) {
          // 把second中的dom节点挂载到jquery的实例身上
          first[i++] = second[j];
        }
      } else {
        while (second[j] != "undefined") {
          first[i++] = second[j++];
        }
      }
      // 并且给jQuery的实例赋值上长度
      first.length = i;
      return first;
    },
    parseHtml: function(data, context){
      //如果所传入的值为空或者不是字符串的话 那么直接返回一个null
      if (!data || typeof data !== "string") {
        return null;
      }
      //正则.exec方法返回的是一个数组，如果没值的话，返回是一个null， 如果有值那么返回的就是一个数组，数组的第0项是匹配到的内容，数组的第1项是第一个子表达式匹配到的内容文本，数组的第2项是第二个子表达式匹配到的内容文本
      // 我们这里比如说我们传入的是<a>，那么我们所要的是"a"
      var parse = rejectExp.exec(data);
      //所以这里我们最后返回出来的是[dom节点]
      return [context.createElement(parse[1])];
    }
  })
  jQuery.fn.init.prototype = jQuery.fn
  root.$ = root.jQuery = jQuery;
})(this)
```