(function(){'use strict';if(!window.AudioManager)throw Error('AudioManager missing');var recent=[];
function stageBgmId(){var s=window.StageManager&&StageManager.get();return s&&s.bgm}
function startBgm(){var id=stageBgmId();if(!id)throw Error('stage BGM not configured');return AudioManager.startBgm(id)}
function ensureBgm(){if(!AudioManager.activeBgm)return AudioManager.resume();return AudioManager.resume().then(function(){var d=window.__BGM_V29__;if(d&&typeof d.start==='function')return d.start()})}
function voice(delay){setTimeout(function(){var ch=window.CharacterManager&&CharacterManager.get();var set=ch&&AudioManager.getVoices(ch.voiceSet);if(!set||!set.items||!set.items.length)return;var pool=[];for(var i=0;i<set.items.length;i++)if(recent.indexOf(i)<0)pool.push(i);if(!pool.length)for(var j=0;j<set.items.length;j++)pool.push(j);var n=pool[Math.floor(Math.random()*pool.length)];recent.push(n);while(recent.length>(set.recentWindow||2))recent.shift();AudioManager.playFile(set.items[n][1],set.volume||.82,.98+Math.random()*.04).catch(function(e){console.warn('voice failed',e)})},delay||0)}
function se(){return AudioManager.getSe('default')}
function wood(s,p){var d=se();return d&&d.wood?d.wood(s,p):null}
function whoosh(){var d=se();return d&&d.whoosh?d.whoosh():null}
function land(){var d=se();return d&&d.land?d.land():null}
['pointerdown','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,function(){ensureBgm().catch(function(){})},{passive:true})});
document.addEventListener('visibilitychange',function(){if(!document.hidden)ensureBgm().catch(function(){})});window.addEventListener('pageshow',function(){ensureBgm().catch(function(){})});
window.AudioRuntime={startBgm:startBgm,ensureBgm:ensureBgm,voice:voice,wood:wood,whoosh:whoosh,land:land};
})();