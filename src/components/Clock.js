// Taskbar clock component
export function createClock(container) {
  const clockElement = document.createElement('div');
  clockElement.className = 'taskbar-clock';
  container.appendChild(clockElement);

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    clockElement.textContent = `${hours}:${minutes} ${ampm}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  return clockElement;
}
