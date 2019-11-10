# 2.4.1延迟对象-deferred对象&源码分析

## Promise/A+规范 or Deferred
- Promise作为一个模型，提供了一个在软件工程中描述延时(或将来)概念的解决方法
  - Promise表示一个异步操作的最终结果
  - 与Promise最主要的交互方法是，通过将函数传入它的then方法，从而获取Promise最终的值或Promise最终拒绝(reject)的原因
  - 一个Promise必须处于以下状态的其中之一：pending,fulfilled或rejected
  - 一个Promise必须提供一个then方法来获取其值或原因
- Deferred是这种规范的具体实现
```js
  new Promise().then(function(){})
```
## jQuery中Deferred API
- `jQuery.Deferred()` 一个构造函数，返回一个链式实用对象方法来注册多个回调，回调队列，并且调用回调队列，并转达任何同步或异步函数的成功或失败状态
- `deferred.done()` 当Deferred(延迟)对象解决时，调用添加处理程序
- `deferred.fail()` 当Deferred(延迟)对象拒绝时，调用添加处理程序
- `deferred.progress()` 当Deferred(延迟)对象生成进度条通知时，调用(已)添加的处理程序
- `jQuery.when()` 提供一种方法来执行一个或多个对象的回调函数，Deferred(延迟)对象通常表示异步事件
- `.promise()` 返回一个Promise对象用来观察当某种类型的所有行动绑定到集合，排队与否还是已经完成

## Deferred的作用
1. 对于使用者来说是异步回调的解决方案，对于JQuery内部来说是创建一个延迟对象。
2. callbacks用于管理函数队列，在jQuery内部使用，为ajax，Deferred等这些组件提供了基础的功能函数
3. callbacks为Deferred创建队列，管理队列里面的处理函数

## 怎样实现一个deferred
```js
(function(root){
  // ...
  jQuery.extend({
    Deferred: function(){
      // 用来存储延迟对象三种不同状态的值 resolve reject notify(pedding)
      // 每一项的第0项是 延迟对象的状态
      // 第1项是 延迟对象响应状态的添加处理方法
      // 第2项是 创建队列 其实也就是获取callbacks里面的self对象
      // 第3项是  延迟对象的最终状态信息
      var tuples = [
        ["resolve", "done", jQuery.callbacks("once memory"), "resolved"],
        ["reject", "fail", jQuery.callbacks("once memory"), "rejected"],
        ["notify", "progress", jQuery.callbacks("memory")]
      ],
      // 设定一个初始的状态值
      state = "pedding",
      promise = {
        state: function(){
          return state;
        },
        then: function(){

        },
        promise: function(obj) {
          // 判断所传过来的是否为空 如果为空的话 返回一个promise 如果不为空的话将promise挂载到所传过来的对象
          return obj != null ? jQuery.extend(obj, promise): promise;
        }
      },
      // 创建一个延迟对象 我们要关注这个延迟对象身上具体拥有哪些方法 我们在最后的返回deferred的时候看看具体有哪些方法
      deferred = {};
      tuples.forEach(function(tuple,i){
        var list = tuple[2], // 将callbacks的返回值self引用给list
            stateString = tuple[3]; // 将最后的状态信息给stateString
        promise[tuple[1]] = list.add; // 将self的添加注册事件函数的add方法挂载到 promise[done] | promise[fail] | promise[progress]
        // 当有最终的状态信息的时候 添加事件处理函数到队列里面， 这个事件处理函数的作用是将延迟对象身上的状态从pedding改编成resolved或者rejected，让他在第一时间去调用这个处理事件
        if (stateString) {
          list.add(function(){
            state = stateString;
          })
        }
        // 将deferred身上添加resolve reject方法 当他调用的时候 其实是调用了list.fireWith()方法
        deferred[tuple[0]] = function(){
          // 当this跟deferred相等的时候 将promise对象传回
          // 这里为什么传回promise方法呢
          // 因为这里要将状态凝固起来 因为deferred方法只允许状态修改一次以后就不能再次修改了，如果你传回一个deferred对象的话 那这个对象又可以再次修改这个状态
          // 所以这里我们要传回promise
          deferred[tuple[0] + "With"](this === deferred? promise: this, arguments);
        }
        deferred[tuple[0] + "With"] = list.fireWith;
      })
      // 最终deferred身上有8中方法
      // resolve reject progress done fail state then promise 
      promise.promise(deferred);
      return deferred;
    },
    when: function(deferredObj) {
      // 当你传过去一个空值的时候 其实就是返回一个promise
      // promise身上具有done fail方法可以让我往队列里面添加注册事件
      return deferredObj.promise();
    }
  })
  // ...
  root.$ = root.jQuery = jQuery;
})(this)
```