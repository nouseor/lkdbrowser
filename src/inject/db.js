const local = {
  db: null,
  profileStore: null,
};

const DATABASE_NAME = 'lkdbrowser_db';
const DATABASE_VERSION = 1;

function init() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = function (event) {
      const error = `Database error: ${event.target.errorCode}`;
      reject(error);
      alert(error);
    };
    request.onsuccess = function (event) {
      console.info('Database initialized!');
      local.db = event.target.result;
      resolve();
    };
    request.onupgradeneeded = function (event) {
      console.info('Database onupgradeneeded!');
      local.db = event.target.result;

      if (!local.db.objectStoreNames.contains('profile')) {
        local.profileStore = local.db.createObjectStore('profile', { keyPath: 'id' });
      }
    };
  });
}

async function addProfiles(profiles) {
  return new Promise((resolve, reject) => {
    const transaction = local.db.transaction(['profile'], 'readwrite');

    transaction.oncomplete = function (event) {
      resolve();
    };
    transaction.onerror = function (event) {
      reject(event);
    };

    const profileStore = transaction.objectStore('profile');
    profiles.forEach((p) => {
      var request = profileStore.add(p);
      request.onsuccess = function (event) {
        // event.target.result === customer.ssn;
      };
    });
  });
}

async function getProfiles() {
  return new Promise((resolve, rejct) => {
    const transaction = local.db.transaction(['profile'], 'readwrite');
    const profileStore = transaction.objectStore('profile');
    const result = profileStore.getAll();
    result.onsuccess = function(event) {
      resolve(event.target.result);
    };
  });
}

export default {
  init,
  addProfiles,
  getProfiles,
};

function removeExample() {
  var request = db.transaction(["customers"], "readwrite")
    .objectStore("customers")
    .delete("444-44-4444");
  request.onsuccess = function (event) {
    // It's gone!
  };
}

function getExample() {
  var transaction = db.transaction(["customers"]);
  var objectStore = transaction.objectStore("customers");
  var request = objectStore.get("444-44-4444");
  request.onerror = function (event) {
    // Handle errors!
  };
  request.onsuccess = function (event) {
    // Do something with the request.result!
    alert("Name for SSN 444-44-4444 is " + request.result.name);
  };
}
