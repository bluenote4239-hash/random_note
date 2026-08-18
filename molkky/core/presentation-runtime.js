(function(){'use strict';
var full=document.getElementById('galFull'),icon=document.getElementById('galIcon'),cut=document.getElementById('cutinImg'),bubble=document.getElementById('galBubble'),cutinBox=document.getElementById('cutin'),cutinText=document.getElementById('cutinText');
function bind(){if(!window.CharacterManager)throw Error('CharacterManager missing');CharacterManager.bindSlot('full',full);CharacterManager.bindSlot('icon',icon);CharacterManager.bindSlot('cutin',cut);CharacterManager.renderAll('normal')}
function setGal(expr,text){if(text&&bubble)bubble.textContent=text;CharacterManager.renderSlot('icon',expr||'normal')}
function cutin(kind,label,expr,ms){if(!cutinBox||!cutinText)return;cutinBox.className=kind+' show';cutinText.textContent=label;CharacterManager.renderSlot('cutin',expr||'joy');setTimeout(function(){cutinBox.className=''},ms===undefined?850:ms)}
bind();window.addEventListener('molkky:characterchange',bind);window.PresentationRuntime={bind:bind,setGal:setGal,cutin:cutin};
})();