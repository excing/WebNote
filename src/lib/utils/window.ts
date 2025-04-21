// 定义 clickOutside 动作
export function clickOutside(node: HTMLElement, handler: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      event.stopPropagation();
      handler();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}

// src/lib/actions/scrollHideHeader.ts
export function scrollHideHeader(node: HTMLElement, threshold = 100) {
  let lastScroll = 0;
  let ticking = false;

  const handleScroll = () => {
    const currentScroll = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (Math.abs(currentScroll - lastScroll) < 5) {
          ticking = false;
          return;
        }

        const direction = currentScroll > lastScroll ? 'down' : 'up';

        if (direction === 'down' && currentScroll > threshold) {
          node.style.transform = 'translateY(-100%)';
        } else {
          node.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return {
    destroy() {
      window.removeEventListener('scroll', handleScroll);
    }
  };
}