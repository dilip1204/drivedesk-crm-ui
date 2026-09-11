import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const CLOSED_THRESHOLD = 0.55;
const OPEN_THRESHOLD = 0.25;

export default function StudentCameraCapture({ onUsePhoto, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const blinkPhaseRef = useRef("waiting-open");
  const lastVideoTimeRef = useRef(-1);

  const [cameraFacing, setCameraFacing] = useState("user");
  const [message, setMessage] = useState("Starting front camera…");
  const [error, setError] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState("");
  const [isStarting, setIsStarting] = useState(true);

  const cameraLabel = cameraFacing === "user" ? "front" : "back";

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;

    if (!video?.videoWidth || !video?.videoHeight) {
      setError("Camera is not ready. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Photo capture is not supported by this browser.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Photo capture failed. Please try again.");
          return;
        }

        setCapturedBlob(blob);
        setMessage("Photo captured. Preview it before using.");
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }, [stopCamera]);

  const detectBlink = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectBlink);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const categories = result.faceBlendshapes?.[0]?.categories || [];
        const scores = Object.fromEntries(
          categories.map(({ categoryName, score }) => [categoryName, score])
        );

        const left = scores.eyeBlinkLeft;
        const right = scores.eyeBlinkRight;

        if (left === undefined || right === undefined) {
          blinkPhaseRef.current = "waiting-open";
          setMessage("Position one face clearly inside the camera.");
        } else {
          const bothClosed =
            left > CLOSED_THRESHOLD && right > CLOSED_THRESHOLD;
          const bothOpen = left < OPEN_THRESHOLD && right < OPEN_THRESHOLD;

          if (blinkPhaseRef.current === "waiting-open" && bothOpen) {
            blinkPhaseRef.current = "waiting-closed";
            setMessage("Face detected. Please blink your eyes.");
          } else if (
            blinkPhaseRef.current === "waiting-closed" &&
            bothClosed
          ) {
            blinkPhaseRef.current = "waiting-reopen";
            setMessage("Blink detected — open your eyes.");
          } else if (
            blinkPhaseRef.current === "waiting-reopen" &&
            bothOpen
          ) {
            capturePhoto();
            return;
          }
        }
      } catch (detectionError) {
        console.error("Face/blink detection failed:", detectionError);
        setMessage(
          "Automatic blink detection is unavailable. Please capture manually."
        );
      }
    }

    animationRef.current = requestAnimationFrame(detectBlink);
  }, [capturePhoto]);

  const getCameraErrorMessage = (cameraError) => {
    switch (cameraError?.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera permission was denied. Allow camera access in your browser settings, or upload a photo instead.";
      case "NotFoundError":
      case "OverconstrainedError":
        return `The ${cameraLabel} camera is not available on this device. Try the other camera or upload a photo.`;
      case "NotReadableError":
        return "The camera is currently unavailable or being used by another application.";
      default:
        return (
          cameraError?.message ||
          "The camera is unavailable. Please upload a photo instead."
        );
    }
  };

  const startCamera = useCallback(
    async (facingMode = cameraFacing) => {
      stopCamera();

      landmarkerRef.current?.close();
      landmarkerRef.current = null;

      setError("");
      setCapturedBlob(null);
      blinkPhaseRef.current = "waiting-open";
      lastVideoTimeRef.current = -1;
      setIsStarting(true);
      setMessage(
        `Starting ${facingMode === "user" ? "front" : "back"} camera…`
      );

      try {
        if (!window.isSecureContext) {
          throw new Error(
            "Camera access requires HTTPS (or localhost during development)."
          );
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported by this browser.");
        }

        const [vision, stream] = await Promise.all([
          FilesetResolver.forVisionTasks(
            `${process.env.PUBLIC_URL}/mediapipe`
          ),
          navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 720 },
              height: { ideal: 720 },
            },
            audio: false,
          }),
        ]);

        streamRef.current = stream;

        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `${process.env.PUBLIC_URL}/mediapipe/face_landmarker.task`,
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
        });

        if (!videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          landmarkerRef.current.close();
          landmarkerRef.current = null;
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setIsStarting(false);
        setMessage("Position your face inside the frame.");
        animationRef.current = requestAnimationFrame(detectBlink);
      } catch (cameraError) {
        stopCamera();
        setIsStarting(false);
        setError(getCameraErrorMessage(cameraError));
      }
    },
    [cameraFacing, detectBlink, stopCamera]
  );

  useEffect(() => {
    startCamera(cameraFacing);

    return () => {
      stopCamera();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [cameraFacing, startCamera, stopCamera]);

  useEffect(() => {
    if (!capturedBlob) {
      setCapturedUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(capturedBlob);
    setCapturedUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [capturedBlob]);

  const handleSwitchCamera = () => {
    if (isStarting || capturedBlob) return;
    setCameraFacing((current) =>
      current === "user" ? "environment" : "user"
    );
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setError("");
    startCamera(cameraFacing);
  };

  const usePhoto = () => {
    if (!capturedBlob) return;

    onUsePhoto(
      new File([capturedBlob], `student-profile-${Date.now()}.jpg`, {
        type: "image/jpeg",
      })
    );
  };

  return (
    <div
      className="student-camera"
      role="dialog"
      aria-modal="true"
      aria-label="Capture student profile photo"
    >
      <div className="student-camera-card">
        <div className="student-camera-header">
          <h5>Capture Profile Photo</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close camera"
            onClick={onClose}
          />
        </div>

        <div className="student-camera-stage">
          {capturedUrl ? (
            <img
              src={capturedUrl}
              alt="Captured student profile preview"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              aria-label={`${cameraLabel} camera preview`}
            />
          )}

          {!capturedUrl && (
            <span className="student-camera-guide" aria-hidden="true" />
          )}
        </div>

        <div
          className={`student-camera-message${error ? " is-error" : ""}`}
          aria-live="polite"
        >
          {error || message}
        </div>

        <div className="student-camera-actions">
          {capturedBlob ? (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleRetake}
              >
                Retake
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={usePhoto}
              >
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              {!error && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleSwitchCamera}
                    disabled={isStarting}
                  >
                    {cameraFacing === "user"
                      ? "Use Back Camera"
                      : "Use Front Camera"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={capturePhoto}
                    disabled={isStarting}
                  >
                    Capture Manually
                  </button>
                </>
              )}

              {error && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => startCamera(cameraFacing)}
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
