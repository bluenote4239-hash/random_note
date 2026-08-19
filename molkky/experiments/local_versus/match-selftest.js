(function(){'use strict';
window.addEventListener('load',function(){setTimeout(function(){try{
  if(!window.LocalVersus||typeof LocalVersus.start!=='function'||typeof LocalVersus.snapshot!=='function')throw Error('runtime API');
  var state=LocalVersus.snapshot();if(!state.players||state.players.length!==2)throw Error('two players');
  if(state.pinBoard.length!==12)throw Error('shared 12-pin board');
  if(!document.getElementById('playerCard0')||!document.getElementById('playerCard1'))throw Error('versus HUD');
  document.getElementById('game').dataset.versusSelftest='pass';console.log('VERSUS SELFTEST PASS');
}catch(e){document.getElementById('game').dataset.versusSelftest='fail';console.error('VERSUS SELFTEST FAIL',e&&e.message?e.message:e)}},360)})
})();
