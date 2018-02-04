import pageApi from './pageApi'
import db from './db';

const topTags = [
  '[Rr]ecruiter',
  '[iI][tT]',
  '[rR]ecruiting',
  'HR',
  '[Dd]eveloper',
  'UX',
  'UI',
];
const topTagsRegex = new RegExp(topTags.join('|'), 'g');

function selectRecomendation(recomendations) {
  const removedFirst = recomendations
    .filter((r) => {
      return (
        r.connectionLevel !== 1 
        && !r.visited
        && r.description.search(topTagsRegex) !== -1
      );
    })
    .sort((left, right) => left.updated - right.updated);
  return removedFirst.length ? removedFirst[0] : null;
}

async function findRecomendation(latest) {
  const recomendation = selectRecomendation(latest);
  if (recomendation) {
    return recomendation;
  } else {
    const profiles = await db.getProfiles();
    console.info('Profiles loaded', profiles.length);
    const fallbackRecomendation = selectRecomendation(profiles);
    if (fallbackRecomendation) {
      console.info('fallback recomendation found', fallbackRecomendation);
      return fallbackRecomendation;
    }
  }
}

async function getNewRecomendations() {
  try {
    const recomendations = await pageApi.getRecomendations();
    const byIds = await db.getProfilesByIds(recomendations.map(r => r.id));
    const foundIds = byIds.map(i => i.id);
    const newRecomendations = recomendations.filter(r => !foundIds.includes(r.id));
  
    console.info('newRecomendations', newRecomendations);
    await db.addProfiles(newRecomendations);
    return newRecomendations;
  } catch (e) {
    console.warn('NO recomendations on the page!', e);
    return [];
  }
}

async function main() {
  await db.init();
  // DEBUG @TODO remove
  const profiles = await db.getProfiles();
  window.profiles = profiles;
  const visited = profiles.filter(p => p.visited);
  console.warn('VISITED', visited);

  const newRecomendations = await getNewRecomendations();

  const recomendation = await findRecomendation(newRecomendations);
  if (!recomendation) {
    console.warn('DEAD END');
    return;
  }
  await db.updateProfiles([
    Object.assign(recomendation, { visited: Math.round(Date.now() / 1000) }),
  ]);
  if (visited.length >= 50) {
    console.warn('LIMIT REACHED 50');
    return;
  }
  console.warn('UPDATED, going to profile in 10 seconds', recomendation);
  setTimeout(() => {
    window.location = `${window.location.origin}${recomendation.id}`;
  }, 1000 * 10);
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

