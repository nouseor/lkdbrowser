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
    const errors = [];

    transaction.oncomplete = function (event) {
      resolve();
    };
    transaction.onerror = function (event) {
      console.warn('updateProfiles error', event.target.error.code, event.target.error.message);
      // reject();
    };

    const profileStore = transaction.objectStore('profile');
    profiles.forEach((p) => {
      // var request = profileStore.put(Object.assign(p, {
      var request = profileStore.add(Object.assign(p, {
        updated: Math.round(Date.now() / 1000),
      }));
      request.onsuccess = function (event) {
        // event.target.result === customer.ssn;
      };
      request.onerror = function (event) {
        errors.push(event.target.error.code);
      };
    });
  });
}

async function updateProfiles(profiles) {
  return new Promise((resolve, reject) => {
    const transaction = local.db.transaction(['profile'], 'readwrite');

    transaction.oncomplete = function (event) {
      resolve();
    };

    const profileStore = transaction.objectStore('profile');
    profiles.forEach((p) => {
      var request = profileStore.put(Object.assign(p, {
        updated: Math.round(Date.now() / 1000),
      }));
    });
  });
}

async function getProfilesByIds(ids) {
  return new Promise((resolve, reject) => {
    const resultData = [];
    const transaction = local.db.transaction(['profile'], 'readwrite');

    transaction.oncomplete = function (event) {
      resolve(resultData);
    };
    transaction.onerror = function (event) {
      reject(event);
    };

    const profileStore = transaction.objectStore('profile');
    ids.forEach((id) => {
      var request = profileStore.get(id);
      request.onsuccess = function (event) {
        if (event.target.result) {
          resultData.push(event.target.result);
        }
      };
    });
  });
}

async function getProfiles() {
  return new Promise((resolve, rejct) => {
    const transaction = local.db.transaction(['profile'], 'readwrite');
    const profileStore = transaction.objectStore('profile');
    const result = profileStore.getAll();
    result.onsuccess = function (event) {
      resolve(event.target.result);
    };
  });
}

export default {
  init,
  updateProfiles,
  getProfilesByIds,
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
