// Make an element draggable by its title bar
export function makeDraggable(windowElement, handleElement) {
  let isDragging = false;
  let startX, startY;
  let initialLeft, initialTop;

  handleElement.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on buttons
    if (e.target.closest('.title-bar-controls')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    // Use offsetLeft/offsetTop since they're already relative to the parent container
    initialLeft = windowElement.offsetLeft;
    initialTop = windowElement.offsetTop;

    windowElement.style.transition = 'none';
    handleElement.style.cursor = 'grabbing';

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Calculate new position relative to container
    const newLeft = initialLeft + deltaX;
    const newTop = initialTop + deltaY;

    windowElement.style.left = newLeft + 'px';
    windowElement.style.top = newTop + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      handleElement.style.cursor = 'grab';
    }
  });

  // Set initial cursor
  handleElement.style.cursor = 'grab';
}
