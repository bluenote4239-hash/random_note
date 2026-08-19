(function(){'use strict';
window.addEventListener('load',function(){setTimeout(function(){try{
  if(!window.LocalVersus||typeof LocalVersus.start!=='function'||typeof LocalVersus.snapshot!=='function')throw Error('runtime API');
  var state=LocalVersus.snapshot();if(!state.players||state.players.length!==2)throw Error('two players');
  if(state.pinBoard.length!==12)throw Error('shared 12-pin board');
  if(!state.boardReady||state.pinBoard.some(function(pin){return pin.state!=='standing'||pin.rot||pin.lean}))throw Error('upright shared board');
  if(!document.getElementById('playerCard0')||!document.getElementById('playerCard1'))throw Error('versus HUD');
  var game=document.getElementById('game'),setup=document.getElementById('matchSetup'),form=document.getElementById('matchSetupForm'),hud=document.getElementById('versusHud'),rect=form.getBoundingClientRect();
  if(state.started||state.ended||state.activePlayer!==1||state.throwCount!==1)throw Error('initial match state');
  if(!setup.classList.contains('show')||!game.classList.contains('match-setup-open')||!busy)throw Error('setup lock');
  if(game.scrollTop!==0||game.scrollLeft!==0)throw Error('setup scroll');
  if(rect.top<0||rect.bottom>innerHeight)throw Error('setup bounds');
  if(getComputedStyle(hud).visibility!=='hidden')throw Error('pre-start HUD');
  if(setup.dataset.spaceGuard!=='true')throw Error('name input guard');
  if(window.resetGame!==resetGame)throw Error('restart binding');
  game.dataset.versusSelftest='pass';game.dataset.versusChecks='state,board,upright,setup,scroll,bounds,hud,input,restart';console.log('VERSUS SELFTEST PASS');
}catch(e){document.getElementById('game').dataset.versusSelftest='fail';console.error('VERSUS SELFTEST FAIL',e&&e.message?e.message:e)}},360)})
})();
