// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
  console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

function database_delete(){
  indexedDB.deleteDatabase("Pathfinder");
}

myUI.storage.initialize = function(){

  myUI.storage.objStores = {"states": "id"}

  var request = indexedDB.open("Pathfinder", 2);

  // This event is only implemented in recent browsers
  request.onupgradeneeded = event => {
    myUI.storage.db = event.target.result;

    // Initialise objectStores
    var objectStore;
    for (const [objS_name, objS_key] of Object.entries(myUI.storage.objStores)){
      try{
        objectStore = request.transaction.objectStore(objS_name);
      }
      catch(e){
        objectStore = myUI.storage.db.createObjectStore(objS_name, { keyPath: objS_key });
      }
    }
  };
}

myUI.storage.add = function(objS_name, data){
  var transaction = myUI.storage.db.transaction([objS_name], "readwrite");

  // Do something when all the data is added to the database.
  transaction.oncomplete = event => {
    //
  };

  transaction.onerror = event => {
    // Don't forget to handle errors!
  };

  var objectStore = transaction.objectStore(objS_name);

  data.forEach(item => {
    let request = objectStore.add(item);
    request.onsuccess = event => {
      // event.target.result === customer.ssn;
    };

    request.onerror = event =>{
      let objS_key = myUI.storage.objStores[objS_name]
      console.log(`${item[objS_key]} failed`);
    };
  });
}

myUI.storage.get = function(objS_name, search_key){
  return new Promise((resolve, reject)=>{
    let tx = myUI.storage.db.transaction([objS_name]);
    let store = tx.objectStore(objS_name);
    let req = store.get(search_key);
    console.log(req);
    req.onerror = event => {
      reject();
    };
    req.onsuccess = event => {
      resolve(req.result);
    }
  })
  var transaction = myUI.storage.db.transaction([objS_name]);
  var objectStore = transaction.objectStore(objS_name);
  var request = objectStore.get(search_key);
  request.onerror = event => {
    // Handle errors!
  };
  request.onsuccess = event => {
    // Do something with the request.result!
    console.log("result is " + request.result);
  };
}

myUI.storage.remove = function(objS_name, search_key){
  var request = myUI.storage.db.transaction([objS_name], "readwrite")
                .objectStore(objS_name)
                .delete(search_key);
  request.onsuccess = event => {
      // It's gone!
  };
}

myUI.storage.delete_objS = function(objS_name){
  myUI.storage.db.deleteObjectStore(objS_name);
}


function setupDB(namespace) {
  return Promise((resolve, reject) => {
    if (namespace != dbNamespace) {
      db = null;
    }
    dbNamespace = namespace;
  
    // If setupDB has already been run and the database was set up, no need to
    // open the database again; just run our callback and return!
    if (db) {
      resolve();
      return;
    }
  
    let dbName = namespace == '' ? 'myDatabase' : 'myDatabase_' + namespace;
    let dbReq = indexedDB.open(dbName, 2);
  
    // Fires when the version of the database goes up, or the database is created
    // for the first time
    dbReq.onupgradeneeded = function(event) {
      db = event.target.result;
  
      // Create an object store named notes, or retrieve it if it already exists.
      // Object stores in databases are where data are stored.
      let notes;
      if (!db.objectStoreNames.contains('notes')) {
        notes = db.createObjectStore('notes', {autoIncrement: true});
      } else {
        notes = dbReq.transaction.objectStore('notes');
      }
    }
  
    // Fires once the database is opened (and onupgradeneeded completes, if
    // onupgradeneeded was called)
    dbReq.onsuccess = function(event) {
      // Set the db variable to our database so we can use it!
      db = event.target.result;
      resolve();
    }
  
    // Fires when we can't open the database
    dbReq.onerror = function(event) {
      reject(`error opening database ${event.target.errorCode}`);
    }
  });
}

database_delete();
myUI.storage.initialize();