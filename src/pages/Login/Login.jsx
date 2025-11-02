import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { userLogin } from "../../store/login/actions";
import logo from "../../assets/logo/logo.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState("");

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email")
      .required("Please enter your email."),
    // ✅ Removed min(4) validation for password
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
          // Save token
          localStorage.setItem("token", `Bearer ${res.response.access_token}`);

          // Save user details
          const tenantInfo = res.response.tenant_info;
          const userRoleInfo = res.response.user_info || {};
          userRoleInfo.role =
            res.response.user_info?.role || userRoleInfo.role || "";

          localStorage.setItem("userInfo", JSON.stringify(tenantInfo));
          localStorage.setItem("userRoleInfo", JSON.stringify(userRoleInfo));

          navigate("/dashboard");
        } else if (res?.statusCode === 422 || res?.isError) {
          const errMsg = res?.message || "Invalid login credentials.";
          setLoginError(errMsg);
        } else {
          const msg =
            res?.response?.data?.response ||
            res?.message ||
            "Login failed. Please try again.";
          setLoginError(msg);
        }
        setSubmitting(false);
      })
    );
  };

  return (
    <div
      id="dd-login"
      className="d-flex align-items-center justify-content-center"
      style={{ padding: "25px 0" }}
    >
      <div className="row justify-content-end" style={{ marginLeft: "250px" }}>
        <div className="col-lg-6 col-md-10">
          <div className="card">
            <div className="card-header bg-primary card-logo-center">
              <div className="app-brand app-logo">
                <a href="#">
                  <img src={logo} alt="logo" />
                </a>
              </div>
            </div>

            <div className="card-body p-5">
              <h4 className="text-dark mb-5">Sign In</h4>

              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form>
                    <div className="row">
                      {/* Email */}
                      <div className="form-group col-md-12 mb-4">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          placeholder="Enter your email"
                          className={`form-control input-lg ${
                            touched.email
                              ? errors.email
                                ? "is-invalid"
                                : "is-valid"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      {/* Password */}
                      <div className="form-group col-md-12 mb-4">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <Field
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Enter your password"
                          className={`form-control input-lg ${
                            touched.password
                              ? errors.password
                                ? "is-invalid"
                                : "is-valid"
                              : ""
                          }`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      {/* Remember + Forgot */}
                      <div className="col-md-12">
                        <div className="d-flex my-2 justify-content-between">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="rememberMe"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rememberMe"
                            >
                              Remember me
                            </label>
                          </div>
                          <p>
                            <a className="text-blue" href="#">
                              Forgot Your Password?
                            </a>
                          </p>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-lg btn-primary btn-block mb-4 d-flex align-items-center justify-content-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="loader me-2"></div> Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
