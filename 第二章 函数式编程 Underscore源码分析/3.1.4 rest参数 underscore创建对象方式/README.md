# 3.1.4 rest参数 underscore创建对象方式

## rest参数
- 即自由参数、松散参数，自由和松散指参数个数是随意的，与之对应的是固定参数。
- es6引入rest参数(形式为...变量名)，用于获取函数的多余参数，这样就不需要使用arguments对象。
- rest参数搭配的变量是一个数组，改变量将多余的参数放入数组中。

## Object.create()
- `Object.create()`方法创建一个对象，并且将这个对象的原型指向所传入的参数，前提是所传入的参数必须是一个对象
- `Object.create()`不依赖构造函数，它内部已维护了一个构造函数，并将该构造函数的prototype属性指向传入的对象，他比new更灵活

## 实现一个rest参数的形式
在underscore里面，rest参数的开启方式，例如
```js
  var test = function(a, rest) {
    console.log(rest);
  }
  var test1 = _.restArguments(test)
  test1(1, 2, 3, 4)   // rest ==> [2, 3, 4];
```
***接下来是具体的实现方法***
```js
  (function(root){
    // ...
    _.restArguments = function(func) {
      // func.length是获取这个函数的形参的个数
      // 然后因为rest一般都是最后一个形参 所以我们要获取该从那个地方开始是rest参数的下标值
      var startIndex = func.length - 1;
      return function() {
        // 获取是rest参数的长度
        var length = arguments.length - startIndex,
            // 创建一个跟rest参数个数相同的数组 并且把这个数组命名为rest
            rest = Array(length),
            // 这个只是为了接下来两次for循环做准备的  不然每次都要创建一个index 消耗了不必要的内存
            index = 0;
        for (; index < length; index++) {
          // 因为startIndex是rest开始的下标值 所以我们应该以startIndex为一个参照点，他的后面的所有参数全部都放进rest参数里面
          rest[index] = arguments[index + startIndex];
        }
        // 创建一个数组 这个数组只是为了装非rest的参数和rest的参数
        var args = Array(startIndex + 1);
        for (index = 0; index < startIndex ; index++) {
          // 将非rest的参数先放进这个数组里面
          args[index] = arguments[index];
        }
        // 再将rest参数放进这个数组里面
        args[startIndex] = rest;
        // 再将args当做传进来的函数的参数
        return func.apply(this, args);
      }
    }
    // ...
  })(this)
```

## 怎么让Object.create()能够进行兼容
```js
  // 这个是为了baseCreate  其实这个函数的作用相当于是一个中介
  var Ctor = function(){};
  var baseCreate = function(prototype) {
    // 先进性判断一下传进来的对象是不是一个对象 不是的话 直接返回一个空对象
    if (!_.isObject(prototype)) return {};
    // 先进性判断一下Object.create可不可以用 可以的话  直接用Object.create创建一个对象 这个对象的原型指向prototype
    if (Object.create) return Object.create(prototype);
    // 将Ctor的原型指向传入的对象
    Ctor.prototype = prototype;
    // 然后通过new运算符进行实例化一个对象 并且最后将这个对象返回出去
    var result = new Ctor;
    // 当实例化结束以后 将Ctor身上的原型链给清空 不让当前这一次有任何的痕迹
    Ctor.prototype = null;
    return result;
  }
```