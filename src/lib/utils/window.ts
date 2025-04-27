// 定义 clickOutside 动作
export function clickOutside(node: HTMLElement, handler: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !event.defaultPrevented
    ) {
      if (!node.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      } else {
        const target = (event.target as HTMLElement)
        const has = target.hasAttribute("data-close-dropdown");
        const value = target.getAttribute("data-close-dropdown");
        if (has && value !== 'false') {
          handler();
        }
      }
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

export interface KeyboardShortcut {
  key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean; stop?: boolean; handle: () => void
}

// src/lib/actions/keyboardShortcut.ts
export function keyboardShortcut(
  node: HTMLElement,
  shortcuts: KeyboardShortcut[]
) {

  const handleKeyDown = (e: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      if (
        e.key === shortcut.key &&
        ((shortcut.ctrl ? e.ctrlKey : true) &&
          (shortcut.meta ? e.metaKey : true) &&
          (shortcut.shift ? e.shiftKey : true) &&
          (shortcut.alt ? e.altKey : true))
      ) {
        if (shortcut.stop) {
          e.preventDefault();
          e.stopPropagation();
        }
        shortcut.handle();
        return;
      }
    });
  };

  window.addEventListener('keydown', handleKeyDown);

  return {
    destroy() {
      window.removeEventListener('keydown', handleKeyDown);
    }
  };
}

export function keyboardVisible(node: HTMLElement, handle: (height: number, isKeyboardVisible: boolean) => void) {
  let timeer: number;
  let windowInnerHeight = -1;
  function update() {
    const visualViewport = window.visualViewport;
    if (visualViewport && 0 < visualViewport.height) {
      if (-1 == windowInnerHeight) {
        windowInnerHeight = visualViewport.height;
        return;
      }
      clearInterval(timeer);
      timeer = setTimeout(() => {
        handle(visualViewport.height, 200 < Math.abs(windowInnerHeight - visualViewport.height));
      }, 100);
    }
  }

  update();
  window.addEventListener("resize", update);

  return {
    destroy() {
      return () => window.removeEventListener("resize", update);
    }
  };
}