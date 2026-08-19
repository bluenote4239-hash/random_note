(function(){'use strict';
var setup=document.getElementById('matchSetup'),form=document.getElementById('matchSetupForm'),changePlayers=document.getElementById('changePlayers'),turnCall=document.getElementById('turnCall');
if(!setup||!form||!turnCall)return;
var gameRoot=document.getElementById('game'),nameInputs=[document.getElementById('playerInput0'),document.getElementById('playerInput1')];
var baseReset=resetGame,baseUpdate=update,baseFinish=finish,baseEnd=end;
var players=[makePlayer('PLAYER 1'),makePlayer('PLAYER 2')],active=0,started=false,ended=false,throwCount=1,callTimer=0;
function makePlayer(name){return{name:name,score:0,misses:0,disqualified:false}}
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
function render(){
  players.forEach(function(player,i){
    var card=document.getElementById('playerCard'+i),name=document.getElementById('playerName'+i),points=document.getElementById('playerScore'+i),miss=document.getElementById('playerMiss'+i);
    name.textContent=player.name;points.textContent=player.score;miss.textContent=player.disqualified?'DISQUALIFIED':'MISS × '+player.misses;
    card.classList.toggle('active',started&&!ended&&i===active);card.classList.toggle('danger',!player.disqualified&&player.misses===2);card.classList.toggle('out',player.disqualified);
  });
  document.getElementById('roundLabel').textContent='THROW '+throwCount;
  document.getElementById('game').dataset.activePlayer=String(active+1);
}
function callTurn(message){
  clearTimeout(callTimer);turnCall.classList.remove('show');void turnCall.offsetWidth;
  turnCall.querySelector('b').textContent=players[active].name;turnCall.querySelector('span').textContent=message||((active+1)+'P THROW');turnCall.classList.add('show');
  callTimer=setTimeout(function(){turnCall.classList.remove('show')},740);
}
function begin(names){
  players=[makePlayer(cleanName(names[0],'PLAYER 1')),makePlayer(cleanName(names[1],'PLAYER 2'))];active=0;throwCount=1;started=true;ended=false;
  settleViewport();setup.classList.remove('show');gameRoot.classList.remove('match-setup-open');baseReset();loadActive();baseUpdate();render();busy=false;callTurn('1P THROW');setTimeout(function(){setGal('joy',players[0].name+'から！ぶっ倒してこー！')},0);
}
function showSetup(){ended=false;started=false;busy=true;ui.go.classList.remove('show');gameRoot.classList.add('match-setup-open');setup.classList.add('show');document.getElementById('playerInput0').value=players[0].name;document.getElementById('playerInput1').value=players[1].name;render()}
update=function(){baseUpdate();recordActive();render()};
finish=function(){
  settleSharedBoard();
  recordActive();
  if(players[active].misses>=3){players[active].disqualified=true;ended=true;busy=true;phase=0;meter=0;ui.pf.style.width=ui.af.style.width='0';ui.pv.textContent=ui.av.textContent='0';baseUpdate();render();draw();return}
  active=active?0:1;loadActive();throwCount++;baseFinish();render();callTurn((active+1)+'P THROW');setTimeout(function(){setGal(players[active].misses===2?'thinking':'normal',players[active].name+'の番！'+(players[active].misses===2?'次は外せないよ！':'狙ってこ！'))},0);
};
end=function(title,text){
  recordActive();ended=true;busy=true;
  var winner,loser;
  if(players[0].disqualified||players[1].disqualified){loser=players[0].disqualified?players[0]:players[1];winner=players[0].disqualified?players[1]:players[0];baseEnd(winner.name+' WIN!',loser.name+'が3投連続ミスで失格　'+winner.score+' - '+loser.score)}
  else{winner=players[active];baseEnd(winner.name+' WIN!',winner.name+'が50点ジャスト！　'+players[0].name+' '+players[0].score+' - '+players[1].score+' '+players[1].name)}
  render();
};
resetGame=function(){if(!started){showSetup();return}begin([players[0].name,players[1].name])};
window.resetGame=resetGame;
form.addEventListener('submit',function(e){e.preventDefault();begin([document.getElementById('playerInput0').value,document.getElementById('playerInput1').value])});
changePlayers.addEventListener('click',function(e){e.preventDefault();showSetup()});
nameInputs.forEach(function(input){input.addEventListener('keydown',function(e){if(e.code==='Space')e.stopPropagation()})});setup.dataset.spaceGuard='true';
window.LocalVersus={
  start:function(a,b){begin([a,b])},
  showSetup:showSetup,
  snapshot:function(){recordActive();return{started:started,ended:ended,activePlayer:active+1,throwCount:throwCount,boardReady:pins.every(function(p){return p.state==='standing'&&!p.rot&&!p.lean}),players:players.map(function(p){return Object.assign({},p)}),pinBoard:pins.map(function(p){return{n:p.n,x:p.x,y:p.y,state:p.state,rot:p.rot,lean:p.lean}})}}
};
busy=true;gameRoot.classList.add('match-setup-open');render();setup.classList.add('show');
})();
