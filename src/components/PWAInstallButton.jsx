import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PWAInstallButton.css";

const INSTALL_CONFIRMED_KEY = "drivedeskPwaInstalled";

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
  ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some(
    (mode) => window.matchMedia?.(`(display-mode: ${mode})`)?.matches
  ) ||
  window.navigator.standalone === true ||
  document.referrer.startsWith("android-app://");

const wasInstallationConfirmed = () =>
  window.localStorage.getItem(INSTALL_CONFIRMED_KEY) === "true";

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [mobilePlatform] = useState(getMobilePlatform);
  const [isInstalled, setIsInstalled] = useState(
    () => isRunningAsInstalledApp() || wasInstallationConfirmed()
  );
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
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

  useEffect(() => {
    if (!showIOSInstructions) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setShowIOSInstructions(false);
    };

    window.addEventListener("keydown", handleEscape);
    document.body.classList.add("pwa-guide-open");

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("pwa-guide-open");
    };
  }, [showIOSInstructions]);

  const showInstallButton = !isInstalled && Boolean(mobilePlatform);

  useEffect(() => {
    document.body.classList.toggle("pwa-install-visible", showInstallButton);

    return () => document.body.classList.remove("pwa-install-visible");
  }, [showInstallButton]);

  if (!showInstallButton) return null;

  const installApp = async () => {
    if (mobilePlatform === "ios") {
      setShowIOSInstructions(true);
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
        setInstallPrompt(null);
        setIsInstalled(true);
      }
      return;
    }

    window.alert("To install DriveDesk, open your browser menu and tap Install app or Add to Home screen.");
  };

  return (
    <>
      <button type="button" className="btn btn-outline-primary pwa-install-button" onClick={installApp}>
        <i className="mdi mdi-monitor-arrow-down mr-1" aria-hidden="true" />
        Install App
      </button>

      {showIOSInstructions && createPortal(
        <div
          className="pwa-ios-guide-backdrop"
          role="presentation"
          onClick={() => setShowIOSInstructions(false)}
        >
          <section
            className="pwa-ios-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-ios-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pwa-ios-guide-close"
              aria-label="Close installation instructions"
              onClick={() => setShowIOSInstructions(false)}
            >
              &times;
            </button>

            <div className="pwa-ios-guide-icon" aria-hidden="true">
              <i className="mdi mdi-cellphone-arrow-down" />
            </div>
            <h2 id="pwa-ios-guide-title">Install DriveDesk</h2>
            <p>Add DriveDesk to your iPhone or iPad Home Screen.</p>

            <ol className="pwa-ios-guide-steps">
              <li><span>1</span><div>Tap the <strong>Share</strong> button <i className="mdi mdi-export-variant" aria-hidden="true" /> in your browser.</div></li>
              <li><span>2</span><div>Select <strong>Add to Home Screen</strong>.</div></li>
              <li><span>3</span><div>Tap <strong>Add</strong> to finish.</div></li>
            </ol>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setShowIOSInstructions(false)}
            >
              I’ll add it now
            </button>
            <button
              type="button"
              className="btn btn-link btn-block pwa-ios-installed-confirm"
              onClick={() => {
                window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
                setShowIOSInstructions(false);
                setIsInstalled(true);
              }}
            >
              I’ve already installed it — hide this button
            </button>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
