Builder=(function(){
  var state={
    editing:false,
    $node:false,
    data:{
      x:0,
      y:0,
      rotate:0,
      scale:0
    }
  },
  config={
    rotateStep:1,
    scaleStep:0.1,
    visualScaling:10,
    redrawFunction:false,
    setTransformationCallback:false
  },
  defaults={
    x:0,
    y:0,
    rotate:0,
    scale:1
  },
  mouse={
    prevX:false,
    prevY:false,
    activeFunction:false
  },
  handlers={},
  redrawTimeout,
  //nodes
  $menu,$controls,$impress,$overview;

  handlers.move=function(x,y){
    
    var v=fixVector(x,y);

    state.data.x = (state.data.x)? (state.data.x)+v.x : v.x;
    state.data.y = (state.data.y)? (state.data.y)+v.y : v.y;
  };
  handlers.scale=function(x){
    state.data.scale-= -x * config.scaleStep*config.visualScaling/10;
  };
  handlers.rotate=function(x){
    console.log(state.rotate);
    state.data.rotate-= -x*config.rotateStep;
  };
  

  function init(conf){
    config=$.extend(config,conf);
    
    // If a document is not passed default to this document (same as original builder behaviour)
    if (!config.doc) {
      config.doc = document;
    }
    // same for window
    if (!config.win) {
      config.win = window;
    }
    
    if(config.setTransformationCallback){
      config.setTransformationCallback(function(x){
        // guess what, it indicates slide change too :)
        $controls.hide();
        
        //setting pu movement scale
        config.visualScaling=x.scale;
        console.log(x.scale);
      //TODO: implement rotation handling for move
        config.rotation=~~(x.rotate.z);
        console.log('rotate',x.rotate.z);
      //I don't see why I should need translation right now, but who knows...
     
        console.log("hello this is a transformation callback");
        
        $menu.children(".w1").children(".cube1").css("rotateX", x.rotate.x);
        
        $menu.children(".w1").children(".cube1").css("rotateY", x.rotate.y);
        
        $menu.children(".w1").children(".cube1").css("rotateZ", x.rotate.z);
        
        
      })
    }
    
    $impress=$('#impress');
    $overview=$('#overview');
    
    $menu=$('<div></div>').addClass('builder-main');
    $('<div></div>').addClass('builder-bt bt-add').appendTo($menu).text('Add new').on('click',addSlide);
    $('<div></div>').addClass('builder-bt bt-overview').appendTo($menu).text('Overview').on('click',function(){
      config['goto']('overview');
    });
    $('<div></div>').addClass('builder-bt bt-upload').appendTo($menu).text('Upload html file').on('click',uploadResults);
    $('<div></div>').addClass('builder-bt bt-download').appendTo($menu).text('Download html file').on('click', downloadResults);
    $('<div></div>').addClass('builder-bt bt-download').appendTo($menu).text('Download style.css').on('click',downloadStyle);
    
    $('<div class="wrapper w1"><div class="cube1">\
			<div class="side viewfront front" style="transform: translateZ(1em);\">front</div>\
			<div class="side   back" style="transform: rotateY(-180deg) translateZ(1em);"></div>\
			<div class="side right" style="transform: rotateY(90deg) translateZ(1em);"></div>\
			<div class="side  viewleft left" style="transform: rotateY(-90deg) translateZ(1em);">left</div>\
			<div class="side  viewtop  top" style="transform: rotateX(90deg) translateZ(1em);">top</div>\
			<div class="side  bottom" style="transform: rotateX(-90deg) translateZ(1em);"></div>\
		</div></div>').appendTo($menu);
    
    // update all transforms for the cube sides - transit can't see them until they've been written??
    $.each($menu.children("div"),function(d){
			$(this).css("transform",this.style.transform);
		});
    
    // update canvas transform - doesn't work with transit?
    var $canvas = $("#canvas", config.doc);
    //$canvas.css("transform", this.style.transform);
    
    // attach click handler to pass rotate parameters to canvas object within iframe
    $menu.children(".w1").children(".cube1").children(".side").on('click',function flip(el){
		  console.log(this.classList);
      if($.inArray('viewtop',this.classList)>0 || $.inArray('viewfront',this.classList)>0 || $.inArray('viewleft',this.classList)>0){
        console.log(this.innerText);
        
        console.log($canvas.css("transform"));
        

        //$("#canvas", config.doc)
          $canvas.css("rotateX", "-" + $(this).css("rotateX"));
         //$("#canvas", config.doc)
         $canvas.css("rotateY", $(this).css("rotateY"));
         //$("#canvas", config.doc)
         $canvas.css("rotateZ", $(this).css("rotateZ"));
        
			
		
			//$(".w2 .cube").css("transform",$(this).css("transform"));
			
			
		};
		
		
		
		console.log($(this).css("rotateX"));
			console.log($(this).css("transform"));
			console.log(this.style.transform);
		
	});
    
    
    $menu.appendTo('body');
    
    // make menu draggable
    $menu.draggable();
    
    $controls=$('<div></div>').addClass('builder-controls').hide();
    
    
    $('<div></div>').addClass('bt-move').attr('title','Move').data('func','move').appendTo($controls);
    $('<div></div>').addClass('bt-rotate').attr('title','Rotate').data('func','rotate').appendTo($controls);
    $('<div></div>').addClass('bt-scale').attr('title','Scale').data('func','scale').appendTo($controls);
    
    $('<span></span>').addClass('builder-bt').text('Edit').appendTo($controls).click(editContents);
    $('<span></span>').addClass('builder-bt').text('Wrap').appendTo($controls).click(wrapContents);
    
    // make controls draggable
    $controls.draggable();
    /*
    var showTimer;
    
    $controls.appendTo('body').on('mousedown','div',function(e){
      e.preventDefault();
      mouse.activeFunction=handlers[$(this).data('func')];
      loadData();
      mouse.prevX=e.pageX;
      mouse.prevY=e.pageY;
      $(config.doc).on('mousemove.handler1',handleMouseMove);
      return false;
    }).on('mouseenter',function(){
      clearTimeout(showTimer);
    });
    $(config.doc).on('mouseup',function(){
      mouse.activeFunction=false;
      $(config.doc).off('mousemove.handler1');
    });
    */
    // create highlight class to be used to show steps being high lighted
    //TODO remove hard coded style and pull from builder.css
    //$("html > head", config.doc).append($("<style type='text/css'> .builderhighlight {background-color: rgba(255, 250, 100, 0.5);}</style>", config.doc));
    
    
    $('body',config.doc).on('mouseenter','.step',function(){
      var $t=$(this);
      /*showTimer=setTimeout(function(){
        if(!mouse.activeFunction){
          //show controls
          state.$node=$t;
          showControls(state.$node);
        }
      },500);*/
      //$t.data('showTimer', showTimer);
      
      $t.addClass('builder-select');
      $t.addClass('ui-widget-content');
      
      $t.resizable({
        disabled: false
      });
      
      // $t.draggable({ disabled: false,
      //   iframefix: true, cursor: "move",cursorAt: {left:0, top:0} });
      
      // var dragFix = function (event, ui) {
      //   ui.position.left -= parseFloat(this.dataset.x);
      //   ui.position.top -= parseFloat(this.dataset.y);
      // }
      // $t.on( "drag", dragFix);
      
      // $t.on( "start", dragFix);
      // $t.on( "stop", dragFix);
      
      
     $t.resizable( "option", "disabled", false );
      //$t.draggable( "option", "disabled", false );
    }).on('mouseleave', '.step', function () {
      var $t=$(this);
      
      //not showing when not staying
      clearTimeout($t.data('showTimer'));
      $t.removeClass('builder-select');
      $t.removeClass('ui-widget-content');
      $t.resizable({
        disabled: true
      });
      $t.resizable("option", "disabled", true);
      // $t.draggable({
      //   disabled: true
      // });
      // $t.draggable("option", "disabled", false);
    });
    
    
    
    
    
    
    $(window).on('beforeunload',function(){ return 'All changes will be lost'; });
    
    config['goto']('start');
    
    
  }
  
  var sequence = (function(){
    var s=2;
    return function(){
      return s++;
    }
  })()
  
  function addSlide(){
    //query slide id
    var id,$step;
    id='builderAutoSlide'+sequence();
    $step = $('<div></div>', config.doc).addClass('step builder-justcreated').html('<h1>This is a new step. </h1> How about some contents?');
    $step.addClass('builder-select');
    $step[0].id=id;
    $step[0].dataset.scale=3;
    $step.insertAfter($('.step:last',config.doc)); //not too performant, but future proof
    //config.creationFunction($step[0]);
    config['creationFunction']($step[0]);
    // jump to the overview slide to make some room to look around
    config['goto']('overview');
  }
  
  
  function downloadStyle(){
    var uriContent,content,$doc;
    

    $.get('style.css', function (content) {

      var bb = new Blob([content], { encoding: "UTF-8", type: "text/plain;charset=UTF-8" });
    
      saveAs(bb, "style.css");
    });
   
  }
  
  function uploadResults() {
    var content,$doc;
    
    $doc = $(config.doc.documentElement);
    
    $doc[0].innerHTML = '<object type="text/html" data="index_input.html" ></object>';
  }
  
  function downloadResults(){
    var content,$doc;
    
    $doc = $(config.doc.documentElement).clone();
    
    //remove all scripting
    //$doc.find('script').remove();
    
    //TODO remove builder styles added earlier
    
    //remove all current transforms
    $doc.find('.step, body, #impress, #impress>div').removeAttr('style');
    //remove gui
    $doc.find('.builder-controls, .builder-main').remove();
    //put overview at the end
    $doc.find('#overview').appendTo($doc.find('#impress'));
    //add impress.js simple init
/*
    $doc.find('body').attr('class', 'impress-not-supported')[0].innerHTML += '<script src="https://raw.github.com/bartaz/impress.js/master/js/impress.js"></script><script>impress().init()</script>';
    */
    content=$doc[0].outerHTML;
    //remove stuff


    var bb = new Blob([content], { encoding: "UTF-8", type: "text/plain;charset=UTF-8" });
    
    saveAs(bb, "presentation.html");

  }
  
  function editContents() {
    var $t = $(this);
    if(state.editing===true){
      state.editing=false;
      state.$node.html($t.parent().find('textarea').val());
      state.$node.removeClass('builder-justcreated');
      $t.parent().find('textarea').remove();
      $t.text('Edit');
    }else{
      var $txt=$('<textarea>',config.doc).on('keydown keyup',function(e){
        e.stopPropagation();
      });
      $t.text('OK');
      $t.css( "opacity", 1);
      state.editing=true;
      $t.after($txt.val(state.$node.html()));
    }
  }
  
  function wrapContents() {
    state.$node.toggleClass('slide');
  }
  
  function showControls($where){
    var top,left,pos=$where.offset();
    //not going out the edges (at least one way)
    top=(pos.top>0)? pos.top+(100/config.visualScaling) : 0;
    left=(pos.left>0)? pos.left+(100/config.visualScaling) : 0;
    
    $controls.show().offset({
      top:top,
      left:left
    });
  }
  
  
  function loadData(){
    console.log('load',state.$node[0].dataset.x);
    //state.data=state.$node[0].dataset;
    //add defaults
    
    
    state.data.x=parseFloat(state.$node[0].dataset.x) || defaults.x;   
    state.data.y=parseFloat(state.$node[0].dataset.y) || defaults.y;   
    state.data.scale=parseFloat(state.$node[0].dataset.scale) || defaults.scale;   
    state.data.rotate=parseFloat(state.$node[0].dataset.rotate) || defaults.rotate;   
    
  }
  
  function redraw(){
    clearTimeout(redrawTimeout);
    redrawTimeout=setTimeout(function(){
      //state.$node[0].dataset=state.data;
        
      state.$node[0].dataset.scale=state.data.scale;
      state.$node[0].dataset.rotate=state.data.rotate;
      state.$node[0].dataset.x=state.data.x;
      state.$node[0].dataset.y=state.data.y;
      /**/
      console.log(state.data,state.$node[0].dataset,state.$node[0].dataset===state.data);
        
      config.redrawFunction(state.$node[0]);
      showControls(state.$node);
    //console.log(['redrawn',state.$node[0].dataset]);
    },20);
  }
  
  function fixVector(x,y){
    var result={x:0,y:0},
      angle=(config.rotation/180)*Math.PI,
      cs=Math.cos(angle),
      sn=Math.sin(angle);

    result.x = (x*cs - y*sn) * config.visualScaling;
    result.y = (x*sn + y*cs) * config.visualScaling;
    return result;
  }
  
  function handleMouseMove(e){
/*
    e.preventDefault();
    e.stopPropagation();
      
      
    var x=e.pageX-mouse.prevX,
    y=e.pageY-mouse.prevY;
        
    mouse.prevX=e.pageX;
    mouse.prevY=e.pageY;
    if(mouse.activeFunction){
      mouse.activeFunction(x,y);
      redraw();
    }
    */
    return false;
  }
  
  return {
    init:init
  };

})();
