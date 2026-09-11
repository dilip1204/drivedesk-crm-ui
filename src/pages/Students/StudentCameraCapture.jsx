import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const CLOSED_THRESHOLD = 0.35;
const OPEN_THRESHOLD = 0.2;

const MIN_FACE_WIDTH = 0.16;
const MAX_FACE_WIDTH = 0.7;
const MIN_FACE_CENTER_X = 0.22;
const MAX_FACE_CENTER_X = 0.78;
const MIN_FACE_CENTER_Y = 0.18;
const MAX_FACE_CENTER_Y = 0.82;

const MIN_BRIGHTNESS = 55;
const MAX_BRIGHTNESS = 225;
const MIN_BLUR_SCORE = 35;

const OUTPUT_WIDTH = 600;
const OUTPUT_HEIGHT = 750;
const REQUIRED_STABLE_FRAMES = 8;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getFaceBox(landmarks = []) {
  if (!landmarks.length) return null;

  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;

  landmarks.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}

function getAverageBrightness(video) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  let total = 0;
  let samples = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    samples += 1;
  }

  return samples ? total / samples : null;
}

function getCanvasBrightness(canvas) {
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = 120;

  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(canvas, 0, 0, sample.width, sample.height);
  const { data } = context.getImageData(0, 0, sample.width, sample.height);

  let total = 0;
  let samples = 0;

  for (let i = 0; i < data.length; i += 16) {
    total +=
      0.2126 * data[i] +
      0.7152 * data[i + 1] +
      0.0722 * data[i + 2];
    samples += 1;
  }

  return samples ? total / samples : null;
}

function getBlurScore(canvas) {
  const sample = document.createElement("canvas");
  sample.width = 160;
  sample.height = 200;

  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(canvas, 0, 0, sample.width, sample.height);
  const { data } = context.getImageData(0, 0, sample.width, sample.height);

  const width = sample.width;
  const height = sample.height;
  const gray = new Float32Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] =
      0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }

  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const laplacian =
        4 * gray[index] -
        gray[index - 1] -
        gray[index + 1] -
        gray[index - width] -
        gray[index + width];

      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count += 1;
    }
  }

  if (!count) return null;
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

function drawProfileCrop(video, faceBox) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const targetAspect = OUTPUT_WIDTH / OUTPUT_HEIGHT;

  let cropWidth = sourceWidth * 0.78;
  let cropHeight = cropWidth / targetAspect;

  if (faceBox) {
    const faceWidthPx = faceBox.width * sourceWidth;
    const faceHeightPx = faceBox.height * sourceHeight;

    cropWidth = Math.max(faceWidthPx / 0.46, 420);
    cropHeight = cropWidth / targetAspect;

    if (faceHeightPx / cropHeight > 0.55) {
      cropHeight = faceHeightPx / 0.5;
      cropWidth = cropHeight * targetAspect;
    }
  }

  if (cropWidth > sourceWidth) {
    cropWidth = sourceWidth;
    cropHeight = cropWidth / targetAspect;
  }

  if (cropHeight > sourceHeight) {
    cropHeight = sourceHeight;
    cropWidth = cropHeight * targetAspect;
  }

  const faceCenterX = faceBox?.centerX ?? 0.5;
  const faceCenterY = faceBox?.centerY ?? 0.44;
  const faceHeight = faceBox?.height ?? 0.25;

  const cropCenterX = faceCenterX * sourceWidth;
  const cropCenterY = (faceCenterY + faceHeight * 0.2) * sourceHeight;

  const sx = clamp(cropCenterX - cropWidth / 2, 0, sourceWidth - cropWidth);
  const sy = clamp(cropCenterY - cropHeight * 0.42, 0, sourceHeight - cropHeight);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    video,
    sx,
    sy,
    cropWidth,
    cropHeight,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  return canvas;
}

