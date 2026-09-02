import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addSuperAdmin, updateSuperAdmin } from "../../store/superAdmin/actions";
import { getTenantLogo } from "../../store/login/actions";

export default function AddSuperAdmin({ showModal, hideModal, isEdit = false, selected = null, onSuccess }) {
    const dispatch = useDispatch();
    const logoInputRef = useRef(null);
    const uploadObjectUrlRef = useRef("");
    const fetchedLogoObjectUrlRef = useRef("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [savedLogoPreview, setSavedLogoPreview] = useState("");
    const [logoLoading, setLogoLoading] = useState(false);
    const [logoError, setLogoError] = useState("");

    const existingLogoUrl = selected?.logo_url || selected?.logoUrl || "";

    const revokeUploadObjectUrl = () => {
        if (uploadObjectUrlRef.current) {
            URL.revokeObjectURL(uploadObjectUrlRef.current);
            uploadObjectUrlRef.current = "";
        }
    };

    const revokeFetchedLogoObjectUrl = () => {
        if (fetchedLogoObjectUrlRef.current) {
            URL.revokeObjectURL(fetchedLogoObjectUrlRef.current);
            fetchedLogoObjectUrlRef.current = "";
        }
    };

    useEffect(() => {
        let isActive = true;

        revokeUploadObjectUrl();
        revokeFetchedLogoObjectUrl();
        setLogoFile(null);
        setLogoError("");
        setLogoPreview("");
        setSavedLogoPreview(isEdit ? existingLogoUrl : "");
        setLogoLoading(false);
        if (logoInputRef.current) logoInputRef.current.value = "";

        const loadSavedLogo = () => {
            if (!showModal || !isEdit || !selected?.tenant_id) return;

            setLogoLoading(true);
            dispatch(
                getTenantLogo(selected.tenant_id, selected?.logo_uploaded_at, (logoBlob, error) => {
                    if (!isActive) return;

                    setLogoLoading(false);
                    if (error || !(logoBlob instanceof Blob) || logoBlob.size === 0) return;

                    const fetchedLogoUrl = URL.createObjectURL(logoBlob);
                    fetchedLogoObjectUrlRef.current = fetchedLogoUrl;
                    setSavedLogoPreview(fetchedLogoUrl);
                })
            );
        };

        loadSavedLogo();

        return () => {
            isActive = false;
            revokeUploadObjectUrl();
            revokeFetchedLogoObjectUrl();
        };
    }, [dispatch, showModal, isEdit, selected?.tenant_id, selected?.logo_uploaded_at, existingLogoUrl]);

    const initialValues = isEdit
        ? {
            org_name: selected?.org_name || "",
            address: selected?.address || "",
            office_location: selected?.office_location || "",
            pincode: selected?.pincode || "",
            mobile_number_primary: selected?.mobile_number_primary || "",
            mobile_number_secondary: selected?.mobile_number_secondary || "",
            email: selected?.email || "",
            test_location: selected?.test_location || "",
            website_url: selected?.website_url || "",
            whatsapp_enabled: selected?.whatsapp_enabled || false,
            whatsapp_registered_number: selected?.whatsapp_registered_number || "",
            google_review_link: selected?.google_review_link || "",
        }
        : {
            org_name: "",
            proprietor: "",
            address: "",
            office_location: "",
            pincode: "",
            mobile_number_primary: "",
            mobile_number_secondary: "",
            email: "",
            password: "",
            test_location: "",
            website_url: "",
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
            if (logoError) {
                setSubmitting(false);
                return;
            }

            if (isEdit) {
                const updatePayload = logoFile
                    ? {
                        mobile_number: selected?.mobile_number_primary,
                        tenantPatch: values,
                        logo: logoFile,
                    }
                    : { mobile_number: selected?.mobile_number_primary, ...values };

                dispatch(
                    updateSuperAdmin(
                        updatePayload,
                        (res) => {
                            setSubmitting(false);
                            if (res?.isError === false || res?.statusCode === 200) {
                                onSuccess("updated", null, res);
                            } else {
                                onSuccess(null, res);
                            }
                        }
                    )
                );
            } else {
                const registrationPayload = logoFile
                    ? { tenantData: values, logo: logoFile }
                    : values;

                dispatch(
                    addSuperAdmin(registrationPayload, (res) => {
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

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();
        const allowedExtensions = ["png", "jpg", "jpeg"];
        const allowedMimeTypes = ["image/png", "image/jpeg"];

        if (
            !allowedExtensions.includes(extension) ||
            (file.type && !allowedMimeTypes.includes(file.type))
        ) {
            revokeUploadObjectUrl();
            setLogoError("Select a PNG, JPG or JPEG image.");
            setLogoFile(null);
            setLogoPreview("");
            if (logoInputRef.current) logoInputRef.current.value = "";
            return;
        }

        if (file.size > 500 * 1024) {
            revokeUploadObjectUrl();
            setLogoError("Logo file size must not exceed 500 KB.");
            setLogoFile(null);
            setLogoPreview("");
            if (logoInputRef.current) logoInputRef.current.value = "";
            return;
        }

        revokeUploadObjectUrl();
        const previewUrl = URL.createObjectURL(file);
        uploadObjectUrlRef.current = previewUrl;
        setLogoFile(file);
        setLogoPreview(previewUrl);
        setLogoError("");
    };

    const clearSelectedLogo = () => {
        revokeUploadObjectUrl();
        setLogoFile(null);
        setLogoError("");
        setLogoPreview("");
        if (logoInputRef.current) logoInputRef.current.value = "";
    };

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
                            {field("Office Location", "office_location", "text", false, "Enter office location")}
                            {field("Pincode", "pincode", "text", false, "Enter pincode")}
                            {field("Primary Mobile", "mobile_number_primary", "text", true, "Enter primary mobile")}
                            {field("Secondary Mobile", "mobile_number_secondary", "text", false, "Enter secondary mobile")}
                            {field("Email", "email", "email", true, "Enter email address")}
                            {!isEdit && field("Password", "password", "password", true, "Minimum 6 characters")}
                            {field("Test Location", "test_location", "text", false, "Enter test location")}
                            {field("Website URL", "website_url", "url", false, "https://example.com")}
                            {field("Google Review Link", "google_review_link", "url", false, "https://...")}
                        </div>
                    </div>

                    <div className="superadmin-form-section">
                        <div className="superadmin-form-section-heading">
                            <span className="mdi mdi-image-outline" aria-hidden="true"></span>
                            <div>
                                <h3>Organisation logo</h3>
                                <p>Optional branding displayed for this tenant.</p>
                            </div>
                        </div>

                        <div className="superadmin-logo-upload">
                            <div className="superadmin-logo-preview" aria-label="Tenant logo preview">
                                {logoLoading && !logoPreview ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-label="Loading saved logo"></span>
                                ) : logoPreview || savedLogoPreview ? (
                                    <img src={logoPreview || savedLogoPreview} alt="Tenant logo preview" />
                                ) : (
                                    <span aria-hidden="true">
                                        {(formik.values.org_name || "T").charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="superadmin-logo-controls">
                                <div className="superadmin-logo-actions">
                                    <label className="btn btn-outline-primary btn-sm superadmin-logo-select" htmlFor="tenant-logo">
                                        <i className="mdi mdi-upload" aria-hidden="true"></i>
                                        <span>{logoFile ? "Change logo" : isEdit ? "Upload new logo" : "Choose logo"}</span>
                                    </label>
                                    <input
                                        ref={logoInputRef}
                                        id="tenant-logo"
                                        className="superadmin-logo-input"
                                        type="file"
                                        name="logo"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        onChange={handleLogoChange}
                                    />
                                    {logoFile && (
                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm superadmin-logo-clear"
                                            onClick={clearSelectedLogo}
                                        >
                                            Remove selection
                                        </button>
                                    )}
                                </div>

                                <p className="superadmin-logo-help">
                                    PNG, JPG or JPEG only. Maximum size 500 KB.
                                    {isEdit && !logoFile ? " The current logo will be retained." : ""}
                                </p>
                                {logoFile && (
                                    <p className="superadmin-logo-file">
                                        <i className="mdi mdi-check-circle" aria-hidden="true"></i>
                                        <span>{logoFile.name}</span>
                                        <small>{Math.ceil(logoFile.size / 1024)} KB</small>
                                    </p>
                                )}
                                {logoError && (
                                    <div className="superadmin-logo-error" role="alert">
                                        {logoError}
                                    </div>
                                )}
                            </div>
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
