myUI.storage.initialize = function(){
  myUI.db_on = true;
}

myUI.storage.add = function(objS_name, data){
  data.forEach(item => {
    if(objS_name=="states"){
      let visited_str = Uint8Array2String(item.visited);
      console.log(visited_str);
      console.log(item.visited.length);
      delete item.visited;
      item.visited_str = visited_str;
    }
    console.log(JSON.stringify(item));
    console.log(JSON.stringify(item).length);
    localStorage.setItem(`${objS_name}_${item.id}`, JSON.stringify(item));
  });
}

myUI.storage.get = function(objS_name, search_key){
  let ret = JSON.parse(localStorage.setItem(`${objS_name}_${search_key}`))
  if(objS_name=="states"){
    ret.visited = String2Uint8Array(ret.visited_str);
    delete ret.visited_str;
  }
  return ret;
}

myUI.storage.remove = function(objS_name, search_key){
  localStorage.removeItem(`${objS_name}_${search_key}`);
}

myUI.storage.initialize();

function Uint8Array2String(array){
  let ret = "";
  array.forEach(num=>ret+=String.fromCharCode(num));
  return ret;
}

function String2Uint8Array(s){
  let ret = [];
  s.forEach(chr=>ret.push(chr.charCodeAt(0)));
  return new UInt8Array(ret);
}