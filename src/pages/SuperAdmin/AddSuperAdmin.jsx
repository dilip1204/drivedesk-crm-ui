import React from "react";
import { Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addSuperAdmin, updateSuperAdmin } from "../../store/superAdmin/actions";

export default function AddSuperAdmin({ showModal, hideModal, isEdit = false, selected = null, onSuccess }) {
    const dispatch = useDispatch();

    const initialValues = isEdit
        ? {
            org_name: selected?.org_name || "",
            address: selected?.address || "",
            pincode: selected?.pincode || "",
            mobile_number_primary: selected?.mobile_number_primary || "",
            mobile_number_secondary: selected?.mobile_number_secondary || "",
            email: selected?.email || "",
            test_location: selected?.test_location || "",
            whatsapp_enabled: selected?.whatsapp_enabled || false,
            whatsapp_registered_number: selected?.whatsapp_registered_number || "",
            google_review_link: selected?.google_review_link || "",
        }
        : {
            org_name: "",
            proprietor: "",
            address: "",
            pincode: "",
            mobile_number_primary: "",
            mobile_number_secondary: "",
            email: "",
            password: "",
            test_location: "",
            whatsapp_enabled: false,
            whatsapp_registered_number: "",
            google_review_link: "",
        };

    const validationSchema = isEdit
        ? Yup.object({
            org_name: Yup.string().required("Organisation name is required"),
            mobile_number_primary: Yup.string().required("Primary mobile is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
        })
        : Yup.object({
            org_name: Yup.string().required("Organisation name is required"),
            proprietor: Yup.string().required("Proprietor is required"),
            mobile_number_primary: Yup.string().required("Primary mobile is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
            password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (isEdit) {
                dispatch(
                    updateSuperAdmin(
                        { mobile_number: selected?.mobile_number_primary, ...values },
                        (res) => {
                            setSubmitting(false);
                            if (res?.isError === false || res?.statusCode === 200) {
                                onSuccess("updated");
                            } else {
                                onSuccess(null, res);
                            }
                        }
                    )
                );
            } else {
                dispatch(
                    addSuperAdmin(values, (res) => {
                        setSubmitting(false);
                        if (res?.isError === false || res?.statusCode === 200 || res?.statusCode === 201) {
                            onSuccess("added");
                        } else {
                            onSuccess(null, res);
                        }
                    })
                );
            }
        },
    });

    const field = (label, name, type = "text", required = false, placeholder = "") => (
        <div className="col-md-6 superadmin-form-field">
            <label className="form-label" htmlFor={`tenant-${name}`}>
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <input
                id={`tenant-${name}`}
                type={type}
                className={`form-control ${formik.touched[name] && formik.errors[name] ? "is-invalid" : ""}`}
                name={name}
                value={formik.values[name]}
                placeholder={placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
            />
            {formik.touched[name] && formik.errors[name] && (
                <div className="invalid-feedback">{formik.errors[name]}</div>
            )}
        </div>
    );

    return (
        <Modal
            show={showModal}
            onHide={hideModal}
            size="lg"
            centered
            dialogClassName="superadmin-modal superadmin-form-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={`superadmin-modal-title-icon mdi ${isEdit ? "mdi-pencil" : "mdi-plus-box"}`} aria-hidden="true"></span>
                    <span>
                        {isEdit ? "Edit tenant" : "Add tenant"}
                        <small>{isEdit ? "Update organisation account information" : "Create a new organisation account"}</small>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form id="superadmin-tenant-form" onSubmit={formik.handleSubmit}>
                    <div className="superadmin-form-section">
                        <div className="superadmin-form-section-heading">
                            <span className="mdi mdi-domain" aria-hidden="true"></span>
                            <div>
                                <h3>Organisation details</h3>
                                <p>Basic identity and contact information.</p>
                            </div>
                        </div>
                        <div className="row">
                            {field("Organisation Name", "org_name", "text", true, "Enter organisation name")}
                            {!isEdit && field("Proprietor", "proprietor", "text", true, "Enter proprietor name")}
                            {field("Address", "address", "text", false, "Enter business address")}
                            {field("Pincode", "pincode", "text", false, "Enter pincode")}
                            {field("Primary Mobile", "mobile_number_primary", "text", true, "Enter primary mobile")}
                            {field("Secondary Mobile", "mobile_number_secondary", "text", false, "Enter secondary mobile")}
                            {field("Email", "email", "email", true, "Enter email address")}
                            {!isEdit && field("Password", "password", "password", true, "Minimum 6 characters")}
                            {field("Test Location", "test_location", "text", false, "Enter test location")}
                            {field("Google Review Link", "google_review_link", "url", false, "https://...")}
                        </div>
                    </div>

                    <div className="superadmin-form-section">
                        <div className="superadmin-form-section-heading superadmin-whatsapp-heading">
                            <span className="mdi mdi-whatsapp" aria-hidden="true"></span>
                            <div>
                                <h3>WhatsApp integration</h3>
                                <p>Enable messaging for this tenant.</p>
                            </div>
                            <div className="form-check form-switch superadmin-whatsapp-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="whatsapp_enabled"
                                    name="whatsapp_enabled"
                                    checked={formik.values.whatsapp_enabled}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label" htmlFor="whatsapp_enabled">
                                    {formik.values.whatsapp_enabled ? "Enabled" : "Disabled"}
                                </label>
                            </div>
                        </div>

                        {formik.values.whatsapp_enabled && (
                            <div className="row superadmin-whatsapp-fields">
                                {field("Registered Number", "whatsapp_registered_number", "text", false, "Enter registered number")}
                            </div>
                        )}
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm superadmin-modal-button"
                    onClick={hideModal}
                    disabled={formik.isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="superadmin-tenant-form"
                    className="btn btn-primary btn-sm superadmin-modal-button"
                    disabled={formik.isSubmitting}
                >
                    {formik.isSubmitting && <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>}
                    {formik.isSubmitting ? "Saving..." : isEdit ? "Update tenant" : "Add tenant"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
