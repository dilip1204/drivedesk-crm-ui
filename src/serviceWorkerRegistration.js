export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`, { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("DriveDesk service worker registration failed:", error);
      });
  });
};
