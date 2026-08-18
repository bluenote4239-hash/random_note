(()=>{
  function fail(msg){
    const el=document.getElementById('log');
    if(el) el.textContent='SELFTEST FAIL: '+msg+'\n'+el.textContent;
    console.error('MOLKKY SELFTEST FAIL',msg);
  }
  function pass(msg){ console.log('MOLKKY SELFTEST PASS',msg); }
  window.addEventListener('load',()=>setTimeout(()=>{
    try{
      const canvas=document.getElementById('c');
      if(!canvas) return fail('canvas missing');
      if(canvas.width!==1100||canvas.height!==720) return fail('canvas size '+canvas.width+'x'+canvas.height);
      if(typeof GAL_IMGS!=='object'||!GAL_IMGS.normal||!GAL_IMGS.joy) return fail('GAL_IMGS missing');
      if(typeof draw!=='function') return fail('draw missing');
      if(typeof action!=='function') return fail('action missing');
      if(typeof resetGame!=='function') return fail('resetGame missing');
      if(!Array.isArray(pins)||pins.length!==12) return fail('pins='+String(pins&&pins.length));
      const nums=pins.map(p=>p.n).sort((a,b)=>a-b).join(',');
      if(nums!=='1,2,3,4,5,6,7,8,9,10,11,12') return fail('pin numbers '+nums);
      const order=[[1,2],[3,10,4],[5,11,12,6],[7,9,8]];
      const ys=[...new Set(pins.map(p=>p.y))].sort((a,b)=>b-a);
      const got=ys.map(y=>pins.filter(p=>p.y===y).sort((a,b)=>a.x-b.x).map(p=>p.n));
      if(JSON.stringify(got)!==JSON.stringify(order)) return fail('official formation '+JSON.stringify(got));
      draw();
      const icon=document.getElementById('galIcon');
      if(!icon||!icon.src) return fail('gal icon missing');
      const bubble=document.getElementById('galBubble');
      if(!bubble) return fail('gal bubble missing');
      const cut=document.getElementById('cutin');
      if(!cut) return fail('cutin missing');
      pass('canvas/gal/cutin/12 pins/official formation/draw');
      const el=document.getElementById('log');
      if(el&&el.textContent==='READY') el.textContent='SELFTEST PASS / READY';
    }catch(e){ fail(e && e.message ? e.message : String(e)); }
  },120));
})();