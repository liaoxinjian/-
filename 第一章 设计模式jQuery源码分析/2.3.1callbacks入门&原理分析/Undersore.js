(function(root){
  // 用来缓存用户传入的参数 可以做到减少性能消耗
  var optionsCache = {};
  var _ = {
    // 这个options指的是所传入的参数比如 1. once 2. stopOnFalse 3. memory
    callbacks: function(options){
      // 先判断传入的options是不是一个字符串 如果不是一个字符串 代表没传参或传入的数据格式不对 一律返回一个空对象给options
      // 如果传入的是一个字符串 会先去看一下options的缓存里面有没有这个参数 有的话直接拿取 没有的话 创建一个options的值
      // 其实有值的话 那么options最终得到的都是一个 {once: true, stopOnFalse: true} 这种值
      options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {};
      var list = [];
      var index, length, testting, memory, start, starts;
      var fire = function(data){
        // 当用户传入memory的时候 那么options.memory为true 那么就是把data赋值给memory
        memory = options.memory && data
        testting = true;
        index = starts || 0;
        starts = 0;
        length = list.length;
        for(;index < length;index++){
          if (list[index].apply(data[0], data[1]) === false && options.stopOnFalse) {
            break;
          }
        }
      }
      var self = {
        // 注册函数处理事件
        add: function(){
          // 将arguments现转换成一个真正的数组
          var args = Array.prototype.slice.call(arguments);
          start = list.length;
          args.forEach(function(fn){
            // 将用户所传入的参数进行遍历 然后进行判断是不是一个函数
            if (toString.call(fn) === "[object Function]") {
              list.push(fn);
            }
          })
          if (memory) {
            // 这里为什么要start赋值给starts呢 举个例子:
            // cb.add(function(){console.log(1)})  
            // cb.add(function(){console.log(2)})
            // cb.fire();
            // cb.add(function(){console.log(3)})
            // 当第一次执行add方法的时候 start为0 
            // 第二次执行add方法的时候 start为1
            // 然后调用fire方法 如果把start赋值给index的话 那么他是从第1项开始运行的 就跳过了conosle.log(1)这一函数
            // 这里进行memory判断是因为 只有当fire()运行过一次并且用户所传的参数是memory的时候 才可以进行这个程序
            starts = start;
            // memory因为在fire执行的时候  通过options.memory && data 把data赋值给了他
            fire(memory)
          }
        },
        // 这个是进行关联的
        fireWith: function(context, arguments){
          var args = [context, arguments];
          // 当用户传入一个once的时候 说明用户只想让它执行一次 那么options.once为true ！options.once为false
          // 如果单单只判断有没有once的话 那么有可能这个fire一次都执行不了 为了让他执行 我们这里用了逻辑与 先让fire执行一次 执行的时候把testting改为true 那么第二次就执行不了了
          if (!options.once || !testting) {
            fire(args)
          }
        },
        // 这个并不是真正的触发方法 而是一个传递参数的 因为我们可以继续往fire方法里面传递参数 这个参数是给注册函数处理事件用的比如说
        // cb.add(function(val){console.log(val)}) 这时候我们cb.fire("你好")的时候 那么这个函数的执行结果是打印一个"你好"
        fire: function(){
          self.fireWith(this, arguments);
        }
      }
      // 这里一定要返回self 因为在我们使用callbacks的时候 他会返回一个对象，这个对象身上可以访问到add和fire方法
      return self;
    }
  }
  function createOptions(options){
    // 将一个{}分别赋值给optionsCache相对应的options上面 并且赋值给object上面
    var object = optionsCache[options] = {};
    // 因为用户所传入的参数可能是"once stopOnFalse"这种 这种得进行分割才行
    options.split(/\s+/).forEach(function(value){
      object[value] = true;
    })
    return object;
  }
  root._ = _;
})(this)