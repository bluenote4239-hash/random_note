// Compatibility shim: keep game.js happy without overwriting the real atlas renderer.
// The visible gal art is rendered by applyGalCrop() from assets.js onto DIV elements.
var GAL_IMGS=(function(){
  var t='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  return {normal:t,joy:t,surprise:t,thinking:t,regret:t,full:t};
})();
