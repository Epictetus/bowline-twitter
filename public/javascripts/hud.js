jQuery(function($){
  $(document.body).each(function(){
    var element = $(this)[0];
    element.ondragstart = function(e){
      // e.dataTransfer.effectAllowed = "none";
    };
  
    element.ondrag = function(e){
      // There's some weirdness going on -
      // e.screenY isn't the right number.
      // I have a feeling this might all be due to a conflict
      // betweeen different coordinate systems.
      
      // Also window.moveTo is 22 px out
      // I'm presuming that is due to the top osx bar.
      
      var x = e.screenX;
      var y = e.screenY - $(window).height();
      
      var currentWindow = Titanium.UI.currentWindow;
      currentWindow.setX(x);
      currentWindow.setY(y);
    };
    
    $(this).wrapInner($("<div class='hud'></div>"));
    var hud = $(this).find('.hud');
    
    // You can use multiple colors in a border 
    // - so this is one way round it
    hud.wrapInner($("<div class='border'></div>"));
    var border = hud.find('.border');
    
    var title = $("<div class='title'></div>");
    title.text(document.title);
    border.prepend(title);
    
    hud.height($(window).height() - 2);
    border.height(hud.height() - 2);
  });
});