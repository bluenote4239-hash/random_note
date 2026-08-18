(()=>{
  const pool=voices.map(v=>{const a=new Audio(v[1]);a.preload='auto';a.volume=.82;return a});
  window.voice=function(delay=0){
    setTimeout(()=>{
      let choices=voices.map((_,i)=>i).filter(i=>!recent.includes(i));
      if(!choices.length)choices=voices.map((_,i)=>i);
      const i=choices[Math.floor(Math.random()*choices.length)];
      recent.push(i);while(recent.length>2)recent.shift();
      const a=pool[i];
      try{a.pause();a.currentTime=0;a.playbackRate=.98+Math.random()*.04;a.play().catch(()=>{})}catch(e){}
    },delay);
  };
  const canvas=document.getElementById('c');
  function startAudioTrusted(){
    try{AC();startBgm()}catch(e){console.warn('audio start',e)}
  }
  if(canvas){
    canvas.addEventListener('touchstart',startAudioTrusted,{once:true,passive:true});
    canvas.addEventListener('pointerdown',startAudioTrusted,{once:true,passive:true});
  }
})();
