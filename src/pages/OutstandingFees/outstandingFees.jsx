import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";


import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getOutstandingFees, historicalPaymentAdjustment } from "../../store/dashboardSummary/actions";


import avatar from "../../assets/img/avatar.png";
import Pagination from "../Students/Pagenation";

import { useAuth } from "../../hooks/useAuth";

const OutstandingFees = () => {
  const { role } = useAuth();
  const isAdmin = String(role || "").toLowerCase() === "admin";
  const outstandingTableRef = useRef(null);

  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outstandingFeesData, setOutstandingFeesData] = useState([]);

  const outstandingFeesLists = useSelector((state) => state.outstandingFeesInfo.outstandingFees);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const startIndex = (currentPage - 1) * pageSize;

 const currentRecords = outstandingFeesData;

  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const printOutstandingFees = () => {
    const content = outstandingTableRef.current?.outerHTML || "<p>No data</p>";
    const printWindow = window.open("", "", "width=1100,height=800");
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Outstanding Fees Report</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#212529;}
            h2{text-align:center;margin:0 0 16px;}
            table{width:100%;border-collapse:collapse;font-size:12px;}
            th,td{border:1px solid #333;padding:7px;text-align:center;}
            thead th{background:#f2f2f2;}
            .no-print{display:none;}
          </style>
        </head>
        <body>
          <h2>Outstanding Fees Report</h2>
          ${content}
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  const getKey = (s) => s?.mobile_number;

  const handleCheckbox = (student) => {
    const key = getKey(student);
    setSelectedIds((prev) =>
      prev.some((s) => getKey(s) === key)
        ? prev.filter((s) => getKey(s) !== key)
        : [...prev, student]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? [...currentRecords] : []);
  };

  const handleConfirm = () => {
    setModalLoading(true);
    const ids = selectedIds.map((s) => s._id || s.id || s.student_id);
    console.log("Selected student keys:", selectedIds[0] ? Object.keys(selectedIds[0]) : []);
    console.log("Sending IDs:", ids);
    dispatch(
      historicalPaymentAdjustment({ id: ids }, (res) => {
        setModalLoading(false);
        setShowModal(false);
        setSelectedIds([]);
        toast.success("Historical payment adjustment applied successfully.");
        getOutstandingFeesList();
      })
    );
  };
    

  const getOutstandingFeesList = () => {
  const data = {
    skip: (currentPage - 1) * pageSize,
    limit: pageSize,
  };

  dispatch(
    getOutstandingFees(data, (res) => {
      const students = Array.isArray(res?.response)
        ? res.response
        : res?.students || res?.response?.students || [];
      const count = res?.total ?? res?.response?.total ?? students.length ?? 0;

      setTotalCount(count);

      if (students.length > 0) {
          console.log("Outstanding API:", students);
          setOutstandingFeesData(students);
          setError(null);
      } else {
          setOutstandingFeesData([]);
          setError("No Outstanding Fees found.");
      }

      setLoading(false);
    })
  );
};

  

  useEffect(() => {
  setLoading(true);
  getOutstandingFeesList();
}, [currentPage, pageSize]);

  useEffect(() => {
  }, [outstandingFeesData]);

  

  return (
    <>
      <div
        className="header-fixed sidebar-fixed sidebar-dark header-light"
        id="body"
      >
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />

            <div className="content-wrapper">
              <div className="content">
                {/* Breadcrumb */}
                <div className="row">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Outstanding Fees</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Outstanding Fees</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Fee List
                        </li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    <div className="d-flex justify-content-end gap-2">
                      {isAdmin && (
                        <button type="button" className="btn btn-outline-primary" onClick={printOutstandingFees} disabled={loading || !!error || currentRecords.length === 0}>
                          <i className="bi bi-printer"></i> Print
                        </button>
                      )}
                      <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                    </div>
                  </div>
                </div>

                {/* outstanding-fees List */}
                <div>
                  {loading ? (
                    <p className="text-center my-5">Loading outstanding fees...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <>
                    {selectedIds.length > 0 && (
                      <div className="mb-3">
                        <button
                          className="btn btn-warning"
                          onClick={() => setShowModal(true)}
                        >
                          Historical Payment Adjustment ({selectedIds.length})
                        </button>
                      </div>
                    )}
                    <div className="table-responsive">
                      <table ref={outstandingTableRef} className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th className="no-print">
                              <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={
                                  currentRecords.length > 0 &&
                                  currentRecords.every((s) =>
                                    selectedIds.some((sel) => getKey(sel) === getKey(s))
                                  )
                                }
                              />
                            </th>
                            <th>S.NO</th>
                            <th>Name</th>
                            <th>Mobile Number</th>
                            <th>Balance</th>
                            <th>Registered Date</th>
                            <th>Status</th>
                            <th>Full Payment Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((outstandingFees, index) => (
                            <tr key={index}>
                              <td className="no-print">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.some(
                                    (sel) => getKey(sel) === getKey(outstandingFees)
                                  )}
                                  onChange={() => handleCheckbox(outstandingFees)}
                                />
                              </td>
                              <td>{startIndex + index + 1}</td>
                              <td>{outstandingFees?.name || "Name"}</td>
                              <td>{outstandingFees?.mobile_number || 0}</td>
                              <td>{outstandingFees?.balance || "N/A"}</td>
                              <td>{outstandingFees?.registered_date || "N/A"}</td>
                              <td>{outstandingFees?.status || "N/A"}</td>
                              <td>{outstandingFees?.full_payment_status || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Pagination
                      currentPage={currentPage}
                      totalCount={totalCount}
                      pageSize={pageSize}
                      onPageChange={(p) => setCurrentPage(p)}
                      onPageSizeChange={(s) => {
                        setPageSize(s);
                        setCurrentPage(1);
                      }}
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
      {/* Historical Payment Adjustment Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
            <div className="modal-content" style={{ borderRadius: "8px" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #dee2e6", padding: "16px 20px" }}>
                <h5 className="modal-title" style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Historical Payment Adjustment
                </h5>
              </div>
              <div className="modal-body" style={{ padding: "20px", fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                Are you sure you want to apply Historical Payment Adjustment for{" "}
                <strong>{selectedIds.length}</strong> selected student
                {selectedIds.length > 1 ? "s" : ""}?
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid #dee2e6", padding: "12px 20px", gap: "8px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "14px", padding: "6px 20px" }}
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "14px", padding: "6px 20px" }}
                  onClick={handleConfirm}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeButton={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default OutstandingFees;
