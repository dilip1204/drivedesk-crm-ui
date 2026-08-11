import React, { useEffect, useState } from "react";
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
import Pagination from "../Students/Pagenation";
import AddSuperAdmin from "./AddSuperAdmin";

import { getSuperAdminList } from "../../store/superAdmin/actions";

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

    return (
        <>
            <div className="header-fixed sidebar-fixed sidebar-dark header-light superadmin-page" id="body">
                <div className="wrapper">
                    <Sidebar />
                    <div className="page-wrapper">
                        <Header />
                        <div className="content-wrapper">
                            <div className="content superadmin-content">
                                <div className="superadmin-card superadmin-hero mb-4">
                                    <div className="superadmin-hero__text">
                                        <h1 className="superadmin-title mb-1">Super Admin</h1>
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb p-0 mb-0 superadmin-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <a href="#"><span className="mdi mdi-home"></span></a>
                                                </li>
                                                <li className="breadcrumb-item">Super Admin</li>
                                                <li className="breadcrumb-item" aria-current="page">Tenant List</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <div className="superadmin-hero__actions">
                                        <button className="btn btn-primary btn-sm superadmin-add-btn" onClick={handleAdd}>
                                            <i className="mdi mdi-plus me-1"></i> Add Tenant
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="superadmin-card superadmin-table-card">
                                    {loading ? (
                                        <p className="text-center my-5">Loading...</p>
                                    ) : error ? (
                                        <p className="text-center text-danger my-5">{error}</p>
                                    ) : (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table custom-table align-middle superadmin-table">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>S.No</th>
                                                            <th>Org Name</th>
                                                            <th>Address</th>
                                                            <th>Pincode</th>
                                                            <th>Primary Mobile</th>
                                                            <th>Secondary Mobile</th>
                                                            <th>Email</th>
                                                            <th>WhatsApp</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tenants.map((tenant, index) => (
                                                            <tr key={tenant.tenant_id || index}>
                                                                <td className="superadmin-col-sn">{startIndex + index + 1}</td>
                                                                <td className="superadmin-cell-wrap superadmin-col-org">
                                                                    {tenant.org_name || "—"}
                                                                </td>
                                                                <td className="superadmin-cell-wrap superadmin-col-address">
                                                                    {tenant.address || "—"}
                                                                </td>
                                                                <td className="superadmin-col-pincode">{tenant.pincode || "—"}</td>
                                                                <td className="superadmin-col-mobile">{tenant.mobile_number_primary || "—"}</td>
                                                                <td className="superadmin-col-mobile">{tenant.mobile_number_secondary || "—"}</td>
                                                                <td className="superadmin-cell-wrap superadmin-col-email">{tenant.email || "—"}</td>
                                                                <td className="superadmin-col-status">
                                                                    <span className={`badge superadmin-status-badge ${tenant.whatsapp_enabled ? "is-enabled" : "is-disabled"}`}>
                                                                        {tenant.whatsapp_enabled ? "Enabled" : "Disabled"}
                                                                    </span>
                                                                </td>
                                                                <td className="superadmin-actions">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-info superadmin-icon-btn"
                                                                        title="View"
                                                                        onClick={() => handleView(tenant)}
                                                                    >
                                                                        <i className="mdi mdi-eye"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary superadmin-icon-btn"
                                                                        title="Edit"
                                                                        onClick={() => handleEdit(tenant)}
                                                                    >
                                                                        <i className="mdi mdi-pencil"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                <Modal.Header style={{ padding: "14px 20px" }} closeButton>
                    <Modal.Title style={{ fontSize: "16px", fontWeight: 600 }}>
                        Tenant Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "20px" }}>
                    {viewTenant ? (
                        <div className="row g-3 superadmin-detail-grid">
                            {[
                                ["Tenant ID", viewTenant.tenant_id || "—"],
                                ["Organisation Name", viewTenant.org_name || "—"],
                                ["Proprietor", viewTenant.proprietor || "—"],
                                ["Address", viewTenant.address || "—"],
                                ["Pincode", viewTenant.pincode || "—"],
                                ["Primary Mobile", viewTenant.mobile_number_primary || "—"],
                                ["Secondary Mobile", viewTenant.mobile_number_secondary || "—"],
                                ["Email", viewTenant.email || "—"],
                                ["WhatsApp Enabled", viewTenant.whatsapp_enabled ? "Enabled" : "Disabled"],
                                ["WhatsApp Phone Number ID", viewTenant.whatsapp_phone_number_id || "—"],
                                ["WhatsApp Access Token", viewTenant.whatsapp_access_token ? "••••••••••" : "—"],
                                ["WhatsApp Business Account ID", viewTenant.whatsapp_business_account_id || "—"],
                                ["WhatsApp Registered Number", viewTenant.whatsapp_registered_number || "—"],
                                ["Google Review Link", viewTenant.google_review_link || "—"],
                            ].map(([label, value]) => (
                                <div className="col-md-6" key={label}>
                                    <div className="superadmin-detail-item h-100">
                                        <div className="text-muted small mb-1 superadmin-detail-label">{label}</div>
                                        <div className="superadmin-detail-value">
                                            {value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </Modal.Body>
                <Modal.Footer style={{ padding: "14px 20px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />
        </>
    );
};

export default SuperAdmin;
