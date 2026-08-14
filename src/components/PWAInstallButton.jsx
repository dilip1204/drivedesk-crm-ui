import React, { useEffect, useState } from "react";

const getMobilePlatform = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  if (isIOS) return "ios";
  if (/android/.test(userAgent)) return "android";
  return null;
};

const isRunningAsInstalledApp = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  window.navigator.standalone === true;

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [mobilePlatform] = useState(getMobilePlatform);
  const [isInstalled, setIsInstalled] = useState(isRunningAsInstalledApp);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isInstalled || !mobilePlatform) return null;

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }

    window.alert(
      mobilePlatform === "ios"
        ? "To install DriveDesk, tap Share and then Add to Home Screen."
        : "To install DriveDesk, open your browser menu and tap Install app or Add to Home screen."
    );
  };

  return (
    <button type="button" className="btn btn-outline-primary mb-1 mr-2" onClick={installApp}>
      <i className="mdi mdi-monitor-arrow-down mr-1" aria-hidden="true" />
      Install App
    </button>
  );
}
