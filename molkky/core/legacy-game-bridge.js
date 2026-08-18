/* Temporary compatibility bridge for fixed legacy game.js.
 * No assets, BGM, SE or voice data live here.
 * Presentation/audio are supplied by CharacterManager/StageManager/AudioManager runtimes.
 */
(function(){
  'use strict';
  if(!window.GAL_IMGS){
    window.GAL_IMGS={full:'',normal:'',joy:'',surprise:'',thinking:'',regret:''};
  }
})();
