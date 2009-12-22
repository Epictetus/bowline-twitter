var Bowline = {
  msgs: [],
  callbacks: {},
  uuid: 0,
  bounds: {},
  trace: false,
  
  id: function(){
    return ++Bowline.uuid;
  },
  
  // Usage: invoke(klass, method, *args)
  invoke: function(){
    var args    = $.makeArray(arguments);
    var klass   = args.shift();
    var method  = args.shift();
    var id      = Bowline.id();
    
    var callback  = args.pop();
    if(typeof(callback) == "function"){
      Bowline.callbacks[id] = callback;
    } else if(callback) {
      args.push(callback);
    }
    var msg = {
      klass:klass, 
      method:method, 
      args:args, 
      id:id
    };

    Bowline.log("New message:")
    Bowline.log(msg);
    Bowline.msgs.push(msg);
  },
  
  // Usage: instanceInvoke(klass, id, method, *args)
  instanceInvoke: function(){
    var args = $.makeArray(arguments);
    args.splice(1, 0, "instance_invoke");
    Bowline.invoke.apply(this, args);
  },
  
  // Usage: windowInvoke(method, *args)
  windowInvoke: function(){
    var args = $.makeArray(arguments);
    args.unshift("_window");
    Bowline.invoke.apply(this, args);    
  },
  
  helper: function(){
    var args = $.makeArray(arguments);
    args.unshift("Helper");
    Bowline.invoke(args);
  },
  
  bind: function(el, klass, options){
    el = jQuery(el);
    el.chain(options);
    el.data('bowline', klass);
    if(!Bowline.bounds[klass]) 
      Bowline.bounds[klass] = [];
    Bowline.bounds[klass].push(el);
    jQuery(function(){
      Bowline.invoke(klass, "setup");
    });
  },
  
  // Bowline functions
  
  pollJS: function(){
    var res = JSON.stringify(Bowline.msgs);
    Bowline.msgs = [];
    return res;
  },
  
  invokeJS: function(str){
    Bowline.log("Invoking: " + str);
    return JSON.stringify(eval(str));
  },
  
  invokeCallback: function(id, res){
    Bowline.log("Callback: " + id);
    if(!Bowline.callbacks[id]) return true;
    Bowline.callbacks[id](JSON.parse(res));
    delete Bowline.callbacks[id];
    return true;
  },
  
  populate: function(klass, items){
    if(!Bowline.bounds[klass]) return true;
    jQuery.each(Bowline.bounds[klass], function(){
      this.items('replace', items);
    });
    return true;
  },
  
  created: function(klass, id, item){
    if(!Bowline.bounds[klass]) return true;
    if(!item.id) item.id = id;
    jQuery.each(Bowline.bounds[klass], function(){
      this.items('add', item);
    });
    return true;
  },
  
  updated: function(klass, id, item){
    if(!Bowline.bounds[klass]) return true;
    if(!item.id) item.id = id;
    jQuery.each(Bowline.bounds[klass], function(){
      Bowline.findItem(this, id).item('replace', item);
    });
    return true;
  },
  
  removed: function(klass, id){
    if(!Bowline.bounds[klass]) return true;
    jQuery.each(Bowline.bounds[klass], function(){
      Bowline.findItem(this, id).item('remove');
    });
    return true;
  },
  
  trigger: function(klass, event, data){
    if(!Bowline.bounds[klass]) return true;
    jQuery.each(Bowline.bounds[klass], function(){
      this.trigger(event, data);
    });
    return true;
  },
  
  element: function(klass, id){
    var el = jQuery();
    jQuery.each(Bowline.bounds[klass], function(){
      el = el.add(findItem(this, id));
    });
    return el;
  },
  
  // System functions
  
  loaded: function(){    
    Bowline.windowInvoke("loaded!");
  },
  
  findItem: function(el, id){
    var items = jQuery.grep(el.items(true), function(n, i){
      return $(n).item().id == id;
    });
    return($(items[0]));
  },
  
  log: function(msg){
    if(Bowline.trace)
      console.log(msg);
  },
  
  warn: function(msg){
    console.warn(msg);
  }
};

(function($){
  $.fn.invoke = function(){
    if($(this).chain('active')){
      var args = $.makeArray(arguments);
      if($(this).data('bowline')){
        // Class method
        var klass = $(this).data('bowline');
        args.unshift(klass);
        Bowline.invoke.apply(this, args);
      } else {
        // Instance method
        var klass = $(this).item('root').data('bowline');
        var id = $(this).item().id;
        args.unshift(id);
        args.unshift(klass);
        Bowline.instanceInvoke.apply(this, args);
      }
    } else {
      throw 'Chain not active';
    }
  };
  
  $.fn.bindto = function(){
    var args = $.makeArray(arguments);
    args.unshift(this);
    Bowline.bind.apply(this, args);
  };
})(jQuery);

jQuery(function($){
  Bowline.loaded();
})