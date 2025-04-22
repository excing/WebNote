// 定义 clickOutside 动作
export function clickOutside(node: HTMLElement, handler: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      (!node.contains(event.target as Node) || (event.target as HTMLElement).hasAttribute("data-close-dropdown")) &&
      !event.defaultPrevented
    ) {
      event.preventDefault();
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

// src/lib/actions/keyboardShortcut.ts
export function keyboardShortcut(
  node: HTMLElement,
  shortcut: { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean; handle: () => void }
) {

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === shortcut.key &&
      ((shortcut.ctrl ? e.ctrlKey : false) ||
        (shortcut.meta ? e.metaKey : false) ||
        (shortcut.shift ? e.shiftKey : false) ||
        (shortcut.alt ? e.altKey : false))
    ) {
      e.preventDefault();
      e.stopPropagation();
      shortcut.handle();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return {
    destroy() {
      window.removeEventListener('keydown', handleKeyDown);
    }
  };
}