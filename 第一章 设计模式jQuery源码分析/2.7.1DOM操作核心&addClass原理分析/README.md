# 2.6.1DOM操作核心&addClass原理分析

## addClass的用法

`$(选择器).addClass("类名 类名 类名")` 这样会给这个dom元素的className上添加你所传入的几个类名

## 实现一个addClass
```js
(function(root){
  // ...
  jQuery.fn.extend({
    addClass: function(value){
      // 先获取总共有多少个dom元素要添加上这几个类名
      var len = this.length;
      // 先进性判断用户传过来的值是不是一个字符串 并且有没有值
      // 有值的话 把value值赋值给proceed  这属于短路运算
      // 没值或者不是字符串的话 把false赋值给proceed
      var proceed = typeof value === "string" && value;
      // 对用户传过来的字符串按照空格切割
      // str.match()方法 匹配成功的话 返回一个数组 匹配失败的话 返回一个null
      // \S是匹配非空白字符
      var classses = (value || "").match(/\S+/g) || [];
      // 当value有值的时候
      if (proceed) {
        for (var i = 0; i < len; i++) {
          // 先获取每一个元素
          var elem = this[i];
          // 当这个dom元素是一个元素的时候 并且有className这个属性的话
          // 那么把当前这个dom元素身上的类名全都保存在clazz身上
          var clazz = elem.nodeType && elem.className ? (" " + className + " ") : "";
          // 先定义一个变量 这个变量接下来用来保存要插入类名的当前类名
          var cur;
          if (clazz || clazz === "") {
            var j = 0;
            while(cur = classses[j++]){
              // 先判断一下之前这个类名里面有没有要添加的这个类名 如果没有的话 给他添加进去 如果有的话 就不添加
              if (clazz.indexOf(cur) < 0) {
                clazz += cur + " ";
              }
            }
            // 最后当while循环结束的时候 把这个类名赋值上去
            elem.className = clazz;
          }
        }
      }
    }
  })
  // ...
})(this)
```