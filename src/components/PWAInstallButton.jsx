import React, { useEffect, useState } from "react";

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true
  );

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

  if (isInstalled) return null;

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    window.alert(
      isIOS
        ? "To install DriveDesk, tap Share and then Add to Home Screen."
        : "DriveDesk is preparing for installation. Refresh once, then use Install App again or choose Install DriveDesk from your browser menu."
    );
  };

  return (
    <button type="button" className="btn btn-outline-primary mb-1 mr-2" onClick={installApp}>
      <i className="mdi mdi-monitor-arrow-down mr-1" aria-hidden="true" />
      {installPrompt ? "Install App" : "Get DriveDesk App"}
    </button>
  );
}
