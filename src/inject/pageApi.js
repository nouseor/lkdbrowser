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
    const elements = {
      img: item.querySelector('img'),
      description: item.querySelector('p'),
      distValue: item.querySelector('.dist-value'),
    };
    result.push({
      id: item.getAttribute('href'),
      name: elements.img.getAttribute('alt'),
      // src: elements.img.getAttribute('src'),
      description: `${elements.description.textContent}`,
      connectionLevel: parseInt(elements.distValue.textContent, 10),
    });
  });
  return result;
}

async function getLocation() {
  const locationElement = document.querySelector('.pv-top-card-section__location');
  if (locationElement) {
    return locationElement.textContent;
  }
  return false;
}

export default {
  getRecomendations,
  getLocation,
};
