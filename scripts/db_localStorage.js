myUI.storage.initialize = function(){
  
}

myUI.storage.add = function(objS_name, data){
  //console.log(data);
  data.forEach(item => {
    let key;
    if(objS_name=="states"){
      key = item.id;
      let visited_str = item.visited.join(",")
      console.log(visited_str);
      console.log(item.visited.length);
      delete item.visited;
      item.visited_str = visited_str;
    }
    else{
      key = item[0];
      item = item.slice(1);
    }
    //console.log(JSON.stringify(item));
    //console.log(JSON.stringify(item).length);
    localStorage.setItem(`${objS_name}_${key}`, JSON.stringify(item));
  });
}

myUI.storage.get = function(objS_name, search_key){
  let ret = JSON.parse(localStorage.getItem(`${objS_name}_${search_key}`))
  if(objS_name=="states"){
    ret.visited = ret.visited_str.split(",");
    delete ret.visited_str;
  }
  return ret;
}

myUI.storage.remove = function(objS_name, search_key){
  localStorage.removeItem(`${objS_name}_${search_key}`);
}

myUI.storage.initialize();

