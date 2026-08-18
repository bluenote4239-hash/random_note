(()=>{
  const full=document.getElementById('galFull');
  const icon=document.getElementById('galIcon');
  const cut=document.getElementById('cutinImg');

  // The expression cells in the old atlas were blank on iPad Safari.
  // Use the guaranteed-good full-body atlas cell and crop the face from it.
  function applyFaceFromFull(el){
    if(!el||typeof GAL_ATLAS_URL==='undefined')return;
    const w=el.clientWidth||110;
    // Face window inside the 180x450 full-body atlas cell.
    const crop={x:38,y:12,w:110,h:110};
    const s=w/crop.w;
    el.style.backgroundImage='url("'+GAL_ATLAS_URL+'")';
    el.style.backgroundRepeat='no-repeat';
    el.style.backgroundSize=(560*s)+'px '+(460*s)+'px';
    el.style.backgroundPosition=(-crop.x*s)+'px '+(-crop.y*s)+'px';
    el.style.backgroundColor='transparent';
  }
  function fitFull(){
    if(!full)return;
    const h=full.clientHeight||360;
    full.style.width=(h*0.4)+'px';
    if(typeof applyGalCrop==='function')applyGalCrop(full,'full');
  }
  function applyAll(){
    fitFull();
    applyFaceFromFull(icon);
    applyFaceFromFull(cut);
  }
  applyAll();
  setTimeout(applyAll,60);
  setTimeout(applyAll,250);
  if(typeof ResizeObserver!=='undefined'&&full)new ResizeObserver(fitFull).observe(full);
  addEventListener('orientationchange',()=>setTimeout(applyAll,180));

  const oldSetGal=window.setGal;
  if(typeof oldSetGal==='function'){
    window.setGal=function(expr,text){oldSetGal(expr,text);applyFaceFromFull(icon)};
  }
  const oldCutin=window.cutin;
  if(typeof oldCutin==='function'){
    window.cutin=function(kind,label,expr='joy',ms=850){oldCutin(kind,label,expr,ms);applyFaceFromFull(cut)};
  }
})();