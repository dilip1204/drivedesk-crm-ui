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
            whatsapp_enabled: selected?.whatsapp_enabled || false,
            whatsapp_phone_number_id: selected?.whatsapp_phone_number_id || "",
            whatsapp_access_token: selected?.whatsapp_access_token || "",
            whatsapp_business_account_id: selected?.whatsapp_business_account_id || "",
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
            whatsapp_enabled: false,
            whatsapp_phone_number_id: "",
            whatsapp_access_token: "",
            whatsapp_business_account_id: "",
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

    const field = (label, name, type = "text", required = false) => (
        <div className="col-md-6 mb-3">
            <label className="form-label" style={{ fontSize: "13px", fontWeight: 500 }}>
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <input
                type={type}
                className={`form-control form-control-sm ${formik.touched[name] && formik.errors[name] ? "is-invalid" : ""}`}
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
            />
            {formik.touched[name] && formik.errors[name] && (
                <div className="invalid-feedback">{formik.errors[name]}</div>
            )}
        </div>
    );

    return (
        <Modal show={showModal} onHide={hideModal} size="lg" centered>
            <Modal.Header style={{ padding: "14px 20px" }}>
                <Modal.Title style={{ fontSize: "16px", fontWeight: 600 }}>
                    {isEdit ? "Edit Tenant" : "Add Tenant"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: "20px" }}>
                <form onSubmit={formik.handleSubmit}>
                    <div className="row">
                        {field("Organisation Name", "org_name", "text", true)}
                        {!isEdit && field("Proprietor", "proprietor", "text", true)}
                        {field("Address", "address")}
                        {field("Pincode", "pincode")}
                        {field("Primary Mobile", "mobile_number_primary", "text", true)}
                        {field("Secondary Mobile", "mobile_number_secondary")}
                        {field("Email", "email", "email", true)}
                        {!isEdit && field("Password", "password", "password", true)}
                        {field("Google Review Link", "google_review_link")}

                        {/* WhatsApp Section */}
                        <div className="col-12 mb-2 mt-1">
                            <hr style={{ margin: "4px 0 10px" }} />
                            <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: 10 }}>WhatsApp Settings</p>
                        </div>

                        <div className="col-12 mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="whatsapp_enabled"
                                    name="whatsapp_enabled"
                                    checked={formik.values.whatsapp_enabled}
                                    onChange={formik.handleChange}
                                />
                                <label className="form-check-label" htmlFor="whatsapp_enabled" style={{ fontSize: "13px" }}>
                                    WhatsApp Enabled
                                </label>
                            </div>
                        </div>

                        {formik.values.whatsapp_enabled && (
                            <>
                                {field("Phone Number ID", "whatsapp_phone_number_id")}
                                {field("Access Token", "whatsapp_access_token")}
                                {field("Business Account ID", "whatsapp_business_account_id")}
                                {field("Registered Number", "whatsapp_registered_number")}
                            </>
                        )}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={hideModal}
                            disabled={formik.isSubmitting}
                            style={{ fontSize: "13px", padding: "6px 18px" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={formik.isSubmitting}
                            style={{ fontSize: "13px", padding: "6px 18px" }}
                        >
                            {formik.isSubmitting ? "Saving..." : isEdit ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
}
