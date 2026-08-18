(function(){'use strict';
var bgm=Object.create(null),voices=Object.create(null),se=Object.create(null),activeBgm=null,bgmPlayers=Object.create(null);
function media(url,vol,rate,loop){var a=new Audio(url);a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.volume=Math.max(0,Math.min(1,vol===undefined?1:vol));a.playbackRate=rate||1;a.loop=!!loop;return a}
function registerBgm(id,def){if(!def||!def.src)throw Error('BGM src required '+id);bgm[id]=def}
function registerVoices(id,def){voices[id]=def}
function registerSe(id,def){se[id]=def}
function startBgm(id){var d=bgm[id];if(!d)throw Error('BGM missing '+id);if(activeBgm&&activeBgm!==id&&bgmPlayers[activeBgm])bgmPlayers[activeBgm].pause();activeBgm=id;var a=bgmPlayers[id];if(!a){a=media(d.src,d.volume===undefined?.46:d.volume,1,d.loop!==false);bgmPlayers[id]=a}if(a.paused)return a.play().then(function(){return a}).catch(function(e){console.warn('BGM play blocked',e);throw e});return Promise.resolve(a)}
function stopBgm(id){var key=id||activeBgm,a=key&&bgmPlayers[key];if(a){a.pause();a.currentTime=0}if(key===activeBgm)activeBgm=null}
function playFile(url,vol,rate,delay){return new Promise(function(resolve,reject){setTimeout(function(){try{var a=media(url,vol,rate,false);var p=a.play();if(p&&typeof p.then==='function')p.then(function(){resolve(a)},reject);else resolve(a)}catch(e){reject(e)}},Math.max(0,delay||0)*1000)})}
function preload(url){try{var a=media(url,0,1,false);a.load();return Promise.resolve(a)}catch(e){return Promise.reject(e)}}
function getVoices(id){return voices[id]||null}
function getSe(id){return se[id]||null}
window.AudioManager={registerBgm:registerBgm,registerVoices:registerVoices,registerSe:registerSe,startBgm:startBgm,stopBgm:stopBgm,getVoices:getVoices,getSe:getSe,playFile:playFile,preload:preload,resume:function(){return Promise.resolve()},get activeBgm(){return activeBgm},getBgmPlayer:function(id){return bgmPlayers[id||activeBgm]||null}};
})();