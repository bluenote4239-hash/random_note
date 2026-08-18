(()=>{
  function fail(msg){
    const el=document.getElementById('log');
    if(el) el.textContent='SELFTEST FAIL: '+msg+'\n'+el.textContent;
    console.error('MOLKKY SELFTEST FAIL',msg);
  }
  function pass(msg){ console.log('MOLKKY SELFTEST PASS',msg); }

  function verifyAtlasPixels(){
    if(typeof GAL_ATLAS_URL==='undefined'||typeof GAL_CROPS==='undefined')return fail('atlas metadata missing');
    const img=new Image();
    img.onload=()=>{
      try{
        if(img.naturalWidth!==GAL_ATLAS.w||img.naturalHeight!==GAL_ATLAS.h)
          return fail('atlas size '+img.naturalWidth+'x'+img.naturalHeight);
        const oc=document.createElement('canvas');oc.width=img.naturalWidth;oc.height=img.naturalHeight;
        const ox=oc.getContext('2d');ox.drawImage(img,0,0);
        ['normal','joy','surprise','thinking','regret','full'].forEach(key=>{
          const c=GAL_CROPS[key];
          const pts=[[.5,.5],[.3,.3],[.7,.3],[.3,.7],[.7,.7]];
          let opaque=0;
          pts.forEach(p=>{const px=Math.floor(c.x+c.w*p[0]),py=Math.floor(c.y+c.h*p[1]);if(ox.getImageData(px,py,1,1).data[3]>8)opaque++});
          if(!opaque)fail('transparent character crop: '+key);
        });
      }catch(e){fail('atlas pixel test '+e.message)}
    };
    img.onerror=()=>fail('atlas image decode failed');
    img.src=GAL_ATLAS_URL;
  }

  window.addEventListener('load',()=>setTimeout(()=>{
    try{
      const canvas=document.getElementById('c');
      if(!canvas) return fail('canvas missing');
      if(canvas.width!==1100||canvas.height!==720) return fail('canvas size '+canvas.width+'x'+canvas.height);
      if(typeof CharacterManager!=='object') return fail('CharacterManager missing');
      if(!CharacterManager.get()||!CharacterManager.activeId) return fail('active character missing');
      if(CharacterManager.list().length<1) return fail('character registry empty');
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
      const full=document.getElementById('galFull');
      const cutImg=document.getElementById('cutinImg');
      if(!icon||!full||!cutImg) return fail('character slots missing');
      CharacterManager.renderSlot('icon','normal');
      CharacterManager.renderSlot('cutin','joy');
      CharacterManager.renderSlot('full','normal');
      if(!icon.style.backgroundImage||icon.style.backgroundImage==='none') return fail('gal icon not rendered');
      if(!cutImg.style.backgroundImage||cutImg.style.backgroundImage==='none') return fail('cutin character not rendered');
      if(!full.style.backgroundImage||full.style.backgroundImage==='none') return fail('full character not rendered');
      if(!document.getElementById('galBubble')) return fail('gal bubble missing');
      if(!document.getElementById('cutin')) return fail('cutin missing');
      verifyAtlasPixels();
      pass('character registry/visual slots/atlas/cutin/12 pins/official formation/draw');
      const el=document.getElementById('log');
      if(el&&el.textContent==='READY') el.textContent='SELFTEST PASS / READY';
    }catch(e){ fail(e && e.message ? e.message : String(e)); }
  },180));
})();