(function(){'use strict';
var packs=Object.create(null),active=null;
function at(root,path){
  return String(path||'').split('.').filter(Boolean).reduce(function(value,key){return value==null?undefined:value[key]},root)
}
function freeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.keys(value).forEach(function(key){freeze(value[key])});return Object.freeze(value)
}
function assertPack(pack){
  if(!pack||!pack.id)throw Error('content pack id required');
  ['images','audio','text'].forEach(function(section){if(!pack[section])throw Error('content pack '+pack.id+' missing '+section)});
  if(!at(pack,'images.stage.background.src'))throw Error('content pack '+pack.id+' missing stage background');
  if(!Array.isArray(at(pack,'images.skittles'))||pack.images.skittles.length!==12)throw Error('content pack '+pack.id+' requires 12 skittle images');
  if(!at(pack,'audio.bgm.src'))throw Error('content pack '+pack.id+' missing BGM file');
  if(!Array.isArray(at(pack,'audio.se.wood'))||!pack.audio.se.wood.length)throw Error('content pack '+pack.id+' missing wood SE');
  return pack
}
function register(pack){assertPack(pack);packs[pack.id]=freeze(pack);if(!active)active=pack.id;return pack.id}
function select(id){if(!packs[id])throw Error('unknown content pack '+id);active=id;window.dispatchEvent(new CustomEvent('molkky:contentchange',{detail:{id:id}}));return id}
function get(id){return packs[id||active]||null}
function value(path,id){var pack=get(id);return pack?at(pack,path):undefined}
function required(path,id){var result=value(path,id);if(result===undefined||result===null||result==='')throw Error('content value missing '+path);return result}
function text(path,vars,id){
  var result=String(required('text.'+path,id)),data=vars||{};
  return result.replace(/\{([a-zA-Z0-9_]+)\}/g,function(_,key){return data[key]===undefined?'{'+key+'}':String(data[key])})
}
function files(id){
  var found=[];function walk(value){if(typeof value==='string'&&/\.(?:avif|gif|jpe?g|png|webp|svg|wav|mp3|ogg|m4a)(?:\?|$)/i.test(value))found.push(value);else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')Object.keys(value).forEach(function(key){walk(value[key])})}
  walk(get(id));return Array.from(new Set(found))
}
function list(){return Object.keys(packs).map(function(id){return packs[id]})}
window.MolkkyContent={register:register,select:select,get:get,value:value,required:required,text:text,files:files,list:list,get activeId(){return active}};
})();
