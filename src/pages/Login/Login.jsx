/** @jsxRuntime classic */
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { userLogin } from "../../store/login/actions";
import { PublicBrand } from "../../components/PublicLayout";
import heroImage from "../../assets/img/bg_login.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Enter a valid email address.").required("Please enter your email."),
    password: Yup.string().required("Please enter your password."),
  });

  const onSubmit = (values, { setSubmitting }) => {
    setLoginError("");
    const data = {
      username: values.email,
      password: values.password,
    };

    dispatch(
      userLogin(data, (res) => {
        if (res && !res.isError && res.response?.access_token) {
          localStorage.setItem("token", `Bearer ${res.response.access_token}`);

          const tenantInfo = res.response.tenant_info;
          const userRoleInfo = res.response.user_info || {};
          userRoleInfo.role = res.response.user_info?.role || userRoleInfo.role || "";

          localStorage.setItem("userInfo", JSON.stringify(tenantInfo));
          localStorage.setItem("userRoleInfo", JSON.stringify(userRoleInfo));

          const redirectPath = userRoleInfo.role === "super_admin" ? "/superadmin" : "/dashboard";
          navigate(redirectPath);
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
              <p className="login-intro">Enter the email and password provided for your organisation.</p>

              {loginError && (
                <div className="login-alert" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}

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

              <div className="login-support-note">
                <i className="bi bi-shield-check" aria-hidden="true" />
                <span>Your access is protected. Never share your password or login token.</span>
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
