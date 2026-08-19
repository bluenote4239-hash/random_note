(function(){'use strict';
if(!window.MolkkyContent)throw Error('MolkkyContent missing');
var T=function(path,vars){return MolkkyContent.text(path,vars)};
var setup=document.getElementById('matchSetup'),form=document.getElementById('matchSetupForm'),changePlayers=document.getElementById('changePlayers'),turnCall=document.getElementById('turnCall');
if(!setup||!form||!turnCall)return;
var gameRoot=document.getElementById('game'),nameInputs=[document.getElementById('playerInput0'),document.getElementById('playerInput1')],modeInputs=Array.from(document.querySelectorAll('input[name="opponentMode"]'));
var baseReset=resetGame,baseUpdate=update,baseFinish=finish,baseEnd=end;
var players=[makePlayer(T('match.player1'),'human'),makePlayer(T('match.cpuName'),'cpu')],active=0,started=false,ended=false,throwCount=1,opponentMode='cpu',callTimer=0,cpuTimers=[];
function makePlayer(name,kind){return{name:name,kind:kind||'human',score:0,misses:0,disqualified:false}}
function cleanName(value,fallback){value=String(value||'').replace(/[<>]/g,'').trim().slice(0,12);return value||fallback}
function settleViewport(){
  var focused=document.activeElement;if(focused&&typeof focused.blur==='function')focused.blur();
  function top(){var root=document.getElementById('game');if(root){root.scrollTop=0;root.scrollLeft=0}try{scrollTo(0,0)}catch(e){}}
  top();requestAnimationFrame(top);setTimeout(top,260);
}
function recordActive(){if(!started||!players[active])return;players[active].score=score;players[active].misses=misses}
function loadActive(){score=players[active].score;misses=players[active].misses}
function settleSharedBoard(){
  var corrected=[];
  pins.forEach(function(pin){
    if(pin.state!=='standing'||pin.rot||pin.lean){corrected.push(pin.n);pin.state='standing';pin.rot=0;pin.lean=0}
  });
  gameRoot.dataset.boardRecovery=corrected.length?'upright:'+corrected.join(','):'ready';
  return pins.every(function(pin){return pin.state==='standing'&&!pin.rot&&!pin.lean})
}
function isCpuTurn(){return started&&!ended&&active===1&&opponentMode==='cpu'}
function later(fn,ms){var id=setTimeout(function(){cpuTimers=cpuTimers.filter(function(value){return value!==id});fn()},ms);cpuTimers.push(id);return id}
function cancelCpu(){cpuTimers.forEach(clearTimeout);cpuTimers=[];gameRoot.classList.remove('cpu-turn');document.getElementById('playerCard1').classList.remove('cpu-active')}
function selectedMode(){var checked=modeInputs.find(function(input){return input.checked});return checked&&checked.value==='human'?'human':'cpu'}
function syncModeSetup(){
  var mode=selectedMode(),cpu=mode==='cpu',input=nameInputs[1],cpuName=T('match.cpuName');input.disabled=cpu;if(cpu)input.value=cpuName;else if(input.value===cpuName)input.value=T('match.player2');
  document.getElementById('setupSide1').textContent=T(cpu?'setup.cpuSide':'setup.twoSide')
}
function showCpuTarget(plan){
  try{var s=proj(plan.target.x,plan.target.y),rect=c.getBoundingClientRect(),clientX=rect.left+s.x*rect.width/W,clientY=rect.top+s.y*rect.height/H;busy=false;c.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:clientX,clientY:clientY}));c.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:clientX,clientY:clientY}));busy=true}catch(e){busy=true}
}
function runCpuTurn(){
  if(!isCpuTurn())return;var plan=window.MolkkyCpuEasy&&MolkkyCpuEasy.plan(pins);if(!plan){busy=false;return}
  gameRoot.dataset.cpuState='thinking';gameRoot.dataset.cpuTarget=String(plan.target.n);gameRoot.classList.add('cpu-turn');document.getElementById('playerCard1').classList.add('cpu-active');busy=true;phase=0;setGal('thinking',T('match.cpuThought'));
  later(function(){if(!isCpuTurn())return;showCpuTarget(plan);aim.x=plan.aim.x;aim.y=plan.aim.y;draw();flash('CPU AIM');setGal('surprise',T('match.cpuTarget',{target:plan.target.n}));
    later(function(){if(!isCpuTurn())return;phase=1;power=plan.power;meter=power;ui.pf.style.width=power*100+'%';ui.pv.textContent=Math.round(power*100);flash('CPU POWER');
      later(function(){if(!isCpuTurn())return;phase=2;accuracy=plan.accuracy;meter=accuracy;ui.af.style.width=accuracy*100+'%';ui.av.textContent=Math.round(accuracy*100);flash('CPU ACCURACY');
        later(function(){if(!isCpuTurn())return;gameRoot.dataset.cpuState='throw';AudioRuntime.startBgm().catch(function(){});launch()},360)
      },360)
    },360)
  },plan.thinkMs)
}
function scheduleCpu(){if(!isCpuTurn())return;busy=true;callTurn(T('match.cpuThinking'));runCpuTurn()}
function render(){
  players.forEach(function(player,i){
    var card=document.getElementById('playerCard'+i),name=document.getElementById('playerName'+i),points=document.getElementById('playerScore'+i),miss=document.getElementById('playerMiss'+i);
    name.textContent=player.name;points.textContent=player.score;miss.textContent=player.disqualified?'DISQUALIFIED':'MISS × '+player.misses;
    card.classList.toggle('active',started&&!ended&&i===active);card.classList.toggle('danger',!player.disqualified&&player.misses===2);card.classList.toggle('out',player.disqualified);
  });
  document.getElementById('roundLabel').textContent=T('match.throwCount',{count:throwCount});
  document.getElementById('playerSide1').textContent=T(opponentMode==='cpu'?'setup.cpuSide':'setup.twoSide');document.getElementById('matchModeLabel').textContent=T(opponentMode==='cpu'?'match.cpuBattle':'match.localVersus');
  document.getElementById('game').dataset.activePlayer=String(active+1);
  document.getElementById('game').dataset.opponentMode=opponentMode;
}
function callTurn(message){
  clearTimeout(callTimer);turnCall.classList.remove('show');void turnCall.offsetWidth;
  turnCall.querySelector('b').textContent=players[active].name;turnCall.querySelector('span').textContent=message||T('match.sideThrow',{side:active+1});turnCall.classList.add('show');
  callTimer=setTimeout(function(){turnCall.classList.remove('show')},740);
}
function begin(names,mode){
  cancelCpu();opponentMode=mode==='human'?'human':'cpu';players=[makePlayer(cleanName(names[0],T('match.player1')),'human'),makePlayer(opponentMode==='cpu'?T('match.cpuName'):cleanName(names[1],T('match.player2')),opponentMode)];active=0;throwCount=1;started=true;ended=false;
  settleViewport();setup.classList.remove('show');gameRoot.classList.remove('match-setup-open');baseReset();loadActive();baseUpdate();render();busy=false;AudioRuntime.startBgm().catch(function(){});callTurn(T('match.sideThrow',{side:1}));setTimeout(function(){setGal('joy',T('match.opening',{player:players[0].name}))},0);
}
function showSetup(){cancelCpu();ended=false;started=false;busy=true;ui.go.classList.remove('show');gameRoot.classList.add('match-setup-open');setup.classList.add('show');nameInputs[0].value=players[0].name;modeInputs.forEach(function(input){input.checked=input.value===opponentMode});nameInputs[1].value=opponentMode==='cpu'?T('match.cpuName'):players[1].name;syncModeSetup();render()}
update=function(){baseUpdate();recordActive();render()};
finish=function(){
  cancelCpu();
  settleSharedBoard();
  recordActive();
  if(players[active].misses>=3){players[active].disqualified=true;ended=true;busy=true;phase=0;meter=0;ui.pf.style.width=ui.af.style.width='0';ui.pv.textContent=ui.av.textContent='0';baseUpdate();render();draw();return}
  active=active?0:1;loadActive();throwCount++;baseFinish();render();callTurn(T('match.sideThrow',{side:active+1}));setTimeout(function(){setGal(players[active].misses===2?'thinking':'normal',T(players[active].misses===2?'match.turnDanger':'match.turnSafe',{player:players[active].name}))},0);
  scheduleCpu();
};
end=function(title,text){
  cancelCpu();recordActive();ended=true;busy=true;
  var winner,loser;
  if(players[0].disqualified||players[1].disqualified){loser=players[0].disqualified?players[0]:players[1];winner=players[0].disqualified?players[1]:players[0];baseEnd(T('match.winTitle',{winner:winner.name}),T('match.disqualified',{loser:loser.name,winnerScore:winner.score,loserScore:loser.score}))}
  else{winner=players[active];baseEnd(T('match.winTitle',{winner:winner.name}),T('match.perfect',{winner:winner.name,p1:players[0].name,p1Score:players[0].score,p2Score:players[1].score,p2:players[1].name}))}
  render();
};
resetGame=function(){if(!started){showSetup();return}begin([players[0].name,players[1].name],opponentMode)};
window.resetGame=resetGame;
form.addEventListener('submit',function(e){e.preventDefault();begin([nameInputs[0].value,nameInputs[1].value],selectedMode())});
changePlayers.addEventListener('click',function(e){e.preventDefault();showSetup()});
modeInputs.forEach(function(input){input.addEventListener('change',syncModeSetup)});nameInputs[0].value=players[0].name;nameInputs[1].value=players[1].name;syncModeSetup();
nameInputs.forEach(function(input){input.addEventListener('keydown',function(e){if(e.code==='Space')e.stopPropagation()})});setup.dataset.spaceGuard='true';
window.LocalVersus={
  start:function(a,b,mode){begin([a,b],mode)},
  showSetup:showSetup,
  snapshot:function(){recordActive();return{started:started,ended:ended,activePlayer:active+1,throwCount:throwCount,opponentMode:opponentMode,cpuPending:cpuTimers.length>0,boardReady:pins.every(function(p){return p.state==='standing'&&!p.rot&&!p.lean}),players:players.map(function(p){return Object.assign({},p)}),pinBoard:pins.map(function(p){return{n:p.n,x:p.x,y:p.y,state:p.state,rot:p.rot,lean:p.lean}})}}
};
busy=true;gameRoot.classList.add('match-setup-open');render();setup.classList.add('show');
})();
