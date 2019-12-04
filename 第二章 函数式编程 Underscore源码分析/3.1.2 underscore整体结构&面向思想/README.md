# 3.1.2 underscore整体结构&面向思想

## 整体结构概述
1. underscore将所有的方法先全部当作静态方法挂载到underscore身上，但是它里面会有一个`_.mixin`方法，这个方法他会将underscore身上的所有静态方法全部都挂载到他的原型身上，并且通过`_.chain`方法来开启链接式调用.
2. 为了让数据能够向管道一样流通，我们做了一个步骤，这个步骤就是将这个导出去的函数的引用变成一个构造函数

## 实现
```js
  (function(root){
  var push = Array.prototype.push;
  var _ = function(obj) {
    // 当我们通过_([1, 2, 3, 4, 5])的时候 这个obj指的就是[1, 2, 3, 4, 5]
    // 这个[1, 2, 3, 4, 5]肯定不是继承于underscore的
    // 所以这里跳过
    if (obj instanceof _) {
      return obj;
    }
    // 这里的this指的是window对象 也就是我们外面传过来的this
    // 因为window对象不继承于underscore 所以取反以后是true
    // 返回一个他的实例对象 并且把这个参数传进去
    // 因为new操作符的作用 他会去执行underscore函数 
    // 上面那一步因为obj还是[1, 2, 3, 4, 5]所以会跳过
    // 然后这里的this就指向了underscore的实例对象 所以这里取反以后会返回true 就跳过了
    if (!(this instanceof _)) {
      return new _(obj);
    }
    // 往这个实例对象的_wrapper身上存储数据 当我们通过_([1,23,4])调用的时候 这个数组[1,23,4]其实就是存储在this._wrapper
    this._wrapper = obj;
  }
  _.chain = function(obj) {
    // 创建一个underscore实例对象
    var instance = _(obj);
    // 并且往这个实例对象添加一个属性 这个属性就是是否开启链接式调用的关键
    instance._chain = true;
    // 最后返回出instance
    return instance;
  }
  function result(instance, obj) {
    // 如果instance身上没有chain值的话 那么直接返回第二个obj
    // 如果身上有chain的话 那么就创建一个underscore的实例 并且把新的值存储在这个underscore的实例身上 并且开启链接式调用
    // 这里去调用chain的话 其实又是执行了原型上面chain方法 原型上面其实应该是一个功能添加的函数 就像之前讲过的jq一样 在里面拓展功能
    // 当执行原型上面的chain方法的时候，再次调用了result方法 这时候result的第一个参数值的是普通的underscore对象 第二个参数就是开启了链接式调用的instance对象 那么他会返回一个instance
    return instance._chain ? _(obj).chain() : obj;
  }
  _.prototype.value = function() {
    return this._wrapper;
  }

  // 这是一个去重的方法
  _.unique = function(arr, callback) {
    var ret = [];
    var target, i = 0;
    for (; i < arr.length; i++) {
      // 当用户传过来一个回调函数的时候 那就直接用回调函数里面的返回的数当做目标 如果没有 就按照我们所传过来的数组的每一项
      target = callback ? callback(arr[i]) : arr[i];
      if (ret.indexOf(target) === -1) {
        ret.push(target);
      }
    }
    return ret;
  }
  _.isArray = function(array) {
    return toString.call(array) === "[object Array]";
  }

  // 这个方法是将_身上的所有静态方法的属性名称全都放在一个数组里面 
  // 在_.mixin方法中 将这些属性名全都放在一个数组里面
  _.functions = function(obj){
    var result = [], key;
    for (key in obj) {
      result.push(key);
    }
    return result;
  }
  // 这个方法是用来遍历用的
  // 第一个参数是遍历的数组或者对象
  // 第二个参数是所传过来的回调函数
  // 在mixin方法中 他的target是underscore身上的所有属性名称并且以数组的形式包裹
  // callback就是我们所要执行的回调函数
  _.each = function(target, callback){
    var key, i = 0, length;
    // 先判断一下这个target是不是一个数组 如果是 就以数组的形式进行循环遍历
    // 如果不是 就按照对象的形式进行循环遍历
    // 在_.mixin方法中 这个target肯定是一个数组 因为 我们在_.functions方法中的返回值就是一个数组
    if (_.isArray(target)) {
      length = target.length;
      for (; i < length; i++) {
        // 将所传进来的回调函数进行执行 并且this指向所传进来的这个数组
        // 将这个数组里的值按照参数传进去
        callback.call(target, target[i], i);
      }
    } else {
      for (key in target) {
        callback.call(target, key, target[key])
      }
    }
  }
  // 这个是将所有_身上的静态方法copy到原型身上
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name){
      var func = obj[name];
      _.prototype[name] = function(){
        var args = [this._wrapper];
        push.apply(args, arguments);
        // 这个result是一个辅助函数
        return result(this, func.apply(this, args));
      }
    })
  }
  _.mixin(_);
  root._ = _;
})(this)

```