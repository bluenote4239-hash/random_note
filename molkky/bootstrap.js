window.addEventListener('error',function(e){
  console.error('MOLKKY ERROR',e.message,e.filename,e.lineno,e.colno,e.error);
  var el=document.getElementById('log');
  if(el) el.textContent='ERROR: '+e.message+' @ '+e.lineno+':'+e.colno+'\n'+el.textContent;
});
window.addEventListener('unhandledrejection',function(e){
  console.error('MOLKKY PROMISE ERROR',e.reason);
});
