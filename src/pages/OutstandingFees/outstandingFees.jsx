import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";


import "../Students/Students.css";
import "./outstandingFees.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getOutstandingFees, historicalPaymentAdjustment } from "../../store/dashboardSummary/actions";


import Pagination from "../Students/Pagenation";
import { useAuth } from "../../hooks/useAuth";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import { getAdminPrintWatermark } from "../../utils/printBranding";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeOutstandingResponse = (response) => {
  const students = Array.isArray(response?.response)
    ? response.response
    : response?.students || response?.response?.students || [];
  const total = response?.total ?? response?.response?.total ?? students.length ?? 0;

  return { students, total };
};

const OutstandingFees = () => {
  const { role } = useAuth();
  const isAdmin = String(role || "").toLowerCase() === "admin";
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outstandingFeesData, setOutstandingFeesData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const startIndex = (currentPage - 1) * pageSize;

 const currentRecords = outstandingFeesData;

  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const formatBalance = (value) => {
    const amount = Number(value);
    return value !== "" && value !== null && value !== undefined && Number.isFinite(amount)
      ? `₹${amount.toLocaleString("en-IN")}`
      : "N/A";
  };

  const getStatusClass = (value) => {
    const status = String(value || "").toLowerCase();
    if (status.includes("complete") || status.includes("paid") || status.includes("active")) return "is-success";
    if (status.includes("pending") || status.includes("partial")) return "is-warning";
    if (status.includes("fail") || status.includes("cancel") || status.includes("inactive")) return "is-danger";
    return "is-neutral";
  };

  const printOutstandingFees = () => {
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the outstanding fees report.");
      return;
    }

    setPrinting(true);
    dispatch(
      getOutstandingFees(
        { skip: 0, limit: Math.max(totalCount, pageSize, 1) },
        (response) => {
          setPrinting(false);
          const { students } = normalizeOutstandingResponse(response);

          if (!students.length) {
            printWindow.close();
            toast.error("No outstanding fee records are available to print.");
            return;
          }

          const rows = students
            .map((student, index) => {
              const amount = Number(student?.balance);
              const balance = Number.isFinite(amount)
                ? `&#8377;${amount.toLocaleString("en-IN")}`
                : "N/A";

              return `<tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(student?.name || "N/A")}</td>
                <td>${escapeHtml(student?.mobile_number || "N/A")}</td>
                <td class="amount">${balance}</td>
                <td>${escapeHtml(formatDateDDMMYYYY(student?.registered_date) || "N/A")}</td>
                <td>${escapeHtml(student?.status || "N/A")}</td>
                <td>${escapeHtml(student?.full_payment_status || "N/A")}</td>
              </tr>`;
            })
            .join("");

          printWindow.document.write(`<!doctype html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>Outstanding Fees Report</title>
                <style>
                  @page { size: A4 landscape; margin: 12mm; }
                  * { box-sizing: border-box; }
                  body { margin: 0; color: #172033; font-family: Arial, Helvetica, sans-serif; }
                  .report { position: relative; z-index: 1; }
                  h1 { margin: 0 0 5px; text-align: center; font-size: 20px; }
                  .summary { margin: 0 0 14px; color: #667085; text-align: center; font-size: 11px; }
                  table { width: 100%; border-collapse: collapse; font-size: 10px; }
                  th, td { padding: 7px 8px; border: 1px solid #b8c2ce; text-align: left; }
                  th { background: #eef3f8; color: #172033; font-weight: 700; }
                  .amount { text-align: right; }
                  @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; }
                  }
                </style>
              </head>
              <body>
                ${getAdminPrintWatermark()}
                <main class="report">
                  <h1>Outstanding Fees Report</h1>
                  <p class="summary">${students.length} outstanding record${students.length === 1 ? "" : "s"}</p>
                  <table>
                    <thead><tr><th>S.No</th><th>Name</th><th>Mobile Number</th><th>Balance</th><th>Registered Date</th><th>Status</th><th>Full Payment Status</th></tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                </main>
                <script>window.onload=function(){window.print();window.close();}</script>
              </body>
            </html>`);
          printWindow.document.close();
        }
      )
    );
  };

  const getKey = (s) => s?.mobile_number;
  const getAdjustmentId = (student) =>
    student?._id || student?.id || student?.student_id;

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
    const ids = selectedIds.map(getAdjustmentId).filter(Boolean);

    if (ids.length !== selectedIds.length || ids.length === 0) {
      toast.error("Unable to identify one or more selected students. Please refresh and try again.");
      return;
    }

    setModalLoading(true);
    dispatch(
      historicalPaymentAdjustment({ id: ids }, (res) => {
        setModalLoading(false);

        const requestFailed =
          res?.isError ||
          res?.isAxiosError ||
          res instanceof Error ||
          Number(res?.response?.status) >= 400;

        if (requestFailed) {
          const message =
            res?.response?.data?.detail ||
            res?.response?.data?.message ||
            res?.message ||
            "Historical payment adjustment failed. Please try again.";
          toast.error(message);
          return;
        }

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
      const { students, total: count } = normalizeOutstandingResponse(res);

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
        className="header-fixed sidebar-fixed sidebar-dark header-light students-page outstanding-fees-page"
        id="body"
      >
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />

            <div className="content-wrapper">
              <div className="content">
                {/* Breadcrumb */}
                <div className="row students-page-heading outstanding-fees-heading">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Outstanding Fees</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#" className="students-breadcrumb-home" aria-label="Outstanding fees home">
                            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                              <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                            </svg>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Outstanding Fees</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Fee List
                        </li>
                      </ol>
                    </nav>
                  </div>
                  {isAdmin && (
                    <div className="col-xl-6 text-right students-page-actions outstanding-fees-actions">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={printOutstandingFees}
                        disabled={loading || printing || !!error || currentRecords.length === 0}
                      >
                        <i className="bi bi-printer" aria-hidden="true" />
                        {printing ? "Preparing..." : "Print Report"}
                      </button>
                    </div>
                  )}
                </div>

                {/* outstanding-fees List */}
                <div className="outstanding-fees-content">
                  {loading ? (
                    <div className="outstanding-fees-state">
                      <span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
                      <span>Loading outstanding fees...</span>
                    </div>
                  ) : error ? (
                    <div className="outstanding-fees-state is-empty">
                      <i className="bi bi-wallet2" aria-hidden="true" />
                      <strong>No outstanding fees</strong>
                      <span>{error}</span>
                    </div>
                  ) : (
                    <>
                    {selectedIds.length > 0 && (
                      <div className="outstanding-selection-toolbar">
                        <span><strong>{selectedIds.length}</strong> selected</span>
                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={() => setShowModal(true)}
                        >
                          <i className="bi bi-arrow-repeat" aria-hidden="true" />
                          Historical Payment Adjustment
                        </button>
                      </div>
                    )}
                    <div className="table-responsive students-table-wrap outstanding-fees-table-wrap">
                      <table className="table custom-table text-center align-middle students-table outstanding-fees-table">
                        <thead className="table-light">
                          <tr>
                            <th className="no-print">
                              <input
                                type="checkbox"
                                aria-label="Select all students on this page"
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
                              <td data-label="Select" className="outstanding-select-cell">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${outstandingFees?.name || "student"}`}
                                  checked={selectedIds.some(
                                    (sel) => getKey(sel) === getKey(outstandingFees)
                                  )}
                                  onChange={() => handleCheckbox(outstandingFees)}
                                />
                              </td>
                              <td data-label="S.No">{startIndex + index + 1}</td>
                              <td data-label="Name" className="outstanding-student-name">{outstandingFees?.name || "Name"}</td>
                              <td data-label="Mobile Number">{outstandingFees?.mobile_number || 0}</td>
                              <td data-label="Balance" className="outstanding-balance">{formatBalance(outstandingFees?.balance)}</td>
                              <td data-label="Registered Date">{outstandingFees?.registered_date || "N/A"}</td>
                              <td data-label="Status">
                                <span className={`outstanding-status ${getStatusClass(outstandingFees?.status)}`}>
                                  {outstandingFees?.status || "N/A"}
                                </span>
                              </td>
                              <td data-label="Full Payment Status">
                                <span className={`outstanding-status ${getStatusClass(outstandingFees?.full_payment_status)}`}>
                                  {outstandingFees?.full_payment_status || "N/A"}
                                </span>
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
          className="modal fade show d-block outstanding-adjustment-modal"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="outstanding-adjustment-title"
        >
          <div className="modal-dialog modal-dialog-centered outstanding-adjustment-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <div className="outstanding-adjustment-icon" aria-hidden="true">
                  <i className="bi bi-arrow-repeat" />
                </div>
                <h5 className="modal-title" id="outstanding-adjustment-title">
                  Historical Payment Adjustment
                </h5>
              </div>
              <div className="modal-body">
                Are you sure you want to apply Historical Payment Adjustment for{" "}
                <strong>{selectedIds.length}</strong> selected student
                {selectedIds.length > 1 ? "s" : ""}?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
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
