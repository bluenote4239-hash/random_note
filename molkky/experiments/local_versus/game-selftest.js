(function(){'use strict';
function fail(message){console.error('CONTENT GAME SELFTEST FAIL',message);var root=document.getElementById('game'),log=document.getElementById('log');if(root)root.dataset.contentSelftest='fail';if(log)log.textContent='SELFTEST FAIL: '+message}
function pass(){var root=document.getElementById('game'),log=document.getElementById('log');if(root)root.dataset.contentSelftest='pass';if(log)log.textContent='SELFTEST PASS / READY';console.log('CONTENT GAME SELFTEST PASS')}
function decodeImages(images,done){var entries=Object.keys(images||{}).map(function(name){return[name,images[name]]}),left=entries.length,ended=false;if(!left)return done(Error('character images empty'));function bad(name,reason){if(ended)return;ended=true;done(Error('character image '+name+' '+reason))}entries.forEach(function(entry){var img=new Image();img.onload=function(){if(ended)return;if(!img.naturalWidth||!img.naturalHeight)return bad(entry[0],'decode');left--;if(!left){ended=true;done(null)}};img.onerror=function(){bad(entry[0],'load')};img.src=entry[1]})}
window.addEventListener('load',function(){setTimeout(function(){try{
  if(!window.MolkkyContent||!MolkkyContent.get())return fail('content pack');
  var pack=MolkkyContent.get(),character=CharacterManager.get(),stage=StageManager.get(),voices=AudioManager.getVoices(pack.audio.voices.id),se=AudioManager.getSe(pack.audio.se.id);
  if(!character||character.id!==pack.images.character.id||character.images!==pack.images.character.expressions)return fail('character binding');
  if(!stage||stage.id!==pack.images.stage.id||stage.background!==pack.images.stage.background.src||stage.bgm!==pack.audio.bgm.id)return fail('stage binding');
  if(!voices||voices.items.length!==pack.audio.voices.items.length)return fail('voice binding');
  if(!se||!se.wood||!se.whoosh||!se.land)return fail('SE binding');
  if(!window.MolkkyThrowStyles||MolkkyThrowStyles.list().length!==3||MolkkyThrowStyles.current().id!=='standard')return fail('three throw styles');
  if(!window.MolkkyThrowView||typeof MolkkyThrowView.target!=='function'||!MolkkyContent.required('images.throwingMolkky'))return fail('throwing molkky binding');
  if(!Array.isArray(pins)||pins.length!==12)return fail('12 pins');
  var numbers=pins.map(function(pin){return pin.n}).sort(function(a,b){return a-b}).join(',');if(numbers!=='1,2,3,4,5,6,7,8,9,10,11,12')return fail('pin numbers');
  var order=[[1,2],[3,10,4],[5,11,12,6],[7,9,8]],ys=[].concat.apply([],pins.map(function(pin){return[pin.y]})).filter(function(value,index,array){return array.indexOf(value)===index}).sort(function(a,b){return b-a}),got=ys.map(function(y){return pins.filter(function(pin){return pin.y===y}).sort(function(a,b){return a.x-b.x}).map(function(pin){return pin.n})});if(JSON.stringify(got)!==JSON.stringify(order))return fail('official formation');
  if(!OFFICIAL_FIELD||OFFICIAL_FIELD.initialDistanceM!==3.5||Math.abs((OFFICIAL_FIELD.molkkaariY-OFFICIAL_FIELD.initialPinY)/OFFICIAL_FIELD.worldUnitsPerMetre-3.5)>.001)return fail('official field');
  if(MolkkyContent.files().length<25)return fail('content files');
  CharacterManager.renderAll('normal');decodeImages(character.images,function(error){if(error)return fail(error.message);try{if(!MolkkyThrowView.assetReady())return fail('throwing molkky image');StageRuntime.draw(ctx,W,H);draw();pass()}catch(drawError){fail(drawError&&drawError.message?drawError.message:String(drawError))}})
}catch(error){fail(error&&error.message?error.message:String(error))}},250)})
})();
