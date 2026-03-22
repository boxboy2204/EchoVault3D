const promptStat = document.getElementById("promptStat");
const overlayCard = document.getElementById("overlayCard");

function showBootError(error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (promptStat) {
    promptStat.textContent = `Startup error: ${message}`;
  }
  if (overlayCard) {
    overlayCard.innerHTML = `<strong>Startup Error</strong>${message}`;
  }
  console.error(error);
}

if (promptStat) {
  promptStat.textContent = "Loading 3D sanctuary...";
}

if (overlayCard) {
  overlayCard.innerHTML = "<strong>Loading</strong>Starting 3D renderer...";
}

window.addEventListener("error", (event) => {
  showBootError(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  showBootError(event.reason);
});
