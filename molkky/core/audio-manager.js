(function(){'use strict';
var bgm=Object.create(null),voices=Object.create(null),se=Object.create(null),activeBgm=null;
var AC=window.AudioContext||window.webkitAudioContext,ctx=null,bufferCache=Object.create(null);
function context(){if(!ctx){ctx=new AC()}return ctx}
function resume(){var c=context();if(c.state!=='running'){try{return Promise.resolve(c.resume())}catch(e){return Promise.reject(e)}}return Promise.resolve(c)}
function decode(url){if(!bufferCache[url]){bufferCache[url]=fetch(url,{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error('audio fetch '+r.status+' '+url);return r.arrayBuffer()}).then(function(ab){return new Promise(function(resolve,reject){var done=false;function ok(b){if(!done){done=true;resolve(b)}}function bad(e){if(!done){done=true;reject(e)}}try{var p=context().decodeAudioData(ab,ok,bad);if(p&&typeof p.then==='function')p.then(ok,bad)}catch(e){bad(e)}})}).catch(function(e){delete bufferCache[url];throw e})}return bufferCache[url]}
function preload(url){return decode(url).catch(function(){return null})}
function playFile(url,vol,rate,delay){var c=context();return resume().then(function(){return decode(url)}).then(function(buf){var s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.playbackRate.value=rate||1;g.gain.value=Math.max(0,Math.min(1,vol===undefined?1:vol));s.connect(g).connect(c.destination);s.start(c.currentTime+Math.max(0,delay||0));return s})}
function registerBgm(id,def){bgm[id]=def}
function registerVoices(id,def){voices[id]=def}
function registerSe(id,def){se[id]=def}
function startBgm(id){var d=bgm[id];if(!d||typeof d.start!=='function')throw Error('BGM missing '+id);activeBgm=id;return d.start()}
function getVoices(id){return voices[id]||null}
function getSe(id){return se[id]||null}
window.AudioManager={registerBgm:registerBgm,registerVoices:registerVoices,registerSe:registerSe,startBgm:startBgm,getVoices:getVoices,getSe:getSe,getContext:context,resume:resume,playFile:playFile,preload:preload,get activeBgm(){return activeBgm}};
})();