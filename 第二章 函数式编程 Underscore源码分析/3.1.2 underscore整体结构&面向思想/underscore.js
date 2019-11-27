(function(root){
  var _ = function(obj){
    debugger
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
    // 往这个实例对象的_wrapper身上存储数据
    this._wrapper = obj;
  }
  root._ = _;
})(this)