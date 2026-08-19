(function(){'use strict';
var audio=null,master=null,status='armed-on-first-input';
function arm(){
  if(audio){if(audio.state==='suspended')audio.resume().catch(function(){});return}
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC){status='unavailable';return}
  try{
    audio=new AC();
    master=audio.createGain();
    master.gain.value=.34;
    var comp=audio.createDynamicsCompressor();
    comp.threshold.value=-16;
    comp.knee.value=8;
    comp.ratio.value=12;
    comp.attack.value=.002;
    comp.release.value=.22;
    master.connect(comp);
    comp.connect(audio.destination);
    status='ready';
    audio.resume().catch(function(){});
  }catch(e){audio=null;master=null;status='unavailable'}
}
function noiseBuffer(seconds){
  var b=audio.createBuffer(1,Math.ceil(audio.sampleRate*seconds),audio.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  return b
}
function boom(strong){
  arm();
  if(!audio||!master)return false;
  var t=audio.currentTime,osc=audio.createOscillator(),og=audio.createGain();
  osc.type='sine';
  osc.frequency.setValueAtTime(strong?92:76,t);
  osc.frequency.exponentialRampToValueAtTime(29,t+.34);
  og.gain.setValueAtTime(strong?.95:.72,t);
  og.gain.exponentialRampToValueAtTime(.001,t+.42);
  osc.connect(og);og.connect(master);osc.start(t);osc.stop(t+.44);
  var n=audio.createBufferSource(),f=audio.createBiquadFilter(),ng=audio.createGain();
  n.buffer=noiseBuffer(.32);
  f.type='bandpass';f.frequency.value=strong?620:840;f.Q.value=.72;
  ng.gain.setValueAtTime(strong?.8:.6,t);
  ng.gain.exponentialRampToValueAtTime(.001,t+.3);
  n.connect(f);f.connect(ng);ng.connect(master);n.start(t);
  var crack=audio.createOscillator(),cg=audio.createGain();
  crack.type='square';
  crack.frequency.setValueAtTime(180,t);
  crack.frequency.exponentialRampToValueAtTime(62,t+.11);
  cg.gain.setValueAtTime(.18,t);
  cg.gain.exponentialRampToValueAtTime(.001,t+.13);
  crack.connect(cg);cg.connect(master);crack.start(t);crack.stop(t+.14);
  status='played';
  return true
}
function ping(){
  arm();
  if(!audio||!master)return false;
  var t=audio.currentTime,o=audio.createOscillator(),v=audio.createGain();
  o.type='sawtooth';
  o.frequency.setValueAtTime(260,t);
  o.frequency.exponentialRampToValueAtTime(620,t+.1);
  v.gain.setValueAtTime(.09,t);
  v.gain.exponentialRampToValueAtTime(.001,t+.14);
  o.connect(v);v.connect(master);o.start(t);o.stop(t+.15);
  status='played';
  return true
}
addEventListener('pointerdown',arm,{once:true,capture:true});
addEventListener('keydown',arm,{once:true,capture:true});
window.MangaImpactAudio={arm:arm,boom:boom,ping:ping,state:function(){return status}};
})();
