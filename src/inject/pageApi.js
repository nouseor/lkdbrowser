async function getRecomendationItems() {
  let interval = null;
  let maxRetries = 50;
  return new Promise((resolve, reject) => {
    interval = setInterval(() => {
      const recomendations = document.querySelectorAll('[data-control-name="browsemap_profile"]');
      if (recomendations.length) {
        clearInterval(interval);
        resolve(recomendations);
      } else {
        maxRetries -= 1;
        if (!maxRetries) {
          clearInterval(interval);
          reject([]);
        }
      }
    }, 100);
  });
}

async function getRecomendations() {
  const result = [];
  const recomendations = await getRecomendationItems();
  recomendations.forEach((item) => {
    const resultItem = {
      id: item.getAttribute('href'),
      href: item.getAttribute('href'),
      name: item.querySelector('img').getAttribute('alt'),
      src: item.querySelector('img').getAttribute('src'),
      description: item.querySelector('p').textContent,
    };
    result.push(resultItem);
  });
  window.recomendations = recomendations;
  return result;
}

export default {
  getRecomendations,
};
