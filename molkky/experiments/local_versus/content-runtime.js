(function(){'use strict';
if(!window.MolkkyContent||!window.CharacterManager||!window.StageManager||!window.AudioManager)throw Error('content runtime dependencies missing');
var pack=MolkkyContent.get(),images=pack.images,audio=pack.audio,background=images.stage.background,bgImage=new Image(),woodIndex=0;
function drawBackground(ctx,w,h){
  if(!bgImage.complete||!bgImage.naturalWidth){ctx.fillStyle='#53b6ef';ctx.fillRect(0,0,w,h);return}
  if(background.fit!=='cover'){ctx.drawImage(bgImage,0,0,w,h);return}
  var scale=Math.max(w/bgImage.naturalWidth,h/bgImage.naturalHeight),sw=w/scale,sh=h/scale,sx=(bgImage.naturalWidth-sw)*(background.anchorX===undefined?.5:background.anchorX),sy=(bgImage.naturalHeight-sh)*(background.anchorY===undefined?.5:background.anchorY);
  ctx.drawImage(bgImage,sx,sy,sw,sh,0,0,w,h)
}
function play(src,volume,rate){return AudioManager.playFile(src,Math.max(0,Math.min(1,volume===undefined?1:volume)),rate||1).catch(function(){})}
function hydrate(){
  document.title=MolkkyContent.text('page.title');
  document.querySelectorAll('[data-content-text]').forEach(function(el){el.textContent=MolkkyContent.text(el.dataset.contentText)});
  var root=document.getElementById('game');if(root){root.dataset.contentPack=pack.id;root.dataset.contentVersion=String(pack.version);root.dataset.backgroundAsset=background.src}
}
bgImage.decoding='async';bgImage.src=background.src;bgImage.onload=function(){window.dispatchEvent(new CustomEvent('molkky:stagechange',{detail:{id:images.stage.id,assetReady:true}}))};
CharacterManager.register({id:images.character.id,name:images.character.name,images:images.character.expressions,voiceSet:images.character.voiceSet,theme:images.character.theme});
StageManager.register({id:images.stage.id,name:images.stage.name,bgm:audio.bgm.id,background:background.src,draw:drawBackground});
AudioManager.registerBgm(audio.bgm.id,{version:'content-file',src:audio.bgm.src,volume:audio.bgm.volume,loop:audio.bgm.loop!==false});
audio.se.wood.forEach(AudioManager.preload);AudioManager.preload(audio.se.whoosh);AudioManager.preload(audio.se.land);
AudioManager.registerSe(audio.se.id,{files:{wood:audio.se.wood.slice(),whoosh:audio.se.whoosh,land:audio.se.land},wood:function(strength,pitch){strength=strength===undefined?1:strength;pitch=pitch===undefined?1:pitch;return play(audio.se.wood[woodIndex++%audio.se.wood.length],.72*Math.max(.35,Math.min(1.25,strength)),pitch*(.97+Math.random()*.06))},whoosh:function(){return play(audio.se.whoosh,.72,1)},land:function(){return play(audio.se.land,.68,.98+Math.random()*.04)}});
AudioManager.registerVoices(audio.voices.id,{volume:audio.voices.volume,recentWindow:audio.voices.recentWindow,items:audio.voices.items.map(function(item){return[item.caption,item.src]})});
hydrate();window.MolkkyContentRuntime={pack:pack,hydrate:hydrate,backgroundImage:bgImage};
})();
