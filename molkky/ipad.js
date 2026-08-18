(()=>{
  const canvas=document.getElementById('c');
  if(!canvas)return;

  let startX=0,startY=0,moved=false,audioUnlocked=false,moveRaf=0,lastMove=null;
  canvas.style.touchAction='none';

  function dispatchMouse(type,x,y){
    canvas.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,view:window}));
  }

  function unlockAudio(){
    if(audioUnlocked)return;
    audioUnlocked=true;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(window.__molkkyAC && window.__molkkyAC.state==='suspended') window.__molkkyAC.resume();
      else if(Ctx){
        const temp=new Ctx();
        const osc=temp.createOscillator();
        const gain=temp.createGain();
        gain.gain.value=0.00001;
        osc.connect(gain).connect(temp.destination);
        osc.onended=()=>temp.close().catch(()=>{});
        osc.start();osc.stop(temp.currentTime+0.01);
        if(temp.state==='suspended')temp.resume();
      }
    }catch(e){audioUnlocked=false}
  }

  function queueMove(x,y){
    lastMove={x,y};
    if(moveRaf)return;
    moveRaf=requestAnimationFrame(()=>{
      moveRaf=0;
      if(!lastMove)return;
      dispatchMouse('mousemove',lastMove.x,lastMove.y);
      lastMove=null;
    });
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
    queueMove(t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('touchend',e=>{
    if(!moved) canvas.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    lastMove=null;
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('touchcancel',()=>{moved=false},{passive:true});
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});

  const tip=document.getElementById('statusTip');
  if(tip) tip.textContent='指で照準移動 / タップ：POWER → ACCURACY → THROW';
})();
