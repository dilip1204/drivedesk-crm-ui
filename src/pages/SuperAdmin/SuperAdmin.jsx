import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../Students/Students.css";
import "./SuperAdmin.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../Students/Pagenation";
import AddSuperAdmin from "./AddSuperAdmin";

import { getSuperAdminList } from "../../store/superAdmin/actions";
import { getTenantLogo } from "../../store/login/actions";

const EMPTY_VALUE = "—";

const SuperAdmin = () => {
    const dispatch = useDispatch();

    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTenant, setViewTenant] = useState(null);
    const [viewLogoUrl, setViewLogoUrl] = useState("");
    const [viewLogoLoading, setViewLogoLoading] = useState(false);
    const viewLogoObjectUrlRef = useRef("");

    const fetchList = (page = currentPage, limit = pageSize) => {
        setLoading(true);
        dispatch(
            getSuperAdminList({ page, limit }, (res) => {
                const data = res?.response || res;
                const list = data?.tenants || [];
                const total = data?.total_count ?? list.length ?? 0;
                setTenants(list);
                setTotalCount(total);
                setError(list.length === 0 ? "No super admin records found." : null);
                setLoading(false);
            })
        );
    };

    useEffect(() => {
        fetchList(currentPage, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    useEffect(() => {
        let isActive = true;

        if (viewLogoObjectUrlRef.current) {
            URL.revokeObjectURL(viewLogoObjectUrlRef.current);
            viewLogoObjectUrlRef.current = "";
        }

        setViewLogoUrl(viewTenant?.logo_url || viewTenant?.logoUrl || "");
        setViewLogoLoading(false);

        const loadViewLogo = () => {
            if (!showViewModal || !viewTenant?.tenant_id) return;

            setViewLogoLoading(true);
            dispatch(
                getTenantLogo(viewTenant.tenant_id, (logoBlob, error) => {
                    if (!isActive) return;

                    setViewLogoLoading(false);
                    if (error || !(logoBlob instanceof Blob) || logoBlob.size === 0) return;

                    const objectUrl = URL.createObjectURL(logoBlob);
                    viewLogoObjectUrlRef.current = objectUrl;
                    setViewLogoUrl(objectUrl);
                })
            );
        };

        loadViewLogo();

        return () => {
            isActive = false;
            if (viewLogoObjectUrlRef.current) {
                URL.revokeObjectURL(viewLogoObjectUrlRef.current);
                viewLogoObjectUrlRef.current = "";
            }
        };
    }, [dispatch, showViewModal, viewTenant?.tenant_id, viewTenant?.logo_url, viewTenant?.logoUrl]);

    const handleAdd = () => {
        setIsEdit(false);
        setSelected(null);
        setShowModal(true);
    };

    const handleEdit = (tenant) => {
        setIsEdit(true);
        setSelected(tenant);
        setShowModal(true);
    };

    const handleView = (tenant) => {
        setViewTenant(tenant);
        setShowViewModal(true);
    };

    const handleSuccess = (action, errRes) => {
        setShowModal(false);
        if (action) {
            toast.success(`Super admin ${action} successfully.`);
            fetchList(currentPage, pageSize);
        } else {
            toast.error(errRes?.data?.message || "Operation failed.");
        }
    };

    const startIndex = (currentPage - 1) * pageSize;
    const whatsappEnabledCount = tenants.filter((tenant) => tenant.whatsapp_enabled).length;
    const whatsappPendingCount = tenants.length - whatsappEnabledCount;

    return (
        <>
            <div className="header-fixed sidebar-fixed sidebar-dark header-light superadmin-page" id="body">
                <div className="wrapper">
                    <Sidebar />
                    <div className="page-wrapper">
                        <Header />
                        <div className="content-wrapper">
                            <div className="content superadmin-content">
                                <div className="superadmin-hero">
                                    <div className="superadmin-hero__text">
                                        <h1 className="superadmin-title">Tenant Management</h1>
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb p-0 mb-0 superadmin-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <span className="superadmin-breadcrumb-home" aria-hidden="true">
                                                        <svg viewBox="0 0 16 16" focusable="false">
                                                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                                                        </svg>
                                                    </span>
                                                </li>
                                                <li className="breadcrumb-item">Super Admin</li>
                                                <li className="breadcrumb-item active" aria-current="page">Tenants</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <div className="superadmin-hero__actions">
                                        <button type="button" className="btn btn-primary btn-sm superadmin-add-btn" onClick={handleAdd}>
                                            <i className="mdi mdi-plus" aria-hidden="true"></i>
                                            <span>Add Tenant</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="superadmin-summary" aria-label="Tenant summary">
                                    <div className="superadmin-summary-card is-primary">
                                        <span className="superadmin-summary-icon mdi mdi-domain" aria-hidden="true"></span>
                                        <div>
                                            <span className="superadmin-summary-label">Total tenants</span>
                                            <strong>{totalCount}</strong>
                                        </div>
                                    </div>
                                    <div className="superadmin-summary-card is-success">
                                        <span className="superadmin-summary-icon mdi mdi-whatsapp" aria-hidden="true"></span>
                                        <div>
                                            <span className="superadmin-summary-label">WhatsApp active</span>
                                            <strong>{whatsappEnabledCount}</strong>
                                            <small>On this page</small>
                                        </div>
                                    </div>
                                    <div className="superadmin-summary-card is-muted">
                                        <span className="superadmin-summary-icon mdi mdi-alert-circle-outline" aria-hidden="true"></span>
                                        <div>
                                            <span className="superadmin-summary-label">Needs setup</span>
                                            <strong>{whatsappPendingCount}</strong>
                                            <small>On this page</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="superadmin-card superadmin-table-card">
                                    <div className="superadmin-table-heading">
                                        <div>
                                            <h2>Tenant directory</h2>
                                            <p>Manage organisations and their communication settings.</p>
                                        </div>
                                        {!loading && !error && (
                                            <span className="superadmin-result-count">
                                                Showing {startIndex + 1}–{Math.min(startIndex + tenants.length, totalCount)} of {totalCount}
                                            </span>
                                        )}
                                    </div>

                                    {loading ? (
                                        <LoadingState label="Loading tenants" />
                                    ) : error ? (
                                        <EmptyState
                                            icon="bi bi-building"
                                            title="No tenants found"
                                            description={error}
                                            actionLabel="Add first tenant"
                                            onAction={handleAdd}
                                        />
                                    ) : (
                                        <>
                                            <div className="table-responsive superadmin-table-wrap">
                                                <table className="table custom-table align-middle superadmin-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="superadmin-col-sn">S.No</th>
                                                            <th className="superadmin-col-org">Organisation</th>
                                                            <th className="superadmin-col-address">Address</th>
                                                            <th className="superadmin-col-pincode">Pincode</th>
                                                            <th className="superadmin-col-mobile">Primary Mobile</th>
                                                            <th className="superadmin-col-secondary-mobile">Secondary Mobile</th>
                                                            <th className="superadmin-col-email">Email</th>
                                                            <th className="superadmin-col-status">WhatsApp</th>
                                                            <th className="superadmin-actions">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tenants.map((tenant, index) => (
                                                            <tr key={tenant.tenant_id || index}>
                                                                <td data-label="S.No" className="superadmin-col-sn">{startIndex + index + 1}</td>
                                                                <td data-label="Organisation" className="superadmin-cell-wrap superadmin-col-org">
                                                                    <span className="superadmin-org-mark" aria-hidden="true">
                                                                        {(tenant.org_name || "T").charAt(0).toUpperCase()}
                                                                    </span>
                                                                    <span>{tenant.org_name || EMPTY_VALUE}</span>
                                                                </td>
                                                                <td data-label="Address" className="superadmin-cell-wrap superadmin-col-address">
                                                                    {tenant.address || EMPTY_VALUE}
                                                                </td>
                                                                <td data-label="Pincode" className="superadmin-col-pincode">{tenant.pincode || EMPTY_VALUE}</td>
                                                                <td data-label="Primary Mobile" className="superadmin-col-mobile">{tenant.mobile_number_primary || EMPTY_VALUE}</td>
                                                                <td data-label="Secondary Mobile" className="superadmin-col-mobile superadmin-col-secondary-mobile">{tenant.mobile_number_secondary || EMPTY_VALUE}</td>
                                                                <td data-label="Email" className="superadmin-cell-wrap superadmin-col-email">{tenant.email || EMPTY_VALUE}</td>
                                                                <td data-label="WhatsApp" className="superadmin-col-status">
                                                                    <span className={`badge superadmin-status-badge ${tenant.whatsapp_enabled ? "is-enabled" : "is-disabled"}`}>
                                                                        <i className={`mdi ${tenant.whatsapp_enabled ? "mdi-check-circle" : "mdi-minus-circle"}`} aria-hidden="true"></i>
                                                                        {tenant.whatsapp_enabled ? "Enabled" : "Disabled"}
                                                                    </span>
                                                                </td>
                                                                <td data-label="Actions" className="superadmin-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm superadmin-action-btn is-view"
                                                                        title="View tenant"
                                                                        aria-label={`View ${tenant.org_name || "tenant"}`}
                                                                        onClick={() => handleView(tenant)}
                                                                    >
                                                                        <i className="mdi mdi-eye" aria-hidden="true"></i>
                                                                        <span>View</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm superadmin-action-btn is-edit"
                                                                        title="Edit tenant"
                                                                        aria-label={`Edit ${tenant.org_name || "tenant"}`}
                                                                        onClick={() => handleEdit(tenant)}
                                                                    >
                                                                        <i className="mdi mdi-pencil" aria-hidden="true"></i>
                                                                        <span>Edit</span>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="superadmin-pagination">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalCount={totalCount}
                                                    pageSize={pageSize}
                                                    onPageChange={(p) => setCurrentPage(p)}
                                                    onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>

            <AddSuperAdmin
                showModal={showModal}
                hideModal={() => setShowModal(false)}
                isEdit={isEdit}
                selected={selected}
                onSuccess={handleSuccess}
            />

            <Modal
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                size="lg"
                centered
                dialogClassName="superadmin-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="superadmin-modal-title-icon mdi mdi-domain" aria-hidden="true"></span>
                        <span>
                            Tenant details
                            <small>Organisation account and integration information</small>
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewTenant ? (
                        <>
                            <div className="superadmin-tenant-profile">
                                <span className="superadmin-tenant-avatar">
                                    {viewLogoLoading && !viewLogoUrl ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-label="Loading tenant logo"></span>
                                    ) : viewLogoUrl ? (
                                        <img src={viewLogoUrl} alt={`${viewTenant.org_name || "Tenant"} logo`} />
                                    ) : (
                                        <span aria-hidden="true">{(viewTenant.org_name || "T").charAt(0).toUpperCase()}</span>
                                    )}
                                </span>
                                <div>
                                    <h3>{viewTenant.org_name || "Unnamed tenant"}</h3>
                                    <p>{viewTenant.email || "No email provided"}</p>
                                </div>
                                <span className={`badge superadmin-status-badge ${viewTenant.whatsapp_enabled ? "is-enabled" : "is-disabled"}`}>
                                    <i className={`mdi ${viewTenant.whatsapp_enabled ? "mdi-check-circle" : "mdi-minus-circle"}`} aria-hidden="true"></i>
                                    WhatsApp {viewTenant.whatsapp_enabled ? "enabled" : "disabled"}
                                </span>
                            </div>

                            <div className="superadmin-detail-section-title">Account information</div>
                            <div className="row g-3 superadmin-detail-grid">
                                {[
                                    ["Tenant ID", viewTenant.tenant_id || EMPTY_VALUE, "mdi-pound-box"],
                                    ["Proprietor", viewTenant.proprietor || EMPTY_VALUE, "mdi-account-outline"],
                                    ["Address", viewTenant.address || EMPTY_VALUE, "mdi-map-marker-outline"],
                                    ["Office Location", viewTenant.office_location || EMPTY_VALUE, "mdi-domain"],
                                    ["Pincode", viewTenant.pincode || EMPTY_VALUE, "mdi-map-marker-radius"],
                                    ["Primary Mobile", viewTenant.mobile_number_primary || EMPTY_VALUE, "mdi-phone-outline"],
                                    ["Secondary Mobile", viewTenant.mobile_number_secondary || EMPTY_VALUE, "mdi-phone-plus"],
                                    ["Email", viewTenant.email || EMPTY_VALUE, "mdi-email-outline"],
                                    ["Test Location", viewTenant.test_location || EMPTY_VALUE, "mdi-map-marker-check-outline"],
                                    ["Website URL", viewTenant.website_url || EMPTY_VALUE, "mdi-web"],
                                    ["WhatsApp Registered Number", viewTenant.whatsapp_registered_number || EMPTY_VALUE, "mdi-cellphone"],
                                    ["Google Review Link", viewTenant.google_review_link || EMPTY_VALUE, "mdi-star-outline"],
                                ].map(([label, value, icon]) => (
                                    <div className="col-md-6" key={label}>
                                        <div className="superadmin-detail-item h-100">
                                            <span className={`superadmin-detail-icon mdi ${icon}`} aria-hidden="true"></span>
                                            <div className="text-muted small mb-1 superadmin-detail-label">{label}</div>
                                            <div className="superadmin-detail-value">{value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary btn-sm superadmin-modal-button" onClick={() => setShowViewModal(false)}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />
        </>
    );
};

export default SuperAdmin;
