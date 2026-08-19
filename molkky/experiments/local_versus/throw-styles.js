(function(){'use strict';
if(!window.MolkkyContent)throw Error('MolkkyContent missing');
var definitions=Object.freeze({
  soft:Object.freeze({id:'soft',scatter:.62,forceScale:.72,forceBias:0,hitRadius:1.06,chainRadius:.62,chainChance:.62,fallBonus:-.02,travel:.62,arc:1.18,duration:560,color:'#64efff'}),
  standard:Object.freeze({id:'standard',scatter:1,forceScale:1,forceBias:0,hitRadius:1,chainRadius:1,chainChance:1,fallBonus:0,travel:1,arc:1,duration:520,color:'#ffe34f'}),
  smash:Object.freeze({id:'smash',scatter:1.22,forceScale:1.08,forceBias:.08,hitRadius:1.12,chainRadius:1.28,chainChance:1.18,fallBonus:.08,travel:1.32,arc:.9,duration:500,color:'#ff4fa3'})
});
var selected='standard',root=document.getElementById('game'),group=document.getElementById('throwStyles'),buttons=group?Array.from(group.querySelectorAll('[data-throw-style]')):[];
function get(id){return definitions[id]||definitions.standard}
function render(){
  buttons.forEach(function(button){var on=button.dataset.throwStyle===selected;button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on))});
  if(root)root.dataset.throwStyle=selected
}
function select(id){if(!definitions[id])return selected;if(group&&group.dataset.locked==='true')return selected;selected=id;render();return selected}
function lock(value){if(group)group.dataset.locked=value?'true':'false';buttons.forEach(function(button){button.disabled=!!value})}
buttons.forEach(function(button){button.addEventListener('click',function(event){event.stopPropagation();select(button.dataset.throwStyle)})});
render();
window.MolkkyThrowStyles={get:get,current:function(){return get(selected)},select:select,lock:lock,list:function(){return Object.keys(definitions).map(get)}};
})();
