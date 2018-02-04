import intersection from 'lodash/intersection';
import pageApi from './pageApi'
import db from './db';

const topTags = [
  'project manager',
  'product manager',
  'human resources',
  'technical director',
  'team leader',
  'recruiter',
  'coordinator',
  'developer',
  'acquisition',
  'recruiting',
  'recruitment',
  'front-end',
  'back-end',
  'devops',
  'ux/ui',
];
const tags = [
  'it',
  'hr',
  'ux',
  'ceo',
  'ui',
  'js',
  'ios',
];
const topTagsRegex = new RegExp(topTags.join('|'), 'g');

// If false, record would be removed
function filterByTag(record) {
  const description = record.description.toLowerCase();
  const hasRegexTag = description.search(topTagsRegex) !== -1;
  if (hasRegexTag) {
    return hasRegexTag;
  }

  return intersection(description.split(' '), tags).length;
}
window.filterByTag = filterByTag;

function selectRecomendation(recomendations) {
  const removedFirst = recomendations
    .filter((r) => {
      return (
        r.connectionLevel !== 1 
        && !r.visited
        && filterByTag(r)
      );
    })
    .sort((left, right) => right.updated - left.updated);
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
  const last24hours = (Date.now() - 1000*60*60*24) / 1000;
  const visitedLast24 = profiles.filter(p => p.visited >= last24hours);
  console.warn('VISITED', visited.length);
  console.warn('VISITED last 24', visitedLast24.length);

  const newRecomendations = await getNewRecomendations();

  const recomendation = await findRecomendation(newRecomendations);
  if (!recomendation) {
    console.warn('DEAD END');
    return;
  }
  if (visitedLast24.length >= 100) {
    console.warn('DAY LIMIT REACHED 100');
    return;
  }
  const randomTimeout = (1000 * 10) + (Math.random() * 1000 * 40);
  console.warn(`Going to profile in ${Math.round(randomTimeout/1000)} seconds`, recomendation);
  setTimeout(() => {
    db.updateProfiles([
      Object.assign(recomendation, { visited: Math.round(Date.now() / 1000) }),
    ]).then(() => {
      window.location = `${window.location.origin}${recomendation.id}`;
    });
  }, randomTimeout);
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

