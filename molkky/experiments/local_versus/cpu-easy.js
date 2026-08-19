(function(){'use strict';
function between(a,b){return a+Math.random()*(b-a)}
function plan(board){
  var live=(board||[]).filter(function(pin){return pin.state==='standing'});if(!live.length)return null;
  var target=live[Math.floor(Math.random()*live.length)],steady=Math.random()<.68,angle=Math.random()*Math.PI*2,distance=steady?between(0,14):between(38,76);
  return{difficulty:'easy',target:target,aim:{x:target.x+Math.cos(angle)*distance,y:target.y+Math.sin(angle)*distance},power:between(.22,.56),accuracy:steady?between(.38,.62):(Math.random()<.5?between(.16,.30):between(.70,.84)),thinkMs:between(650,1050)}
}
window.MolkkyCpuEasy={id:'cpu-easy-v1',label:window.MolkkyContent?MolkkyContent.text('match.cpuName'):'CPU',plan:plan};
})();
