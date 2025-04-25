export function autoFocus(node: HTMLElement, focused: boolean) {
  if (focused) node.focus();

  return {
    update(focused: boolean) {
      if (focused) {
        setTimeout(() => {
          node.focus();
        }, 100);
      }
    }
  };
}