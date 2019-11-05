# 2.3.1 callbacks入门&源码解析

## callbacks的定义
- 文档定义: 指一个多用途的回调函数列表对象，提供了一种强大的方法来管理回调函数列队
- 本人理解：将回调函数放到一个队列里面，让他们依次执行

## callbacks的参数
- once 不管你执行多少次fire，只执行依次
- stopOnFalse 当碰到函数返回一个false的时候，那么接下来的函数都不会去执行
- memory 当你执行过fire以后他接下来add添加函数的时候，也会执行这个添加的函数
- ...

## callbacks的基本用法
```
var cb = $.callbacks();
cb.add(function(){
  console.log(1) 
}, function(){
  console.log(2)
})
cb.fire()  // 1 2
```

## 怎样实现一个callbacks？
```js
(function(root){
  var optionsCache = {};
  var _ = {
    callbacks: function(options){
      // 先进性判断一下所传入的参数是不是一个字符串，如果不是的话，返回一个{}
      // 为什么返回一个{}，因为接下来的很多操作都会用到{}.xxx来进行操作
      // 如果是的话，先去查看一下options的缓存里面有没有这个options 如果缓存里面没有的话 去创建一个options
      // options最终的值应该会是 {"once": true}这种类型的
      options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {};
      var list = [];
      var index, testting, memory, start, starts;
      var fire = function(data){
        // 当用户传入的是memory的时候 这时候把data赋值给memory
        memory = options.memory && data;
        testting = true;
        index = starts || 0;
        starts = 0;
        length = list.length;
        for (;index < length;index++) {
          // 当用户传入的参数是stopOnFalse的时候，并且当函数的返回值为false的时候，直接给他break，不进行接下来的运行
          if (list.apply(data[0], data[1]) === false && options.stopOnFalse) {
            break;
          }
        }
      }
      var self = {
        // 注册处理函数的
        add: function(){
          // 先将arguments转换成真正的数组
          var args = Array.prototype.slice.call(arguments);
          start = list.length;
          args.forEach(function(fn){
            // 先进性判断用户所注册的每一个参数是不是一个函数，如果是一个函数的话，把他放进list队列里面
            if (toString.call(fn) === "[object Function]") {
              list.push(fn);
            }
          })
          if (memory) {
            // 如果我们把start赋值给index的话 那么会出现一种情况 比如说
            // var cb = _.callbacks("memory")  cb.add(function(){console.log(1)}) cb.add(function(){console.log(2)})
            // cb.fire(); cb.add(function(){console.log(323)})
            // 当用户注册第一个add的时候 start为0 第二次使用add注册的时候 start为1 然后如果直接把start赋值给index的话 那么他会直接跳过第一个打印1的函数，会从第二个开始执行
            // 所以这里使用了memory进行判断,只有当fire执行以后，memory才是有值的，现在starts的值为2,因为前面两个都执行过了，这时候在执行接下来的就可以了
            starts = start;
            fire(memory);
          }
        },
        // 将两个fire进行关联起来
        fireWith: function(context, arguments){
          // 将所要传的参数放进一个数组里面，直接传给fire
          var args = [context, arguments];
          // 当用户所传入的参数是once的时候，那么我们只想让他执行一次
          // 如果单单只用个options.once去判断的话 那么他连第一次都执行不了
          // 这时候就得用到另外一个变量来记录一下有没有执行过fire
          // 当执行一次fire以后testting就会变成true 那么当第二次调用fire的时候 他这个是不会执行fire的
          if (!options.once || !testting) {
            fire(args)
          }
        },
        // 这个并不是真正用来执行的方法 而是一个接受参数的方法
        fire: function(){
          // 这个arguments是用来传递参数,比如说
          // cb.add(function(value){console.log(value)}) cb.fire("你好")  => console.log("你好")
          // 这个参数是给处理函数使用的
          fireWith(self, arguments);
        }
      }
    }
  }
  function createOptions(options){
    var object = optionsCache[options] = {};
    // 因为用户所传入的参数有可能是这种形式的"once stopOnFalse"这种类型的 一旦出现这种类型的， 我们要给他进行切割
    options.split(/\s+/).forEach(function(value){
      // 给每一个"once" "stopOnFalse"这些属性名所对应的值为true
      object[value] = true;
    })
    // 当执行上面那个循环的时候 这时候optionsCache[options]的值就是这个object的值
    // 返回object
    return object;
  }
  root._ = _;
})(this)
```
- `var optionsCache = {};` 可以用来缓存用户所传入的参数，这样当用户下次传进来相同的值的时候，可以减少性能消耗
- `var object = optionsCache[options] = {};` 将一个对象分别赋值给optionsCache[options]和object身上
- `list.apply(data[0], data[1]) === false && options.stopOnFalse` 当用户传入的参数是stopOnFalse的时候，并且当函数的返回值为false的时候，直接给他break，不进行接下来的运行
- `!options.once || !testting` 因为这是逻辑或，所以只要有一个为true，就可以执行里面的函数

## Undersore.js文件备注是第一次的理解，当前md文件是第二次理解