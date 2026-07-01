import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../Students/Students.css";

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
            <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
                <div className="wrapper">
                    <Sidebar />
                    <div className="page-wrapper">
                        <Header />
                        <div className="content-wrapper">
                            <div className="content">
                                {/* Breadcrumb */}
                                <div className="row">
                                    <div className="breadcrumb-wrapper col-xl-6">
                                        <h1>Super Admin</h1>
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb p-0">
                                                <li className="breadcrumb-item">
                                                    <a href="#"><span className="mdi mdi-home"></span></a>
                                                </li>
                                                <li className="breadcrumb-item">Super Admin</li>
                                                <li className="breadcrumb-item" aria-current="page">Tenant List</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <div className="col-xl-6 d-flex align-items-center justify-content-end">
                                        <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ fontSize: "13px" }}>
                                            <i className="mdi mdi-plus me-1"></i> Add Tenant
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div>
                                    {loading ? (
                                        <p className="text-center my-5">Loading...</p>
                                    ) : error ? (
                                        <p className="text-center text-danger my-5">{error}</p>
                                    ) : (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table custom-table text-center align-middle">
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
                                                                <td>{startIndex + index + 1}</td>
                                                                <td>{tenant.org_name || "—"}</td>
                                                                <td style={{ maxWidth: 200, whiteSpace: "normal", textAlign: "left" }}>
                                                                    {tenant.address || "—"}
                                                                </td>
                                                                <td>{tenant.pincode || "—"}</td>
                                                                <td>{tenant.mobile_number_primary || "—"}</td>
                                                                <td>{tenant.mobile_number_secondary || "—"}</td>
                                                                <td>{tenant.email || "—"}</td>
                                                                <td>
                                                                    <span className={`badge ${tenant.whatsapp_enabled ? "bg-success" : "bg-secondary"}`}>
                                                                        {tenant.whatsapp_enabled ? "Enabled" : "Disabled"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
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

            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover />
        </>
    );
};

export default SuperAdmin;
