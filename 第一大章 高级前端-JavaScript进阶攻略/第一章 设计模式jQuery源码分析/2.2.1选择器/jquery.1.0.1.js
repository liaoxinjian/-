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