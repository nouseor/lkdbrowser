import pageApi from './pageApi'
import db from './db';

async function main() {
  console.warn('INJECT!');
  await db.init();
  const profiles = await db.getProfiles();
  console.warn('PROFILEs', profiles);

  const recomendations = await pageApi.getRecomendations();
  console.warn('recomendations', recomendations);
  await db.addProfiles(recomendations);
  console.warn('ADDED!');
}

function initMessaging() {
  chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
  });
}

initMessaging();

const readyStateCheckInterval = setInterval(function () {
  if (document.readyState === 'complete') {
    clearInterval(readyStateCheckInterval);
    main();
  }
}, 100);