export default function StudentCameraCapture({ onUsePhoto, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const blinkPhaseRef = useRef("waiting-open");
  const lastVideoTimeRef = useRef(-1);
  const latestFaceBoxRef = useRef(null);
  const frameCountRef = useRef(0);
  const latestBrightnessRef = useRef(null);
  const captureTimerRef = useRef(null);
  const isCapturingRef = useRef(false);
  const stableFramesRef = useRef(0);

  const [cameraFacing, setCameraFacing] = useState("user");
  const [message, setMessage] = useState("Starting front camera…");
  const [error, setError] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState("");
  const [isStarting, setIsStarting] = useState(true);
  const [faceReady, setFaceReady] = useState(false);
  const [qualityIssues, setQualityIssues] = useState([]);

  const cameraLabel = cameraFacing === "user" ? "front" : "back";

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (captureTimerRef.current) {
      window.clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    animationRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback((faceBoxOverride = null) => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;

    const video = videoRef.current;

    if (!video?.videoWidth || !video?.videoHeight) {
      setError("Camera is not ready. Please try again.");
      isCapturingRef.current = false;
      return;
    }

    const canvas = drawProfileCrop(video, faceBoxOverride || latestFaceBoxRef.current);
    if (!canvas) {
      setError("Photo capture is not supported by this browser.");
      isCapturingRef.current = false;
      return;
    }

    const brightness = getCanvasBrightness(canvas);
    const blurScore = getBlurScore(canvas);
    const issues = [];

    if (brightness !== null && brightness < MIN_BRIGHTNESS) {
      issues.push("Lighting is too dark");
    } else if (brightness !== null && brightness > MAX_BRIGHTNESS) {
      issues.push("Lighting is too bright");
    }

    if (blurScore !== null && blurScore < MIN_BLUR_SCORE) {
      issues.push("Photo looks slightly blurry");
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Photo capture failed. Please try again.");
          isCapturingRef.current = false;
          return;
        }

        setQualityIssues(issues);
        setCapturedBlob(blob);
        setMessage(
          issues.length
            ? `${issues.join(". ")}. You can retake for better quality.`
            : "Photo quality looks good. Preview it before using."
        );
        isCapturingRef.current = false;
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
        const landmarks = result.faceLandmarks?.[0] || [];
        const categories = result.faceBlendshapes?.[0]?.categories || [];
        const scores = Object.fromEntries(
          categories.map(({ categoryName, score }) => [categoryName, score])
        );

        const faceBox = getFaceBox(landmarks);
        latestFaceBoxRef.current = faceBox;

        frameCountRef.current += 1;
        if (frameCountRef.current % 8 === 0) {
          latestBrightnessRef.current = getAverageBrightness(video);
        }

        const brightness = latestBrightnessRef.current;
        let positioningMessage = "";

        if (!faceBox) {
          positioningMessage = "Position one face clearly inside the frame.";
        } else if (faceBox.width < MIN_FACE_WIDTH) {
          positioningMessage = "Move a little closer to the camera.";
        } else if (faceBox.width > MAX_FACE_WIDTH) {
          positioningMessage = "Move slightly back from the camera.";
        } else if (
          faceBox.centerX < MIN_FACE_CENTER_X ||
          faceBox.centerX > MAX_FACE_CENTER_X ||
          faceBox.centerY < MIN_FACE_CENTER_Y ||
          faceBox.centerY > MAX_FACE_CENTER_Y
        ) {
          positioningMessage = "Center your face inside the frame.";
        }

        const positionReady = !positioningMessage;

        if (!positionReady) {
          stableFramesRef.current = 0;
          setFaceReady(false);
          isCapturingRef.current = false;
          blinkPhaseRef.current = "waiting-open";
          setMessage(positioningMessage);
        } else {
          stableFramesRef.current = Math.min(
            stableFramesRef.current + 1,
            REQUIRED_STABLE_FRAMES
          );

          const stableReady =
            stableFramesRef.current >= REQUIRED_STABLE_FRAMES;

          setFaceReady(stableReady);

          if (!stableReady) {
            blinkPhaseRef.current = "waiting-open";
            setMessage("Great position — hold still for a moment.");
          } else {
          const lightingWarning =
            brightness !== null && brightness < MIN_BRIGHTNESS
              ? " Lighting is a little dark."
              : brightness !== null && brightness > MAX_BRIGHTNESS
              ? " Lighting is very bright."
              : "";

          const left = scores.eyeBlinkLeft;
          const right = scores.eyeBlinkRight;

          if (left === undefined || right === undefined) {
            blinkPhaseRef.current = "waiting-open";
            setMessage("Keep your face clear and look at the camera.");
          } else {
            const blinkScore = (left + right) / 2;
            const eyesClosed = blinkScore > CLOSED_THRESHOLD;
            const eyesOpen = blinkScore < OPEN_THRESHOLD;

            if (blinkPhaseRef.current === "waiting-open" && eyesOpen) {
              blinkPhaseRef.current = "waiting-closed";
              setMessage(`Perfect — blink once to take the photo.${lightingWarning}`);
            } else if (
              blinkPhaseRef.current === "waiting-closed" &&
              eyesClosed
            ) {
              blinkPhaseRef.current = "waiting-reopen";
              setMessage("Blink detected — open your eyes.");
            } else if (
              blinkPhaseRef.current === "waiting-reopen" &&
              eyesOpen
            ) {
              blinkPhaseRef.current = "capturing";
              setMessage("Great! Hold still…");
              animationRef.current = null;

              const faceBoxAtBlink = faceBox;
              captureTimerRef.current = window.setTimeout(() => {
                captureTimerRef.current = null;
                capturePhoto(faceBoxAtBlink);
              }, 350);
              return;
            }
          }
          }
        }
      } catch (detectionError) {
        console.error("Face/blink detection failed:", detectionError);
        setFaceReady(false);
        setMessage(
          "Automatic face verification is unavailable. Please capture manually."
        );
      }
    }

    animationRef.current = requestAnimationFrame(detectBlink);
  }, [capturePhoto]);

  const getCameraErrorMessage = useCallback(
    (cameraError) => {
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
    },
    [cameraLabel]
  );

  const startCamera = useCallback(
    async (facingMode = cameraFacing) => {
      stopCamera();

      landmarkerRef.current?.close();
      landmarkerRef.current = null;

      setError("");
      setCapturedBlob(null);
      setQualityIssues([]);
      setFaceReady(false);
      latestFaceBoxRef.current = null;
      latestBrightnessRef.current = null;
      frameCountRef.current = 0;
      stableFramesRef.current = 0;
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
          FilesetResolver.forVisionTasks(`${process.env.PUBLIC_URL}/mediapipe`),
          navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 960 },
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
        setMessage("Center your face inside the frame.");
        animationRef.current = requestAnimationFrame(detectBlink);
      } catch (cameraError) {
        stopCamera();
        setIsStarting(false);
        setFaceReady(false);
        setError(getCameraErrorMessage(cameraError));
      }
    },
    [cameraFacing, detectBlink, getCameraErrorMessage, stopCamera]
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
    setQualityIssues([]);
    stableFramesRef.current = 0;
    isCapturingRef.current = false;
    startCamera(cameraFacing);
  };


  const handleManualCapture = () => {
    if (isStarting || capturedBlob) return;

    if (!latestFaceBoxRef.current) {
      setMessage("Position your face inside the frame before capturing.");
      return;
    }

    if (!faceReady) {
      const shouldContinue = window.confirm(
        "Your face is not fully centered or stable yet. Capture anyway?"
      );
      if (!shouldContinue) return;
    }

    capturePhoto(latestFaceBoxRef.current);
  };

  const usePhoto = () => {
    if (!capturedBlob) return;

    const file = new File(
      [capturedBlob],
      `student-profile-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    onUsePhoto(file);
  };

  return (
    <div
      className="student-camera"
      role="dialog"
      aria-modal="true"
      aria-label="Capture student profile photo"
    >
      <div className="student-camera-card student-camera-card--modern">
        <div className="student-camera-header student-camera-header--modern">
          <div className="student-camera-heading">
            <div className="student-camera-heading-icon" aria-hidden="true">
              <i className="bi bi-camera-fill" />
            </div>
            <div>
              <h5>Take Student Photo</h5>
              <p>Keep the face clear and centered</p>
            </div>
          </div>

          <button
            type="button"
            className="student-camera-close"
            aria-label="Close camera"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="student-camera-stage student-camera-stage--modern">
          {capturedUrl ? (
            <img
              src={capturedUrl}
              alt="Captured student profile preview"
              className="student-camera-preview-image"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              aria-label={`${cameraLabel} camera preview`}
              className={cameraFacing === "user" ? "is-front-camera" : ""}
            />
          )}

          {!capturedUrl && !error && (
            <>
              <div
                className={`student-camera-auto-badge${
                  faceReady ? " is-ready" : ""
                }`}
              >
                <span className="student-camera-auto-dot" />
                {faceReady ? "Ready — blink once" : "Checking photo quality"}
              </div>

              <button
                type="button"
                className="student-camera-switch-fab"
                onClick={handleSwitchCamera}
                disabled={isStarting}
                aria-label={
                  cameraFacing === "user"
                    ? "Switch to back camera"
                    : "Switch to front camera"
                }
              >
                <i className="bi bi-arrow-repeat" aria-hidden="true" />
                <span>{cameraFacing === "user" ? "Front" : "Back"}</span>
              </button>

              <div
                className={`student-camera-face-frame${
                  faceReady ? " is-ready" : ""
                }`}
                aria-hidden="true"
              >
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
              </div>
            </>
          )}

          {isStarting && !capturedUrl && !error && (
            <div className="student-camera-loading">
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
              <span>Starting camera…</span>
            </div>
          )}

          {error && !capturedUrl && (
            <div className="student-camera-error-overlay">
              <div className="student-camera-error-icon" aria-hidden="true">
                <i className="bi bi-camera-video-off" />
              </div>
              <strong>Camera unavailable</strong>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="student-camera-content">
          <div
            className={`student-camera-status${error ? " is-error" : ""}${
              capturedBlob && !qualityIssues.length ? " is-success" : ""
            }${capturedBlob && qualityIssues.length ? " is-warning" : ""}`}
            aria-live="polite"
          >
            <div className="student-camera-status-icon" aria-hidden="true">
              <i
                className={
                  error
                    ? "bi bi-exclamation-circle-fill"
                    : capturedBlob && qualityIssues.length
                    ? "bi bi-exclamation-triangle-fill"
                    : capturedBlob
                    ? "bi bi-check-circle-fill"
                    : "bi bi-person-bounding-box"
                }
              />
            </div>
            <div>
              <strong>
                {error
                  ? "Unable to use camera"
                  : capturedBlob && qualityIssues.length
                  ? "Photo can be improved"
                  : capturedBlob
                  ? "Photo ready"
                  : faceReady
                  ? "Ready to capture"
                  : "Face verification"}
              </strong>
              <span>{error || message}</span>
            </div>
          </div>

          {!capturedBlob && !error && !faceReady && (
            <div className="student-camera-tip">
              <i className="bi bi-lightbulb" aria-hidden="true" />
              <span>
                When your face is centered and lighting is good, blink once for
                automatic capture.
              </span>
            </div>
          )}

          <div className="student-camera-actions student-camera-actions--modern">
            {capturedBlob ? (
              <>
                <button
                  type="button"
                  className="btn student-camera-secondary-btn"
                  onClick={handleRetake}
                >
                  <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                  />
                  Retake
                </button>
                <button
                  type="button"
                  className="btn btn-primary student-camera-primary-btn"
                  onClick={usePhoto}
                >
                  <i className="bi bi-check2" aria-hidden="true" />
                  {qualityIssues.length ? "Use Anyway" : "Use Photo"}
                </button>
              </>
            ) : error ? (
              <>
                <button
                  type="button"
                  className="btn student-camera-secondary-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary student-camera-primary-btn"
                  onClick={() => startCamera(cameraFacing)}
                >
                  <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                  Try Again
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn student-camera-secondary-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary student-camera-primary-btn"
                  onClick={handleManualCapture}
                  disabled={isStarting}
                >
                  <i className="bi bi-camera" aria-hidden="true" />
                  Capture Manually
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
