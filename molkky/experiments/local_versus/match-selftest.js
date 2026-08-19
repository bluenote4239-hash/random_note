(function(){'use strict';
window.addEventListener('load',function(){setTimeout(function(){try{
  if(!window.LocalVersus||typeof LocalVersus.start!=='function'||typeof LocalVersus.snapshot!=='function')throw Error('runtime API');
  if(!window.MolkkyCpuEasy||MolkkyCpuEasy.id!=='cpu-easy-v1'||typeof MolkkyCpuEasy.plan!=='function')throw Error('weak CPU module');
  if(!window.FileBgmV29||typeof FileBgmV29.start!=='function'||AudioRuntime.startBgm!==FileBgmV29.start)throw Error('file BGM runtime');
  var state=LocalVersus.snapshot();if(!state.players||state.players.length!==2)throw Error('two players');
  if(state.opponentMode!=='cpu'||state.players[1].kind!=='cpu'||state.players[1].name!=='CPU よわめ')throw Error('default CPU opponent');
  if(state.pinBoard.length!==12)throw Error('shared 12-pin board');
  if(!state.boardReady||state.pinBoard.some(function(pin){return pin.state!=='standing'||pin.rot||pin.lean}))throw Error('upright shared board');
  var cpuPlan=MolkkyCpuEasy.plan(state.pinBoard),bgmInfo=FileBgmV29.info();if(!cpuPlan||!cpuPlan.target||cpuPlan.difficulty!=='easy'||cpuPlan.power<.22||cpuPlan.power>.56||cpuPlan.accuracy<.16||cpuPlan.accuracy>.84)throw Error('weak CPU plan');
  if(bgmInfo.mode!=='file-buffer-loop'||bgmInfo.src!=='audio/bgm/ievan_v29/ievan_v29.wav')throw Error('stored WAV source');
  if(!document.getElementById('playerCard0')||!document.getElementById('playerCard1'))throw Error('versus HUD');
  var game=document.getElementById('game'),setup=document.getElementById('matchSetup'),form=document.getElementById('matchSetupForm'),hud=document.getElementById('versusHud'),rect=form.getBoundingClientRect();
  if(state.started||state.ended||state.activePlayer!==1||state.throwCount!==1)throw Error('initial match state');
  if(!setup.classList.contains('show')||!game.classList.contains('match-setup-open')||!busy)throw Error('setup lock');
  if(game.scrollTop!==0||game.scrollLeft!==0)throw Error('setup scroll');
  if(rect.top<0||rect.bottom>innerHeight)throw Error('setup bounds');
  if(getComputedStyle(hud).visibility!=='hidden')throw Error('pre-start HUD');
  if(setup.dataset.spaceGuard!=='true')throw Error('name input guard');
  if(document.querySelectorAll('input[name="opponentMode"]').length!==2||!document.getElementById('playerInput1').disabled)throw Error('opponent selector');
  if(window.resetGame!==resetGame)throw Error('restart binding');
  game.dataset.versusSelftest='pass';game.dataset.versusChecks='state,board,upright,cpu,selector,file-bgm,setup,scroll,bounds,hud,input,restart';console.log('VERSUS SELFTEST PASS');
}catch(e){document.getElementById('game').dataset.versusSelftest='fail';console.error('VERSUS SELFTEST FAIL',e&&e.message?e.message:e)}},360)})
})();
