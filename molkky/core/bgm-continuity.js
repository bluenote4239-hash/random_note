(function(){'use strict';
function active(){try{return !!(window.AudioManager&&AudioManager.activeBgm==='ievan_v29'&&window.__BGM_V29__&&typeof __BGM_V29__.start==='function')}catch(e){return false}}
function ensure(){if(!active())return;try{__BGM_V29__.start()}catch(e){console.warn('BGM continuity resume failed',e)}}
['pointerdown','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,ensure,{passive:true})});
document.addEventListener('visibilitychange',function(){if(!document.hidden)ensure()});
window.addEventListener('pageshow',ensure);
window.addEventListener('focus',ensure);
setInterval(function(){if(!document.hidden)ensure()},500);
window.__BGM_CONTINUITY__={ensure:ensure,version:'v1'};
})();
