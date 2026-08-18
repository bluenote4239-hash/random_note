/*
 * Character Registry / Renderer
 * Single source of truth for all character visuals.
 * Game rules and event logic must never know atlas URLs or crop coordinates.
 * Future character select screen should call CharacterManager.select(id).
 */
(function(){
  'use strict';

  var registry=Object.create(null);
  var activeId=null;
  var slots={full:null,icon:null,cutin:null};

  function cloneCrop(c){return {x:c.x,y:c.y,w:c.w,h:c.h};}

  function register(def){
    if(!def||!def.id)throw new Error('Character definition requires id');
    if(!def.atlasUrl)throw new Error('Character '+def.id+' requires atlasUrl');
    if(!def.atlasSize||!def.atlasSize.w||!def.atlasSize.h)throw new Error('Character '+def.id+' requires atlasSize');
    if(!def.full)throw new Error('Character '+def.id+' requires full crop');
    if(!def.expressions||!def.expressions.normal)throw new Error('Character '+def.id+' requires normal expression');
    registry[def.id]=def;
    if(!activeId)activeId=def.id;
    return def.id;
  }

  function get(id){return registry[id||activeId]||null;}
  function list(){return Object.keys(registry).map(function(id){return registry[id];});}

  function cropFor(def,kind,expr){
    if(kind==='full')return def.full;
    return def.expressions[expr]||def.expressions.normal;
  }

  function render(el,kind,expr){
    var def=get();
    if(!el||!def)return false;
    var crop=cropFor(def,kind,expr||'normal');
    if(!crop)return false;

    var targetW=el.clientWidth||crop.w;
    var targetH=el.clientHeight||crop.h;
    var scale;
    if(kind==='full'){
      scale=Math.max(targetW/crop.w,targetH/crop.h);
    }else{
      scale=Math.max(targetW/crop.w,targetH/crop.h);
    }

    el.style.backgroundImage='url("'+def.atlasUrl+'")';
    el.style.backgroundRepeat='no-repeat';
    el.style.backgroundSize=(def.atlasSize.w*scale)+'px '+(def.atlasSize.h*scale)+'px';
    el.style.backgroundPosition=(-crop.x*scale)+'px '+(-crop.y*scale)+'px';
    el.style.backgroundColor='transparent';
    el.style.backgroundOrigin='border-box';
    el.style.backgroundClip='border-box';
    el.dataset.characterId=def.id;
    el.dataset.characterExpression=expr||'normal';
    return true;
  }

  function bindSlot(name,el){
    if(!(name in slots))throw new Error('Unknown character slot: '+name);
    slots[name]=el;
    renderSlot(name,name==='full'?'normal':'normal');
  }

  function renderSlot(name,expr){
    var el=slots[name];
    if(!el)return false;
    return render(el,name==='icon'?'face':name,expr||'normal');
  }

  function renderAll(expr){
    renderSlot('full','normal');
    renderSlot('icon',expr||'normal');
    renderSlot('cutin',expr||'joy');
  }

  function select(id){
    if(!registry[id])throw new Error('Unknown character: '+id);
    activeId=id;
    renderAll('normal');
    try{localStorage.setItem('molkky.character',id);}catch(e){}
    window.dispatchEvent(new CustomEvent('molkky:characterchange',{detail:{id:id}}));
    return id;
  }

  window.CharacterManager={
    register:register,
    get:get,
    list:list,
    select:select,
    bindSlot:bindSlot,
    render:render,
    renderSlot:renderSlot,
    renderAll:renderAll,
    get activeId(){return activeId;}
  };

  // Character 01: current gal. Expression cells in the original atlas are unreliable
  // on iPad, so every expression currently uses a verified face crop from the
  // full-body cell. Future character packs can provide distinct expression crops.
  if(typeof GAL_ATLAS_URL!=='undefined'){
    var safeFace={x:38,y:12,w:110,h:110};
    register({
      id:'gal01',
      name:'Mölkky Gal',
      atlasUrl:GAL_ATLAS_URL,
      atlasSize:{w:560,h:460},
      full:{x:0,y:0,w:180,h:450},
      expressions:{
        normal:cloneCrop(safeFace),
        joy:cloneCrop(safeFace),
        surprise:cloneCrop(safeFace),
        thinking:cloneCrop(safeFace),
        regret:cloneCrop(safeFace)
      },
      voiceSet:'amitaro_gal_01',
      theme:'pink-blue-yellow'
    });
  }
})();