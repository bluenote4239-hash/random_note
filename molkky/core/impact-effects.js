(function(){'use strict';
var game=document.getElementById('game'),base=document.getElementById('c');
if(!game||!base)return;
var layer=document.createElement('canvas');layer.id='impactFx';layer.width=1100;layer.height=720;game.appendChild(layer);
var g=layer.getContext('2d'),effects=[],running=0,targetPin=null,reduced=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var TAU=Math.PI*2;
function now(){return performance.now()}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function easeOut(t){return 1-Math.pow(1-t,3)}
function add(type,data,duration){effects.push(Object.assign({type:type,start:now(),duration:duration},data||{}));run()}
function run(){if(!running)running=requestAnimationFrame(frame)}
function frame(t){running=0;g.clearRect(0,0,1100,720);effects=effects.filter(function(e){var p=(t-e.start)/e.duration;if(p<0)return true;if(p>=1)return false;drawEffect(e,clamp(p,0,1));return true});drawTarget();if(effects.length)running=requestAnimationFrame(frame)}
function line(x1,y1,x2,y2,w,color,alpha){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.globalAlpha=1}
function radial(cx,cy,p,count,color,wide){
  g.save();g.translate(cx,cy);g.rotate(p*.08);
  for(var i=0;i<count;i++){
    var a=i/count*TAU+(i%3)*.013,r1=(wide?64:28)+(i%7)*5+p*55,r2=(wide?630:420)+(i%9)*13;
    var alpha=(1-p)*(.34+(i%4)*.1),w=(i%5===0?9:3)*(wide?1.25:1);
    line(Math.cos(a)*r1,Math.sin(a)*r1,Math.cos(a)*r2,Math.sin(a)*r2,w,color,alpha);
  }g.restore();
}
function bolt(a,b,p,seed){
  var dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,steps=7,pts=[a];
  for(var i=1;i<steps;i++){var q=i/steps,j=Math.sin(seed*12+i*8.7)*18*(1-p*.45);pts.push({x:a.x+dx*q+nx*j,y:a.y+dy*q+ny*j})}pts.push(b);
  g.save();g.lineJoin='miter';g.lineCap='square';
  for(var k=0;k<2;k++){g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.strokeStyle=k?'#fffbd1':'#ff2d8e';g.lineWidth=k?4:13;g.globalAlpha=(1-p)*(k?1:.68);g.stroke()}
  g.restore();g.globalAlpha=1;
}
function burst(cx,cy,p,strong){
  var r=(strong?130:90)*easeOut(p),points=18;g.save();g.translate(cx,cy);g.rotate(-p*.14);g.beginPath();
  for(var i=0;i<points*2;i++){var a=i/(points*2)*TAU,rr=i%2?r*.52:r*(.88+(i%5)*.08);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();
  g.fillStyle=strong?'#ff315d':'#ffe83d';g.globalAlpha=(1-p)*.72;g.fill();g.strokeStyle='#fffbd0';g.lineWidth=8;g.stroke();g.restore();g.globalAlpha=1;
}
function ring(cx,cy,p,strong){g.save();g.globalAlpha=1-p;g.strokeStyle=strong?'#ffef54':'#fff';g.lineWidth=(strong?15:9)*(1-p)+2;g.beginPath();g.ellipse(cx,cy,(strong?235:145)*easeOut(p),(strong?92:58)*easeOut(p),-.08,0,TAU);g.stroke();g.restore()}
function word(e,p){
  var s=e.strong?1.18:1,scale=(.45+easeOut(Math.min(1,p*2))*.55)*s,y=e.y-65-p*28;
  g.save();g.translate(e.x,y);g.rotate(e.angle||-.1);g.scale(scale,scale);g.textAlign='center';g.textBaseline='middle';
  g.font='1000 '+(e.strong?100:76)+'px Impact,Arial Black,sans-serif';g.lineJoin='round';g.globalAlpha=Math.min(1,p*7)*(1-Math.max(0,(p-.68)/.32));
  g.strokeStyle='#12061f';g.lineWidth=24;g.strokeText(e.label,0,0);g.strokeStyle=e.strong?'#ff276d':'#6931d4';g.lineWidth=14;g.strokeText(e.label,0,0);g.fillStyle='#fff35a';g.fillText(e.label,0,0);
  g.fillStyle='#fff';g.globalAlpha*=.78;g.font='1000 '+(e.strong?27:21)+'px Arial Black,sans-serif';g.fillText('IMPACT!!',0,e.strong?72:57);g.restore();g.globalAlpha=1;
}
function drawTarget(){
  if(!targetPin)return;var s;
  try{s=proj(targetPin.x,targetPin.y)}catch(e){return}
  var fy=s.y-52*s.k,rx=35*s.k,ry=24*s.k,labelY=fy-58*s.k;
  g.save();g.lineJoin='round';g.textAlign='center';g.textBaseline='middle';
  g.globalAlpha=.24;g.fillStyle='#22eaff';g.beginPath();g.ellipse(s.x,fy,rx+9,ry+7,0,0,TAU);g.fill();
  g.globalAlpha=1;g.strokeStyle='#101126';g.lineWidth=10;g.beginPath();g.ellipse(s.x,fy,rx+5,ry+4,0,0,TAU);g.stroke();
  g.strokeStyle='#fff36b';g.lineWidth=5;g.beginPath();g.ellipse(s.x,fy,rx+5,ry+4,0,0,TAU);g.stroke();
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){var x1=s.x+d[0]*(rx+13),y1=fy+d[1]*(ry+11),x2=s.x+d[0]*(rx+28),y2=fy+d[1]*(ry+24);line(x1,y1,x2,y2,5,'#22eaff',1)});
  g.fillStyle='#ffea35';g.strokeStyle='#150b29';g.lineWidth=8;g.beginPath();g.moveTo(s.x,labelY+24);g.lineTo(s.x-12,labelY+5);g.lineTo(s.x+12,labelY+5);g.closePath();g.stroke();g.fill();
  var text='TARGET '+targetPin.n,w=134,h=38,x=s.x-w/2,y=labelY-h;
  g.fillStyle='rgba(8,17,48,.94)';g.strokeStyle='#fff';g.lineWidth=8;g.beginPath();g.rect(x,y,w,h);g.stroke();g.fill();
  g.strokeStyle='#ff3b9e';g.lineWidth=4;g.strokeRect(x,y,w,h);g.font='1000 24px Arial Black,Arial,sans-serif';g.fillStyle='#fff36b';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(text,s.x,y+h/2+1);g.fillText(text,s.x,y+h/2+1);g.restore();
}
function drawEffect(e,p){
  if(e.type==='focus'){radial(e.x,e.y,p,reduced?18:54,'#fff9bc',true);return}
  if(e.type==='flash'){g.fillStyle=e.color||'#fff';g.globalAlpha=(1-p)*e.alpha;g.fillRect(0,0,1100,720);g.globalAlpha=1;return}
  if(e.type==='hit'){radial(e.x,e.y,p,reduced?20:(e.strong?76:48),e.strong?'#fff05c':'#fff',e.strong);burst(e.x,e.y,p,e.strong);ring(e.x,e.y,p,e.strong);return}
  if(e.type==='bolt'){bolt(e.a,e.b,p,e.seed);return}
  if(e.type==='word'){word(e,p);return}
  if(e.type==='miss'){g.save();g.globalAlpha=1-p;g.fillStyle='#d8efff';g.strokeStyle='#10284d';g.lineWidth=10;g.textAlign='center';g.font='1000 56px Arial Black,sans-serif';g.strokeText('スカッ…',e.x,e.y-p*18);g.fillText('スカッ…',e.x,e.y-p*18);g.restore()}
}
function shake(strong){var cls=strong?'fx-crush':'fx-hit';game.classList.remove('fx-hit','fx-crush');void game.offsetWidth;game.classList.add(cls);setTimeout(function(){game.classList.remove(cls)},strong?360:240)}
function mark(kind){layer.dataset.last=kind;layer.dataset.count=String((Number(layer.dataset.count)||0)+1)}
function focus(p){mark('focus');add('focus',{x:p.x,y:p.y},reduced?220:520)}
function contact(p,strong){mark('contact');add('flash',{alpha:strong?.72:.48,color:strong?'#fff8b5':'#fff'},90);add('hit',{x:p.x,y:p.y,strong:strong},strong?650:480);shake(strong)}
function scoreFx(p,fallen){
  mark('score');
  var strong=fallen.length>=4,label=fallen.length>=4?'ドッカーン!!':fallen.length>=2?'バキバキィ!!':fallen[0]&&fallen[0].n>=8?'ズギャァン!!':'ズバァン!!';
  var x=clamp(p.x,235,865),y=clamp(p.y,220,555);add('word',{x:x,y:y,label:label,strong:strong,angle:fallen.length%2?-.12:.08},strong?920:760);
  fallen.forEach(function(pin,i){var s=typeof proj==='function'?proj(pin.x,pin.y):p;add('bolt',{a:p,b:s,seed:i+pin.n*.17},strong?560:400)});
  if(strong)add('flash',{alpha:.35,color:'#ff296d'},180);
}
function miss(p){mark('miss');add('miss',{x:clamp(p.x,150,950),y:clamp(p.y,160,590)},520)}
window.ImpactEffects={focus:focus,contact:contact,score:scoreFx,miss:miss};layer.dataset.ready='true';

function aimPoint(){try{return proj(aim.x,aim.y)}catch(e){return{x:550,y:400}}}
var centerMsg=document.getElementById('centerMsg'),logBox=document.getElementById('log'),lastLog='';
if(centerMsg)new MutationObserver(function(){
  var text=centerMsg.textContent||'',p=aimPoint();
  if(text==='THROW!')focus(p);
  else if(text==='MISS!!')miss(p);
}).observe(centerMsg,{childList:true,characterData:true,subtree:true});
if(logBox)new MutationObserver(function(){
  var first=(logBox.textContent||'').split('\n')[0];if(first===lastLog||first.indexOf('FALLEN ')!==0)return;lastLog=first;
  var m=first.match(/^FALLEN ([0-9,]+) \+/);if(!m)return;
  var ids=m[1].split(',').map(Number),fallen=[];try{fallen=pins.filter(function(pin){return ids.indexOf(pin.n)>=0})}catch(e){}
  if(!fallen.length)return;var sx=0,sy=0;fallen.forEach(function(pin){var p=proj(pin.x,pin.y);sx+=p.x;sy+=p.y});var hit={x:sx/fallen.length,y:sy/fallen.length};
  contact(hit,fallen.length>=4);scoreFx(hit,fallen);
}).observe(logBox,{childList:true,characterData:true,subtree:true});
function setTargetFromPointer(e){
  try{if(phase!==0||busy)return;var r=base.getBoundingClientRect(),wx=(e.clientX-r.left)*1100/r.width,wy=(e.clientY-r.top)*720/r.height;
    var live=pins.filter(function(pin){return pin.state!=='fallen'});if(!live.length)return;
    live.sort(function(a,b){return Math.hypot(a.x-wx,a.y-wy)-Math.hypot(b.x-wx,b.y-wy)});targetPin=live[0];layer.dataset.target=String(targetPin.n);run();
  }catch(err){}
}
base.addEventListener('mousemove',setTargetFromPointer,{passive:true});
var turnBox=document.getElementById('turn');if(turnBox)new MutationObserver(function(){targetPin=null;delete layer.dataset.target;run()}).observe(turnBox,{childList:true,characterData:true,subtree:true});
})();
