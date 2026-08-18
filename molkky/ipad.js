(()=>{
  const canvas=document.getElementById('c');
  if(!canvas)return;
  function setAimFromClient(clientX,clientY){
    if(typeof phase!=='undefined' && (phase!==0 || busy))return;
    const r=canvas.getBoundingClientRect();
    aim.x=(clientX-r.left)*W/r.width;
    aim.y=(clientY-r.top)*H/r.height;
    draw();
  }
  function unlockAudio(){
    try{ const a=AC(); if(a&&a.state==='suspended') a.resume(); }catch(e){}
  }
  canvas.addEventListener('touchstart',e=>{
    if(!e.touches.length)return;
    unlockAudio();
    const t=e.touches[0];
    setAimFromClient(t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});
  canvas.addEventListener('touchmove',e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    setAimFromClient(t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch'||e.pointerType==='pen'){
      unlockAudio();
      setAimFromClient(e.clientX,e.clientY);
    }
  },{passive:true});
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  window.addEventListener('orientationchange',()=>setTimeout(draw,150));
  const tip=document.getElementById('statusTip');
  if(tip && matchMedia('(pointer:coarse)').matches) tip.textContent='タップ：POWER → ACCURACY → THROW　指で照準移動';
})();