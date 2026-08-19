(function(){'use strict';
var SRC='audio/bgm/ievan_v29/ievan_v29.wav',VOLUME=.46,context=null,gain=null,source=null,bufferPromise=null,startPromise=null,wanted=false;
function audioContext(){
  if(context&&context.state!=='closed')return context;
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unavailable');
  context=new AC();gain=context.createGain();gain.gain.value=VOLUME;gain.connect(context.destination);return context
}
function resume(){var c=audioContext();return c.state==='suspended'?c.resume().then(function(){return c}):Promise.resolve(c)}
function load(){
  if(bufferPromise)return bufferPromise;
  bufferPromise=fetch(SRC,{cache:'force-cache'}).then(function(response){if(!response.ok)throw Error('BGM file '+response.status);return response.arrayBuffer()}).then(function(bytes){return resume().then(function(c){return c.decodeAudioData(bytes.slice(0))})});
  bufferPromise.catch(function(){bufferPromise=null});return bufferPromise
}
function start(){
  wanted=true;if(source)return resume();if(startPromise)return startPromise;
  startPromise=resume().then(load).then(function(buffer){
    if(source)return context;
    source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.onended=function(){source=null;startPromise=null;if(wanted)start().catch(function(e){console.warn('file BGM restart failed',e)})};source.start(0);
    document.getElementById('game').dataset.bgm='file-loop';return context
  }).catch(function(e){startPromise=null;document.getElementById('game').dataset.bgm='file-error';console.warn('file BGM failed',e);throw e});return startPromise
}
function ensure(){return wanted?start():Promise.resolve()}
function info(){return{mode:'file-buffer-loop',src:SRC,volume:VOLUME,wanted:wanted,running:!!source,contextState:context?context.state:'idle'}}
['pointerdown','touchstart','keydown'].forEach(function(eventName){window.addEventListener(eventName,function(){ensure().catch(function(){})},{passive:true})});
document.addEventListener('visibilitychange',function(){if(!document.hidden)ensure().catch(function(){})});window.addEventListener('pageshow',function(){ensure().catch(function(){})});
window.FileBgmV29={start:start,ensure:ensure,info:info};AudioRuntime.startBgm=start;AudioRuntime.ensureBgm=ensure;
})();
