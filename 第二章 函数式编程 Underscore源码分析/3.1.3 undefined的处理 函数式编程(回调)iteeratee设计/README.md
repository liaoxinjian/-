# 3.1.3 undefined的处理/函数式编程(回调)iteratee设计

## undefined的处理

因为在js中undefined可以当做一个变量来使用赋值，因此这个undefined很可能是任何一个值，可能不怀好意的人会利用这一点来破坏你的程序，所以我们要用`void 0;` 或者 `void(0);`。
```js
  function test(a) {
    var undefined = 123;
    if (a === undefined) {
      // 如果a没传的话  那么他肯定是不跟123相等的 所以程序不会进到这里面
    }
  }
```

## iteratee

一个迭代器至少由两部分组成
1. 被迭代集合
2. 当前迭代过程
在underscore中，当前迭代过程是一个函数，称为iteratee(迭代器),他将为当前迭代元素进行处理

## cb

是去优化这个迭代器的过程。将根据不同情况，为我们的迭代创建一个迭代过程iteratee,服务于每轮迭代

## optimizeCb

这个是我们最终生成迭代器的一个处理函数。当传入的value是一个函数的时候，value还要经过内置函数optimizeCb才能获得最终的iteratee.
可选传入待优化的回调函数func，以及迭代回调需要的参数个数argCount,根据参数个数分情况进行优化

## 实现一个迭代器
```js
(function(root){
  // ...
  // 这里的Obj指的就是被迭代的对象
  // iteratee是指迭代器
  // contetx是指上下文指定的对象
  _.map = function(obj, iteratee, context){
    // 通过cb来优化迭代器
     // 将迭代器和上下文指向的对象 传入cb 让cb进行优化迭代器
    // 假设迭代器传了，上下文指定对象传了的话 那么他最后的返回值就是cb的返回值，cb的返回值就是optimizeCb的返回值
    // 所以这个iteratee的值是一个有参数的回调函数 类似这样的
    // function(value, index, obj) {
    //   // 将这个迭代器里面的this指向传过来的context， 这里的value,index,obj结合_.map里面的代码一起看
    //   func.call(context, value, index, obj);
    // }
    var iteratee = cb(iteratee, context);
    // 如果被迭代的对象不是一个数组的话 我们默认将他按对象来处理 
    // 然后将这个对象的属性名放在一个数组里面
    // 比如 {name: 1, age: 19} ==> ["name", "age"]
    var keys = !_.isArray(obj) && Object.keys(obj);
    // 如果keys有值的话 那么获取keys的长度
    // 如果keys没有值的话 那么就获取被迭代对象的长度
    var length = (keys || obj).length;
    // 创建一个相同长度的空数组
    var result = Array(length);
     // 进行for循环 让迭代器进行生效
    for (var index = 0; index < length ; index++) {
      // 这个currentKey 如果是在keys存在的情况下 那么拿到的就是被迭代的对象的属性名例如 {name: 1, age: 18}  ==>  "name"  "age"
      // 如果keys不存在的话那就返回index 也就是下标值
      var currentKey = keys ? keys[index] : index;
      // 这里的iteratee也就是optimizeCb里面返回的迭代器  所以 迭代器里面的value对应的就是obj[currentKey] 也就是被迭代对象的每一个值 index对应的index也就是下标值 obj对应的obj 也就是被迭代的对象
      // 将他们的返回值放在result这个相同长度的空数组里面
      result[index] = iteratee(obj[currentKey], index, obj);
    }
    // 最后返回这个相同长度的数组
    return result;
  }
  // 这里的iteratee也就是要被优化的迭代器
  // context也就是上下文指定的对象
  // count也就是迭代器里面要求有的参数的个数
  var cb = function(iteratee, context, count) {
    // 如果没有传迭代器的话 那么就返回一个默认的迭代器
    if (iteratee == void 0) {
      return _.identity;
    }
    // 如果传了迭代器 并且这个迭代器是一个函数类型的话  那么就通过optimizeCb来生成最终的迭代器 并且将他返回出去
    if (_.isFunction(iteratee)) {
      return optimizeCb(iteratee, context, count);
    }
  }
  // 这里的func也就是要被优化的迭代器
  var optimizeCb = function(func, context, count) {
    // 如果没有传入上下文指定对象的话 那么就返回用户所传入的迭代器
    if (context == null) {
      return func;
    }
    // 进行一个switch的判断 然后根据他的count 参数个数来进行判断 该返回怎样的迭代器(也就是参数个数的区别)
    switch(count ? 3 : count) {
      case 1:
        return function(value) {
          return func.call(context, value)
        }
      case 3:
        return function(value, index, obj) {
          // 将这个迭代器里面的this指向传过来的context， 这里的value,index,obj结合_.map里面的代码一起看
          return func.call(context, value, index, obj);
        }
    }
  }
  // 默认的迭代器
  _.identity = function(value) {
    return value;
  }
  // ...
})(this)

```
- `Object.keys()`是将一个可枚举的对象的属性名放在一个数组里面