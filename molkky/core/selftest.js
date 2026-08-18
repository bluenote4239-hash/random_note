(function(){'use strict';
function fail(m){console.error('SELFTEST FAIL',m);var e=document.getElementById('log');if(e)e.textContent='SELFTEST FAIL: '+m}
function pass(){var e=document.getElementById('log');if(e)e.textContent='SELFTEST PASS / READY';console.log('SELFTEST PASS')}
window.addEventListener('load',function(){setTimeout(function(){try{
if(!window.CharacterManager||CharacterManager.list().length!==1)return fail('character registry');
if(!window.StageManager||StageManager.list().length!==1)return fail('stage registry');
if(!window.AudioManager||!window.AudioRuntime)return fail('audio runtime');
if(!window.PresentationRuntime||!window.StageRuntime)return fail('presentation/stage runtime');
var ch=CharacterManager.get(),st=StageManager.get();if(!ch||ch.id!=='gal01')return fail('active character');if(!st||st.id!=='seaside90s'||st.bgm!=='ievan_v29')return fail('active stage/BGM');
var vs=AudioManager.getVoices(ch.voiceSet),se=AudioManager.getSe('default');if(!vs||vs.items.length!==8)return fail('voice set');if(!se||!se.wood||!se.whoosh||!se.land)return fail('SE set');if(typeof AudioManager.startBgm!=='function')return fail('physical BGM runtime');
if(!Array.isArray(pins)||pins.length!==12)return fail('12 pins');var nums=pins.map(function(p){return p.n}).sort(function(a,b){return a-b}).join(',');if(nums!=='1,2,3,4,5,6,7,8,9,10,11,12')return fail('pin numbers');
var order=[[1,2],[3,10,4],[5,11,12,6],[7,9,8]],ys=[].concat.apply([],pins.map(function(p){return[p.y]})).filter(function(v,i,a){return a.indexOf(v)===i}).sort(function(a,b){return b-a}),got=ys.map(function(y){return pins.filter(function(p){return p.y===y}).sort(function(a,b){return a.x-b.x}).map(function(p){return p.n})});if(JSON.stringify(got)!==JSON.stringify(order))return fail('official formation');
CharacterManager.renderAll('normal');var icon=document.getElementById('galIcon'),full=document.getElementById('galFull'),cut=document.getElementById('cutinImg');if(!icon.style.backgroundImage||icon.style.backgroundImage==='none')return fail('icon visual');if(!full.style.backgroundImage||full.style.backgroundImage==='none')return fail('full visual');if(!cut.style.backgroundImage||cut.style.backgroundImage==='none')return fail('cutin visual');
StageRuntime.draw(ctx,W,H);draw();pass()
}catch(e){fail(e&&e.message?e.message:String(e))}},250)})})();