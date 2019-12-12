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

  // 3.1.3的内容
  // obj就是被迭代的对象
  // iteratee是迭代器
  // context是上下文指向的对象
  _.map = function(obj, iteratee, context) {
    // 将迭代器和上下文指向的对象 传入cb 让cb进行优化迭代器
    // 假设迭代器传了，上下文指定对象传了的话 那么他最后的返回值就是cb的返回值，cb的返回值就是optimizeCb的返回值
    // 所以这个iteratee的值是一个有参数的回调函数 类似这样的
    // function(value, index, obj) {
    //   // 将这个迭代器里面的this指向传过来的context， 这里的value,index,obj结合_.map里面的代码一起看
    //   func.call(context, value, index, obj);
    // }
    var iteratee = cb(iteratee, context);
    // 如果我们所传过来的被迭代的对象不是一个数组的话 那么我们把他当做对象来处理  
    // Object.keys是获取一个可枚举的对象的所有属性名 以一个数组的形式保存着 例如
    // var obj = {name: 1, age: 18}  Object.keys(obj) ==> ["name", "age"]
    var keys = !_.isArray(obj) && Object.keys(obj);
    // 如果keys有值的话 那么返回他的长度  如果keys没值的话 那么返回所传过来的被迭代的对象的长度
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
  // cb就是用来优化迭代器的
  // count是用来指定迭代器里面的参数的个数的
  var cb = function(iteratee, context, count){
    // 如果迭代没有传过来的话 那么直接返回一个默认的迭代器出去
    if (iteratee == null) {
      return _.identity;
    }
    // 如果传了迭代器 并且这个迭代器是个函数的话 那么将这个迭代器和上下文指定的对象 参数个数传入optimizeCb让他生成最终的迭代器
    if (_.isFunction(iteratee)) {
      return optimizeCb(iteratee, context, count);
    }
  }

  var optimizeCb = function(func, context, count) {
    // 如果上下文的指定对象没有传的话  那么就把他所传进来的迭代器返回出去
    if (context == void 0) {
      return func;
    }
    // 如果传了话 那么就进行接下来的switch语句
    // 然后根据他的count 参数个数来进行判断 该返回怎样的迭代器(也就是参数个数的区别)
    switch(count == null ? 3 : count) {
      case 1:
        return function(value) {
          return func.call(context, value)
        };
      case 3:
        return function(value, index, obj) {
          // 将这个迭代器里面的this指向传过来的context， 这里的value,index,obj结合_.map里面的代码一起看
          return func.call(context, value, index, obj);
        }
    }
  }

  // 这个是默认的迭代器
  _.identity = function(value) {
    return value;
  }

  _.isFunction = function(value) {
    return toString.call(value) === "[object Function]";
  }





  // 3.1.4 rest参数 underscore创建对象方式

  _.restArguments = function(func){
    // func.length是获取这个函数的形参的个数
    // startIndex就是我们该从哪个地方开始 要把剩下来的所有参数全都放在一个数组里面也就是 rest参数
    var startIndex = func.length - 1;
    // 返回一个匿名函数 
    return function() {
      // 获取除了非rest参数以外的长度
      var length = arguments.length - startIndex,
          // 创建一个从startIndex开始参数个数的长度
          rest = Array(length),
          // 定义一个index 为了接下来的for循环做准备
          index = 0;
      for (; index < length; index++) {
        // 将用户在这个匿名函数里面传的参数从startIndex开始 全都放在rest数组里面
        rest[index] = arguments[index + startIndex];
      }
      // 创建一个为了将非rest和rest参数整合在一起的容器
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex ; index++) {
        // 先将除了rest参数以外的参数放进这个容器里面先
        args[index] = arguments[index];
      }
      // 最后通过下表 将这个rest参数放进去
      args[startIndex] = rest;
      // 最后将原先传过来的函数返回出去 并且将包有rest参数的参数返回出去
      return func.apply(this, args);
    }
  }
  // 这个函数是为了baseCreate的时候准备的
  var Ctor = function(){};
  // Object.create(obj)是将创建出来的对象的原型指向obj
  // 同理 baseCreate(obj)是将创建出来的对象的原型指向obj
  var baseCreate = function(prototype) {
    // 如果所传过来的参数不是一个对象的话 那么直接返回一个空对象
    if (!_.isObject(prototype)) return {};
    // 先进性检测一下 Object.create能不能使用 如果能使用的话 那么直接创建一个对象 并且这个对象的原型指向所传进来的对象
    if (Object.create) return Object.create(prototype);
    // 如果不存在 那么将一个空的函数的原型指向这个对象
    Ctor.prototype = prototype;
    // 并且通过new进行实例化
    var result = new Ctor;
    // 在每次实例化后 我们要把这个Ctor的原型先给清空掉 不让这次的原型路线有所保留
    Ctor.prototype = null;
    // 再将这个对象返回出去
    return result;
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