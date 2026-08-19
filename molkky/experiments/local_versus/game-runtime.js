if(!window.MolkkyContent)throw Error('MolkkyContent missing');
if(!window.MolkkyThrowStyles)throw Error('MolkkyThrowStyles missing');
const T=(path,vars)=>MolkkyContent.text(path,vars),c=document.getElementById('c'),ctx=c.getContext('2d');
c.width=1100;c.height=720;
const W=c.width,H=c.height,$=id=>document.getElementById(id),gameRoot=document.getElementById('game');
const ui={score:$('score'),turn:$('turn'),miss:$('miss'),pf:$('pf'),af:$('af'),pv:$('pv'),av:$('av'),msg:$('centerMsg'),bubble:$('galBubble'),icon:$('galIcon'),cutin:$('cutin'),cutinImg:$('cutinImg'),cutinText:$('cutinText'),log:$('log'),go:$('gameover'),goTitle:$('goTitle'),goText:$('goText')};
const FIELD_Y_SHIFT=80;
let pins=[],score=0,misses=0,turn=1,phase=0,meter=0,dir=1,power=0,accuracy=.5,raf=0,busy=false,aim={x:550,y:330+FIELD_Y_SHIFT},projectile=null,lockedTarget=null,shotStyle=MolkkyThrowStyles.get('standard'),shotForce=0;
const OFFICIAL_FIELD=Object.freeze({initialDistanceM:3.5,initialPinY:425+FIELD_Y_SHIFT,molkkaariY:690+FIELD_Y_SHIFT,throwOriginY:720+FIELD_Y_SHIFT,worldUnitsPerMetre:(690-425)/3.5,molkkaariDrawWidth:156,molkkaariDrawHeight:68});
const PIN_RENDER=Object.freeze({sourceWidth:72,sourceHeight:144,width:56,height:112,top:-70,shadowY:40,targetScale:1.35,targetDistance:118});
const pinFiles=MolkkyContent.required('images.skittles');
const pinSprites=Array.from({length:13},(_,n)=>{if(!n)return null;let img=new Image();img.decoding='async';img.onload=()=>draw();img.src=pinFiles[n-1];return img});
const molkkaariSprite=new Image();molkkaariSprite.decoding='async';molkkaariSprite.onload=()=>draw();molkkaariSprite.src=MolkkyContent.required('images.molkkaari');
const throwingMolkkySprite=new Image();throwingMolkkySprite.decoding='async';throwingMolkkySprite.onload=()=>{gameRoot.dataset.throwingMolkky='ready';draw()};throwingMolkkySprite.src=MolkkyContent.required('images.throwingMolkky');
function setGal(e,t){return PresentationRuntime.setGal(e,t)}
function flash(t,ms=650){ui.msg.textContent=t;ui.msg.classList.add('show');setTimeout(()=>ui.msg.classList.remove('show'),ms)}
function cutin(k,l,e='joy',ms=850){return PresentationRuntime.cutin(k,l,e,ms)}
function lg(t){ui.log.textContent=(t+'\n'+ui.log.textContent).slice(0,900)}
function clamp(value,min=0,max=1){return Math.max(min,Math.min(max,value))}
function officialSetup(){pins=[];let r=[[[1,-36],[2,36]],[[3,-72],[10,0],[4,72]],[[5,-108],[11,-36],[12,36],[6,108]],[[7,-72],[9,0],[8,72]]];r.forEach((row,ri)=>row.forEach(([n,dx])=>pins.push({n,x:550+dx,y:OFFICIAL_FIELD.initialPinY-ri*60,state:'standing',rot:0,lean:0})))}
function clearTarget(){lockedTarget=null;gameRoot.dataset.targetZoom='none'}
function resetGame(){officialSetup();score=0;misses=0;turn=1;phase=0;meter=0;busy=false;projectile=null;shotStyle=MolkkyThrowStyles.get('standard');shotForce=0;clearTarget();MolkkyThrowStyles.lock(false);ui.go.classList.remove('show');ui.pf.style.width=ui.af.style.width='0';ui.pv.textContent=ui.av.textContent='0';setGal('normal',T('game.resetCoach'));update();draw()}
function update(){ui.score.textContent=score;ui.turn.textContent=T('ui.turn',{turn:turn});ui.miss.textContent=T('ui.miss',{misses:misses})}
function proj(px,py){let k=.72+py/920;return{x:px+(py-360)*.055,y:90+py*.77,k}}
function drawMolkkaari(){let s=proj(550,OFFICIAL_FIELD.molkkaariY),w=OFFICIAL_FIELD.molkkaariDrawWidth,h=OFFICIAL_FIELD.molkkaariDrawHeight;ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.k,s.k);ctx.imageSmoothingEnabled=false;ctx.fillStyle='rgba(31,20,11,.28)';ctx.beginPath();ctx.ellipse(0,h*.36,w*.51,h*.13,0,0,6.28);ctx.fill();if(molkkaariSprite.complete&&molkkaariSprite.naturalWidth)ctx.drawImage(molkkaariSprite,-w/2,-h/2,w,h);ctx.restore()}
function nearestTarget(){
  if(lockedTarget&&lockedTarget.state!=='fallen')return lockedTarget;
  let candidates=pins.filter(p=>p.state!=='fallen').map(p=>({pin:p,d:Math.hypot(p.x-aim.x,p.y-aim.y)})).sort((a,b)=>a.d-b.d);
  return candidates[0]&&candidates[0].d<=PIN_RENDER.targetDistance?candidates[0].pin:null
}
function drawPin(p,target){
  let s=proj(p.x,p.y),img=pinSprites[p.n],r=PIN_RENDER;
  ctx.save();ctx.translate(s.x,s.y);
  if(target){ctx.shadowColor=MolkkyThrowStyles.current().color;ctx.shadowBlur=24;ctx.fillStyle='rgba(255,243,79,.25)';ctx.beginPath();ctx.ellipse(4,2,48*s.k,72*s.k,0,0,6.28);ctx.fill();ctx.shadowBlur=0}
  ctx.scale(s.k*(target?r.targetScale:1),s.k*(target?r.targetScale:1));ctx.fillStyle='rgba(31,20,11,.24)';ctx.beginPath();ctx.ellipse(8,r.shadowY+3,29,6,0,0,6.28);ctx.fill();ctx.fillStyle='rgba(35,19,9,.68)';ctx.fillRect(-22,r.shadowY-2,44,5);ctx.rotate(p.state==='leaning'?p.lean:p.rot);ctx.imageSmoothingEnabled=false;
  if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,0,0,r.sourceWidth,r.sourceHeight,-r.width/2,r.top,r.width,r.height);
  else{ctx.fillStyle='#c98f43';ctx.strokeStyle='#5e3916';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-26,-42);ctx.lineTo(7,-70);ctx.lineTo(26,-53);ctx.lineTo(26,42);ctx.lineTo(-26,42);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#efd18b';ctx.beginPath();ctx.ellipse(0,-52,28,13,-.52,0,6.28);ctx.fill();ctx.fillStyle='#54270f';ctx.font='1000 20px monospace';ctx.textAlign='center';ctx.fillText(p.n,0,-47)}
  if(p.state==='standing'){ctx.fillStyle='rgba(74,39,16,.92)';ctx.fillRect(-22,39,44,3)}
  if(target){ctx.rotate(-(p.state==='leaning'?p.lean:p.rot));ctx.fillStyle='#fff34f';ctx.strokeStyle='#12152d';ctx.lineWidth=5;ctx.font='1000 16px Impact,Arial Black,sans-serif';ctx.textAlign='center';ctx.strokeText(T('game.targetNumber',{target:p.n}),0,-82);ctx.fillText(T('game.targetNumber',{target:p.n}),0,-82)}
  ctx.restore()
}
function drawAim(target){let a=proj(aim.x,aim.y),style=MolkkyThrowStyles.current();ctx.save();ctx.strokeStyle=style.color;ctx.lineWidth=3;ctx.setLineDash(target?[7,4]:[]);ctx.beginPath();ctx.ellipse(a.x,a.y,target?29:22,target?17:13,0,0,6.28);ctx.stroke();ctx.restore()}
function drawBaton(s,angle,scale,color){
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.shadowColor=color;ctx.shadowBlur=12;ctx.imageSmoothingEnabled=true;
  if(throwingMolkkySprite.complete&&throwingMolkkySprite.naturalWidth)ctx.drawImage(throwingMolkkySprite,-61,-18,122,36);
  else{ctx.fillStyle='#cb8b45';ctx.strokeStyle='#4d2814';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-54,-14);ctx.lineTo(54,-14);ctx.quadraticCurveTo(64,0,54,14);ctx.lineTo(-54,14);ctx.quadraticCurveTo(-64,0,-54,-14);ctx.fill();ctx.stroke()}
  ctx.restore()
}
function drawThrowingMolkky(){
  if(projectile){let t=projectile.t,x=projectile.a.x+(projectile.b.x-projectile.a.x)*t,y=projectile.a.y+(projectile.b.y-projectile.a.y)*t-Math.sin(Math.PI*t)*projectile.arc,s=proj(x,y),scale=.72+s.k*.42;drawBaton(s,-.35+t*Math.PI*5.4,scale,projectile.style.color);return}
  if(phase<3){let s=proj(550,OFFICIAL_FIELD.throwOriginY-12);drawBaton({x:s.x,y:Math.min(H-15,s.y)},-.22,.92,MolkkyThrowStyles.current().color)}
}
function draw(){
  StageRuntime.draw(ctx,W,H);drawMolkkaari();let target=nearestTarget();gameRoot.dataset.targetZoom=target?String(target.n):'none';let ordered=pins.slice().sort((a,b)=>a.y-b.y);ordered.filter(p=>p!==target).forEach(p=>drawPin(p,false));if(target)drawPin(target,true);drawAim(target);drawThrowingMolkky()
}
function ml(){cancelAnimationFrame(raf);meter=0;dir=1;let f=()=>{meter+=dir*.018;if(meter>=1){meter=1;dir=-1}if(meter<=0){meter=0;dir=1}if(phase===1){ui.pf.style.width=meter*100+'%';ui.pv.textContent=Math.round(meter*100)}if(phase===2){ui.af.style.width=meter*100+'%';ui.av.textContent=Math.round(meter*100)}raf=requestAnimationFrame(f)};f()}
function action(){
  if(busy)return;AudioManager.resume().catch(()=>{});AudioRuntime.startBgm().catch(()=>{});
  if(phase===0){lockedTarget=nearestTarget();MolkkyThrowStyles.lock(true);phase=1;flash(T('game.power'));ml();draw();return}
  if(phase===1){power=meter;phase=2;flash(T('game.accuracy'));ml();return}
  if(phase===2){accuracy=meter;cancelAnimationFrame(raf);launch()}
}
function launch(styleOverride){
  busy=true;phase=3;shotStyle=styleOverride||MolkkyThrowStyles.current();shotForce=clamp(power*shotStyle.forceScale+shotStyle.forceBias);gameRoot.dataset.lastThrowStyle=shotStyle.id;gameRoot.dataset.throwingMolkky='flight';AudioRuntime.whoosh();flash(T('game.throw'));
  let q=1-Math.abs(accuracy-.5)*2,e=(1-q)*(24+shotForce*58)*shotStyle.scatter,a=Math.random()*6.28,ix=aim.x+Math.cos(a)*e,iy=aim.y+Math.sin(a)*e;
  projectile={a:{x:550,y:OFFICIAL_FIELD.throwOriginY},b:{x:ix,y:iy},t:0,arc:(90+shotForce*115)*shotStyle.arc,style:shotStyle};let st=performance.now();
  function frame(now){projectile.t=Math.min(1,(now-st)/shotStyle.duration);draw();if(projectile.t<1)requestAnimationFrame(frame);else{projectile=null;gameRoot.dataset.throwingMolkky='ready';impact(ix,iy,shotStyle,shotForce)}}requestAnimationFrame(frame)
}
function impact(ix,iy,style,force){
  let standing=pins.filter(p=>p.state!=='fallen'),candidates=standing.map(p=>({p,d:Math.hypot(p.x-ix,p.y-iy)})).sort((a,b)=>a.d-b.d),hit=[];
  if(candidates[0]&&candidates[0].d<(24+force*32)*style.hitRadius)hit=[candidates[0].p];
  if(!hit.length){resolve([],[],ix,iy,new Map(),style,force);return}
  AudioRuntime.wood(1.25);let seen=new Set(hit),queue=[...hit],levels=new Map(hit.map(p=>[p,0]));
  while(queue.length){let source=queue.shift(),level=levels.get(source),near=standing.filter(p=>!seen.has(p)&&Math.hypot(p.x-source.x,p.y-source.y)<(41+force*20)*style.chainRadius).slice(0,force>.72||style.id==='smash'?2:1);for(let p of near)if(Math.random()<clamp((.42+force*.38)*style.chainChance)){seen.add(p);hit.push(p);levels.set(p,level+1);queue.push(p)}}
  let fallen=[],leaning=[];hit.forEach(p=>(Math.random()<clamp(.70+force*.24+style.fallBonus-(levels.get(p)||0)*.07)?fallen:leaning).push(p));resolve(fallen,leaning,ix,iy,levels,style,force)
}
function resolve(f,l,ix,iy,L=new Map(),style=shotStyle,force=shotForce){
  if(!f.length){misses++;setGal(misses===2?'thinking':'regret',T(misses===2?'game.missDanger':'game.missFirst'));flash(T('game.missFlash'));if(misses===2)cutin('danger',T('game.missCrisis'),'thinking');if(misses>=3){cutin('loss',T('game.disqualifiedTitle'),'regret',1200);setTimeout(()=>end(T('game.disqualifiedTitle'),T('game.disqualifiedText')),700)}finish();return}
  misses=0;f.forEach((p,i)=>setTimeout(()=>{p.state='fallen';p.rot=(Math.random()>.5?1:-1)*1.35;AudioRuntime.wood(.72);AudioRuntime.land();AudioRuntime.voice(80);draw()},(L.get(p)||0)*85+i*15));l.forEach(p=>{p.state='leaning';p.lean=(Math.random()>.5?1:-1)*.48});let pts=f.length===1?f[0].n:f.length;score+=pts;
  if(f.length===1){setGal('normal',T('game.singleHit'));if(pts>=8)cutin('long',T('game.longShot'),'surprise')}else if(f.length>=4){setGal('joy',T('game.multiHit'));cutin('smash',T('game.smash'),'joy')}else{setGal('joy',T('game.multiHit'));cutin('chain',T('game.chain'),'joy')}
  flash(T('game.points',{points:pts}));lg(T('game.fallenLog',{pins:f.map(p=>p.n),points:pts}));if(score>50){score=25;cutin('danger',T('game.over50'),'thinking');setGal('thinking',T('game.over50Coach'))}update();
  if(score===50){cutin('win',T('game.perfectCutin'),'joy',1400);setGal('joy',T('game.perfectCoach'));AudioRuntime.voice(120);setTimeout(()=>end(T('game.perfectTitle'),T('game.perfectText')),850);return}
  setTimeout(()=>{f.forEach(p=>{let dx=p.x-ix,dy=p.y-iy,n=Math.hypot(dx,dy)||1,d=(20+force*46+Math.random()*18)*style.travel;p.x=Math.max(75,Math.min(1025,p.x+dx/n*d));p.y=Math.max(150,Math.min(595,p.y+dy/n*d));p.state='standing';p.rot=0});finish()},1100)
}
function finish(){turn++;phase=0;meter=0;ui.pf.style.width=ui.af.style.width='0';ui.pv.textContent=ui.av.textContent='0';busy=false;clearTarget();MolkkyThrowStyles.lock(false);update();draw()}
function end(t,x){busy=true;MolkkyThrowStyles.lock(true);ui.goTitle.textContent=t;ui.goText.textContent=x;ui.go.classList.add('show')}
c.addEventListener('mousemove',e=>{if(phase||busy)return;let r=c.getBoundingClientRect();aim.x=(e.clientX-r.left)*W/r.width;aim.y=(e.clientY-r.top)*H/r.height;draw()});
c.addEventListener('click',action);
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();action()}});
window.MolkkyThrowView={target:function(){let p=nearestTarget();return p?p.n:null},style:function(){return MolkkyThrowStyles.current().id},assetReady:function(){return !!throwingMolkkySprite.naturalWidth}};
window.resetGame=resetGame;resetGame();
