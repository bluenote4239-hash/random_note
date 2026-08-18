/* Character presentation adapter. No game rules here. */
(function(){
  'use strict';
  var full=document.getElementById('galFull');
  var icon=document.getElementById('galIcon');
  var cut=document.getElementById('cutinImg');

  function manager(){return window.CharacterManager||null;}

  function bind(){
    var m=manager();
    if(!m)return false;
    if(full)m.bindSlot('full',full);
    if(icon)m.bindSlot('icon',icon);
    if(cut)m.bindSlot('cutin',cut);
    m.renderAll('normal');
    return true;
  }

  function resizeFull(){
    if(!full)return;
    var h=full.clientHeight||360;
    full.style.width=(h*0.4)+'px';
    var m=manager();
    if(m)m.renderSlot('full','normal');
  }

  bind();
  resizeFull();
  setTimeout(function(){bind();resizeFull();},60);
  setTimeout(function(){bind();resizeFull();},250);

  if(typeof ResizeObserver!=='undefined'&&full){
    new ResizeObserver(function(){resizeFull();}).observe(full);
  }
  addEventListener('orientationchange',function(){setTimeout(function(){bind();resizeFull();},180);});

  // Wrap presentation events only. Game event/rule logic remains in game.js.
  var oldSetGal=window.setGal;
  if(typeof oldSetGal==='function'){
    window.setGal=function(expr,text){
      oldSetGal(expr,text);
      var m=manager();
      if(m)m.renderSlot('icon',expr||'normal');
    };
  }

  var oldCutin=window.cutin;
  if(typeof oldCutin==='function'){
    window.cutin=function(kind,label,expr,ms){
      oldCutin(kind,label,expr||'joy',ms===undefined?850:ms);
      var m=manager();
      if(m)m.renderSlot('cutin',expr||'joy');
    };
  }

  addEventListener('molkky:characterchange',function(){
    bind();
    resizeFull();
  });
})();