(()=>{
  const canvas=document.getElementById('c');
  if(!canvas)return;

  let startX=0,startY=0,moved=false;

  function dispatchMouse(type,x,y){
    canvas.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,view:window}));
  }

  function unlockAudio(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(window.__molkkyAC && window.__molkkyAC.state==='suspended') window.__molkkyAC.resume();
      else if(Ctx){
        const temp=new Ctx();
        const osc=temp.createOscillator();
        const gain=temp.createGain();
        gain.gain.value=0.00001;
        osc.connect(gain).connect(temp.destination);
        osc.start();osc.stop(temp.currentTime+0.01);
        if(temp.state==='suspended')temp.resume();
      }
    }catch(e){}
  }

  canvas.addEventListener('touchstart',e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    startX=t.clientX; startY=t.clientY; moved=false;
    unlockAudio();
    dispatchMouse('mousemove',t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('touchmove',e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    if(Math.hypot(t.clientX-startX,t.clientY-startY)>8)moved=true;
    dispatchMouse('mousemove',t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('touchend',e=>{
    unlockAudio();
    if(!moved) canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('touchcancel',()=>{moved=false},{passive:true});
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});

  const tip=document.getElementById('statusTip');
  if(tip) tip.textContent='指で照準移動 / タップ：POWER → ACCURACY → THROW';
})();