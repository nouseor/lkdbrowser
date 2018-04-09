export default {
  scrollToBottom,
  scrollToTop,
};

function scrollToBottom() {
  const MAX = 20;
  return new Promise((resolve) => {
    let times = 0;
    function scroll(yScrollLast) {
      const scrollSize = (Math.random() * 200) + 100
      window.scrollBy(0, scrollSize);
      times += 1;
      if (window.scrollY === yScrollLast) {
        console.warn('scrolled to bottom');
        resolve();
        return;
      }
      if (times > MAX) {
        console.warn('max scroll time reached');
        resolve();
        return;
      }
      const timeLapse = (Math.random() * 300) + 300;
      setTimeout(() => scroll(window.scrollY), timeLapse);
    }
    scroll(window.scrollY);
  });
}

function scrollToTop() {
  const MAX = 20;
  return new Promise((resolve) => {
    let times = 0;
    function scroll() {
      const scrollSize = (Math.random() * 200) + 100
      window.scrollBy(0, -scrollSize);
      times += 1;
      if (window.scrollY === 0) {
        console.warn('scrolled to top');
        resolve();
        return;
      }
      if (times > MAX) {
        console.warn('max scroll time reached');
        resolve();
        return;
      }
      const timeLapse = (Math.random() * 400) + 300;
      setTimeout(() => scroll(), timeLapse);
    }
    scroll(window.scrollY);
  });
}