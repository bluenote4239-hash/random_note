(()=>{
  const full=document.getElementById('galFull');
  const icon=document.getElementById('galIcon');
  const cut=document.getElementById('cutinImg');
  function fitFull(){
    if(!full)return;
    const h=full.clientHeight||360;
    full.style.width=(h*0.4)+'px';
    applyGalCrop(full,'full');
  }
  function applyAll(){
    fitFull();
    if(icon)applyGalCrop(icon,'normal');
    if(cut)applyGalCrop(cut,'joy');
  }
  applyAll();
  if(typeof ResizeObserver!=='undefined'&&full){new ResizeObserver(fitFull).observe(full)}
  addEventListener('orientationchange',()=>setTimeout(applyAll,180));
  const oldSetGal=window.setGal;
  if(typeof oldSetGal==='function'){
    window.setGal=function(expr,text){oldSetGal(expr,text);if(icon)applyGalCrop(icon,expr||'normal')};
  }
  const oldCutin=window.cutin;
  if(typeof oldCutin==='function'){
    window.cutin=function(kind,label,expr='joy',ms=850){oldCutin(kind,label,expr,ms);if(cut)applyGalCrop(cut,expr||'joy')};
  }
})();
