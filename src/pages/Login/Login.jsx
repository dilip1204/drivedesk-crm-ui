/** @jsxRuntime classic */
import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  requestLoginOtp,
  userLogin,
  verifyLoginOtp,
} from "../../store/login/actions";
import { PublicBrand } from "../../components/PublicLayout";
import heroImage from "../../assets/img/bg_login.png";
import "./Login.css";

const createCaptchaChallenge = () => ({
  first: Math.floor(Math.random() * 8) + 2,
  second: Math.floor(Math.random() * 8) + 1,
});

const normalizeIndianMobile = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const formatTimer = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

const getOtpApiError = (source, fallbackMessage) => {
  const responseData = source?.response?.data || source?.data || source || {};
  const detail = responseData?.response ?? responseData?.detail ?? responseData;
  const objectDetail = detail && typeof detail === "object" ? detail : {};

  return {
    statusCode: responseData?.statusCode || source?.response?.status,
    message:
      (typeof detail === "string" ? detail : objectDetail?.message) ||
      responseData?.message ||
      fallbackMessage,
    attemptsRemaining: objectDetail?.attempts_remaining,
    resendAfterSeconds: objectDetail?.resend_after_seconds,
  };
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { otpRequestLoader, otpVerifyLoader } = useSelector((state) => state.loginUserInfo);
  const otpInputRef = useRef(null);
  const [loginMode, setLoginMode] = useState("email");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState("");
  const [captcha, setCaptcha] = useState(createCaptchaChallenge);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Enter a valid email address.").required("Please enter your email."),
    password: Yup.string().required("Please enter your password."),
  });

  useEffect(() => {
    if (!otpRequested) return undefined;

    const timerId = window.setInterval(() => {
      setExpiresIn((seconds) => Math.max(0, seconds - 1));
      setResendIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [otpRequested]);

  const completeLogin = (authResponse) => {
    localStorage.setItem("token", `Bearer ${authResponse.access_token}`);

    const tenantInfo = authResponse.tenant_info || {};
    const userRoleInfo = { ...(authResponse.user_info || {}) };
    userRoleInfo.role = authResponse.role || userRoleInfo.role || "";

    localStorage.setItem("userInfo", JSON.stringify(tenantInfo));
    localStorage.setItem("userRoleInfo", JSON.stringify(userRoleInfo));

    navigate(userRoleInfo.role === "super_admin" ? "/superadmin" : "/dashboard");
  };

  const onSubmit = (values, { setSubmitting }) => {
    setLoginError("");
    const data = {
      username: values.email,
      password: values.password,
    };

    dispatch(
      userLogin(data, (res) => {
        if (res && !res.isError && res.response?.access_token) {
          completeLogin(res.response);
        } else if (res?.statusCode === 422 || res?.isError) {
          setLoginError(res?.message || "Invalid login credentials.");
        } else {
          setLoginError(
            res?.response?.data?.response || res?.message || "Login failed. Please try again."
          );
        }
        setSubmitting(false);
      })
    );
  };

  const refreshCaptcha = () => {
    setCaptcha(createCaptchaChallenge());
    setCaptchaAnswer("");
    setCaptchaError("");
  };

  const validateMobile = () => {
    const normalizedMobile = normalizeIndianMobile(mobileNumber);
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      setMobileError("Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.");
      return "";
    }
    setMobileError("");
    return normalizedMobile;
  };

  const validateCaptcha = () => {
    if (Number(captchaAnswer) !== captcha.first + captcha.second) {
      setCaptcha(createCaptchaChallenge());
      setCaptchaAnswer("");
      setCaptchaError("Enter the correct answer before requesting the OTP.");
      return false;
    }
    setCaptchaError("");
    return true;
  };

  const handleRequestOtp = () => {
    setOtpError("");
    setOtpSuccess("");
    setAttemptsRemaining(null);

    const normalizedMobile = validateMobile();
    if (!normalizedMobile || !validateCaptcha()) return;

    dispatch(
      requestLoginOtp(normalizedMobile, (responseData, error) => {
        refreshCaptcha();

        if (error || responseData?.isError || !responseData?.response) {
          const apiError = getOtpApiError(
            error || responseData,
            "Unable to send WhatsApp OTP. Please try again."
          );
          setOtpError(apiError.message);
          if (apiError.resendAfterSeconds) setResendIn(Number(apiError.resendAfterSeconds));
          return;
        }

        const otpDetails = responseData.response;
        setMobileNumber(normalizedMobile);
        setMaskedMobile(otpDetails.mobile_number || `******${normalizedMobile.slice(-4)}`);
        setExpiresIn(Number(otpDetails.expires_in_seconds) || 300);
        setResendIn(Number(otpDetails.resend_after_seconds) || 60);
        setOtpRequested(true);
        setOtp("");
        setOtpSuccess(otpDetails.message || "OTP sent to your registered WhatsApp number.");
        window.setTimeout(() => otpInputRef.current?.focus(), 0);
      })
    );
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    setOtpError("");
    setAttemptsRemaining(null);

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the complete six-digit OTP.");
      return;
    }
    if (expiresIn <= 0) {
      setOtpError("This OTP has expired. Request a new OTP.");
      return;
    }

    const normalizedMobile = validateMobile();
    if (!normalizedMobile) return;

    dispatch(
      verifyLoginOtp(normalizedMobile, otp, (responseData, error) => {
        const authResponse = responseData?.response;

        if (error || responseData?.isError || !authResponse?.access_token) {
          const apiError = getOtpApiError(
            error || responseData,
            "OTP verification failed. Please try again."
          );
          setOtpError(apiError.message);
          setAttemptsRemaining(apiError.attemptsRemaining ?? null);
          if (/expired|already[ -]?used/i.test(apiError.message)) setExpiresIn(0);
          return;
        }

        completeLogin(authResponse);
      })
    );
  };

  const resetOtpLogin = () => {
    setOtpRequested(false);
    setMaskedMobile("");
    setOtp("");
    setOtpError("");
    setOtpSuccess("");
    setMobileError("");
    setExpiresIn(0);
    setResendIn(0);
    setAttemptsRemaining(null);
    refreshCaptcha();
  };

  const switchLoginMode = (mode) => {
    setLoginMode(mode);
    setLoginError("");
    setOtpError("");
    setMobileError("");
  };

  const renderCaptcha = (label = "Human verification") => (
    <div className="login-captcha">
      <div className="login-captcha__challenge">
        <span>{label}</span>
        <strong>{captcha.first} + {captcha.second} = ?</strong>
        <button type="button" onClick={refreshCaptcha} aria-label="Refresh verification question">
          <i className="bi bi-arrow-clockwise" aria-hidden="true" />
        </button>
      </div>
      <div className={`login-input-wrap${captchaError ? " has-error" : ""}`}>
        <i className="bi bi-patch-check" aria-hidden="true" />
        <input
          type="text"
          inputMode="numeric"
          value={captchaAnswer}
          maxLength={2}
          placeholder="Enter answer"
          aria-label="Human verification answer"
          onChange={(event) => {
            setCaptchaAnswer(event.target.value.replace(/\D/g, "").slice(0, 2));
            setCaptchaError("");
          }}
        />
      </div>
      {captchaError && <div className="login-field-error">{captchaError}</div>}
    </div>
  );

  const renderOtpLogin = () => (
    <form
      className="login-form login-otp-form"
      onSubmit={(event) => {
        if (otpRequested) {
          handleVerifyOtp(event);
        } else {
          event.preventDefault();
          handleRequestOtp();
        }
      }}
      noValidate
    >
      {otpSuccess && (
        <div className="login-alert login-alert--success" role="status">
          <i className="bi bi-whatsapp" aria-hidden="true" />
          <span>{otpSuccess}</span>
        </div>
      )}

      {otpError && (
        <div className="login-alert" role="alert">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          <span>
            {otpError}
            {attemptsRemaining !== null && ` ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`}
          </span>
        </div>
      )}

      {!otpRequested ? (
        <div className="login-field">
          <label htmlFor="mobile-number">Registered mobile number</label>
          <div className={`login-input-wrap${mobileError ? " has-error" : ""}`}>
            <i className="bi bi-phone" aria-hidden="true" />
            <input
              type="tel"
              inputMode="numeric"
              id="mobile-number"
              value={mobileNumber}
              maxLength={16}
              placeholder="Enter 10-digit mobile number"
              autoComplete="tel"
              onChange={(event) => {
                setMobileNumber(event.target.value);
                setMobileError("");
                setOtpError("");
              }}
            />
          </div>
          {mobileError && <div className="login-field-error">{mobileError}</div>}
        </div>
      ) : (
        <div className="login-otp-status">
          <div>
            <span>OTP sent to WhatsApp</span>
            <strong>{maskedMobile}</strong>
          </div>
          <button type="button" onClick={resetOtpLogin}>Change number</button>
        </div>
      )}

      {otpRequested && (
        <div className="login-field">
          <div className="login-label-row">
            <label htmlFor="login-otp">Six-digit OTP</label>
            <span className={expiresIn > 0 ? "login-otp-timer" : "login-otp-timer is-expired"}>
              {expiresIn > 0 ? `Expires in ${formatTimer(expiresIn)}` : "OTP expired"}
            </span>
          </div>
          <div className={`login-input-wrap login-otp-input${otpError ? " has-error" : ""}`}>
            <i className="bi bi-shield-lock" aria-hidden="true" />
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              id="login-otp"
              value={otp}
              maxLength={6}
              placeholder="Enter OTP"
              autoComplete="one-time-code"
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
                setAttemptsRemaining(null);
              }}
            />
          </div>
        </div>
      )}

      {otpRequested ? (
        <>
          <button type="submit" className="login-submit" disabled={otpVerifyLoader || otpRequestLoader || expiresIn <= 0}>
            {otpVerifyLoader ? (
              <><span className="login-spinner" aria-hidden="true" /> Verifying…</>
            ) : (
              <>Verify and sign in <i className="bi bi-arrow-right" aria-hidden="true" /></>
            )}
          </button>

          <div className="login-resend-area">
            {resendIn <= 0 && renderCaptcha("Verification required to resend")}
            <button
              type="button"
              className="login-resend"
              disabled={otpRequestLoader || otpVerifyLoader || resendIn > 0}
              onClick={handleRequestOtp}
            >
              {otpRequestLoader
                ? "Sending OTP…"
                : resendIn > 0
                ? `Resend OTP in ${formatTimer(resendIn)}`
                : "Resend OTP"}
            </button>
          </div>
        </>
      ) : (
        <>
          {renderCaptcha()}
          <button type="submit" className="login-submit" disabled={otpRequestLoader}>
            {otpRequestLoader ? (
              <><span className="login-spinner" aria-hidden="true" /> Sending OTP…</>
            ) : (
              <>Send WhatsApp OTP <i className="bi bi-whatsapp" aria-hidden="true" /></>
            )}
          </button>
        </>
      )}
    </form>
  );

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-inner">
          <PublicBrand />
          <Link to="/" className="login-back-link">
            <i className="bi bi-arrow-left" aria-hidden="true" /> Back to website
          </Link>
        </div>
      </header>

      <main className="login-main">
        <div className="login-shell">
          <section className="login-showcase" aria-label="DriveDesk overview">
            <img src={heroImage} alt="Driving instructor guiding a student" />
            <div className="login-showcase-overlay" />
            <div className="login-showcase-content">
              <span className="login-showcase-pill"><i className="bi bi-stars" /> One connected workspace</span>
              <h1>Welcome back to DriveDesk.</h1>
              <p>Stay on top of students, sessions, instructors, payments, expenses, and reports.</p>
              <div className="login-benefits">
                <span><i className="bi bi-check2-circle" /> Daily operations at a glance</span>
                <span><i className="bi bi-check2-circle" /> Clear payment and progress records</span>
                <span><i className="bi bi-check2-circle" /> Responsive access across devices</span>
              </div>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-form-wrap">
              <span className="login-eyebrow">Secure account access</span>
              <h2>Sign in to DriveDesk</h2>
              <p className="login-intro">
                {loginMode === "email"
                  ? "Enter the email and password provided for your organisation."
                  : "Use the registered mobile number to receive a secure WhatsApp OTP."}
              </p>

              <div className="login-method-tabs" role="tablist" aria-label="Choose login method">
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMode === "email"}
                  className={loginMode === "email" ? "is-active" : ""}
                  onClick={() => switchLoginMode("email")}
                >
                  <i className="bi bi-envelope" aria-hidden="true" />
                  Email Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMode === "otp"}
                  className={loginMode === "otp" ? "is-active" : ""}
                  onClick={() => switchLoginMode("otp")}
                >
                  <i className="bi bi-whatsapp" aria-hidden="true" />
                  Mobile OTP Login
                </button>
              </div>

              {loginMode === "email" && loginError && (
                <div className="login-alert" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginMode === "email" ? (
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ isSubmitting, touched, errors }) => (
                  <Form className="login-form" noValidate>
                    <div className="login-field">
                      <label htmlFor="email">Email address</label>
                      <div className={`login-input-wrap${touched.email && errors.email ? " has-error" : ""}`}>
                        <i className="bi bi-envelope" aria-hidden="true" />
                        <Field type="email" name="email" id="email" placeholder="name@example.com" autoComplete="username" />
                      </div>
                      <ErrorMessage name="email" component="div" className="login-field-error" />
                    </div>

                    <div className="login-field">
                      <div className="login-label-row">
                        <label htmlFor="password">Password</label>
                        <Link to="/contact">Need help?</Link>
                      </div>
                      <div className={`login-input-wrap${touched.password && errors.password ? " has-error" : ""}`}>
                        <i className="bi bi-lock" aria-hidden="true" />
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="login-field-error" />
                    </div>

                    <button type="submit" className="login-submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="login-spinner" aria-hidden="true" /> Signing in…</>
                      ) : (
                        <>Sign in <i className="bi bi-arrow-right" aria-hidden="true" /></>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
              ) : renderOtpLogin()}

              <div className="login-support-note">
                <i className="bi bi-shield-check" aria-hidden="true" />
                <span>
                  {loginMode === "email"
                    ? "Your access is protected. Never share your password or login token."
                    : "Never share your WhatsApp OTP. DriveDesk staff will not ask for it."}
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="login-footer">
        <span>© {new Date().getFullYear()} DriveDesk</span>
        <div><Link to="/about">About Us</Link><Link to="/contact">Contact Us</Link></div>
      </footer>
    </div>
  );
};

export default Login;
