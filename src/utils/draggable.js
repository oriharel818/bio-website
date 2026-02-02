// Make an element draggable by its title bar
export function makeDraggable(windowElement, handleElement) {
  let isDragging = false;
  let startX, startY;
  let initialLeft, initialTop;

  function startDrag(clientX, clientY) {
    isDragging = true;
    startX = clientX;
    startY = clientY;

    // Use offsetLeft/offsetTop since they're already relative to the parent container
    initialLeft = windowElement.offsetLeft;
    initialTop = windowElement.offsetTop;

    windowElement.style.transition = 'none';
    handleElement.style.cursor = 'grabbing';
  }

  function moveDrag(clientX, clientY) {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Calculate new position relative to container
    const newLeft = initialLeft + deltaX;
    const newTop = initialTop + deltaY;

    windowElement.style.left = newLeft + 'px';
    windowElement.style.top = newTop + 'px';
  }

  function endDrag() {
    if (isDragging) {
      isDragging = false;
      handleElement.style.cursor = 'grab';
    }
  }

  // Mouse events
  handleElement.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on buttons
    if (e.target.closest('.title-bar-controls')) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    moveDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', endDrag);

  // Touch events for mobile
  handleElement.addEventListener('touchstart', (e) => {
    // Don't drag if touching buttons
    if (e.target.closest('.title-bar-controls')) return;
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener('touchend', endDrag);

  // Set initial cursor
  handleElement.style.cursor = 'grab';
}
