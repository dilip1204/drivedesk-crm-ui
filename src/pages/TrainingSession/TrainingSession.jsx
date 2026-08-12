import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "./../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AddTrainingSession from "./addTrainingSession";
import RescheduleSession from "./RescheduleSession";

import {
  getTrainingSessionListInformation,
  getTrainingSessionFilterListInformation,
} from "../../store/trainingSession/actions";

import { getInstructorsListInformation } from "../../store/instructors/actions";
import { getStudentCompletedList } from "../../store/trainingSession/actions"; // NEW ✅

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentTrainingSessionModal from "./StudentTrainingSession";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import {
  getAdminPrintWatermark,
  isSriRagavendraOrganization,
} from "../../utils/printBranding";
import PWAInstallButton from "../../components/PWAInstallButton";

const TrainingSession = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showRModal, setShowRModal] = useState(false);
  const [trainingSessionData, setTrainingSessionData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [instructorsData, setInstructorsData] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionStudentData, setSessionStudentData] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const completedTableRef = useRef(null);

  // NEW: completed sessions modal state
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedError, setCompletedError] = useState(null);

  const trainingSessionDataLists = useSelector(
    (state) => state.trainingSessionListInfo.trainingSessionList
  );
  //console.log("Training session data from Redux:", trainingSessionDataLists);
  const [searchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") || "";
  const initialYear = searchParams.get("year") || "";

  let orgNameForReport = "";
  try {
    const tenantInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    orgNameForReport =
      tenantInfo?.org_name ||
      tenantInfo?.organization_name ||
      tenantInfo?.name ||
      "";
  } catch (e) {
    orgNameForReport = "";
  }

  const today = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState({
    instructor_id: "ALL",
    start_date: today,
    end_date: today,
    status: "All",
  });

  const FilterValidationSchema = Yup.object().shape({
    instructor_id: Yup.string().nullable(),
    start_date: Yup.date().nullable(),
    end_date: Yup.date().nullable(),
    status: Yup.string().oneOf([
      "All",
      "Scheduled",
      "Completed"
    ]),
  });

  const openSessionModal = (session) => {
    setSessionStudentData(session);
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSessionStudentData(null);
  };

  const printCompletedTable = () => {
    const content = completedTableRef.current?.outerHTML || "<p>No data</p>";
    const firstSession = completedSessions[0] || {};
    const studentName = firstSession?.student_name || "-";
    const instructorNames = [
      ...new Set(
        completedSessions
          .map((session) => session?.instructor_name)
          .filter(Boolean)
      ),
    ].join(", ") || "-";
    const reportDate = formatDateDDMMYYYY(new Date().toISOString());
    const sessionDates = completedSessions
      .map((session) => session?.date)
      .filter(Boolean)
      .sort();
    const period = sessionDates.length
      ? `${formatDateDDMMYYYY(sessionDates[0])} - ${formatDateDDMMYYYY(
          sessionDates[sessionDates.length - 1]
        )}`
      : "-";
    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const win = window.open("", "", "width=900,height=700");
    win.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Progress Report - ${escapeHtml(studentName)}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; }
          html, body { width: 210mm; min-height: 297mm; margin: 0; padding: 0; }
          body { color: #172033; font-family: Arial, Helvetica, sans-serif; font-size: 12px; }
          .report { position: relative; z-index: 1; width: 210mm; min-height: 297mm; padding: 16mm; }
          .report-header { padding-bottom: 14px; border-bottom: 2px solid #1f4e78; text-align: center; }
          .org-name { margin: 0 0 5px; color: #172033; font-size: 21px; font-weight: 700; text-transform: uppercase; }
          .report-title { margin: 0; color: #1f4e78; font-size: 17px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
          .website { margin: 5px 0 0; color: #1f4e78; font-size: 11px; font-weight: 600; }
          .report-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 28px; margin: 18px 0; padding: 12px 14px; border: 1px solid #d5dce5; border-radius: 4px; background: #f7f9fc; }
          .meta-item { display: flex; gap: 7px; }
          .meta-label { min-width: 92px; color: #566273; font-weight: 700; }
          .meta-value { color: #172033; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 9px 7px; border: 1px solid #9aa7b5; text-align: center; vertical-align: middle; }
          thead th { background: #1f4e78 !important; color: #fff !important; font-size: 11px; letter-spacing: .25px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          tbody tr:nth-child(even) { background: #f4f7fa; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .badge { padding: 0; background: transparent !important; color: #18733c !important; font-weight: 700; }
          .summary { margin-top: 10px; color: #566273; text-align: right; }
          .signatures { display: flex; justify-content: space-between; gap: 80px; margin-top: 72px; }
          .signature { width: 220px; padding-top: 7px; border-top: 1px solid #172033; text-align: center; font-weight: 700; }
          .signature small { display: block; margin-top: 4px; color: #6a7482; font-weight: 400; }
          .report-footer { position: absolute; right: 0; bottom: 0; left: 0; padding-top: 8px; border-top: 1px solid #d5dce5; color: #7a8491; font-size: 10px; text-align: center; }
          @media print {
            html, body, .report { width: 210mm; height: 297mm; }
            .report { overflow: hidden; }
          }
        </style>
      </head>
      <body>
        ${getAdminPrintWatermark()}
        <main class="report">
          <header class="report-header">
            ${orgNameForReport ? `<h1 class="org-name">${escapeHtml(orgNameForReport)}</h1>` : ""}
            <h2 class="report-title">Student - Progress Report</h2>
            ${isSriRagavendraOrganization() ? '<p class="website">www.sriragavendradrivingschool.com</p>' : ""}
          </header>
          <section class="report-meta">
            <div class="meta-item"><span class="meta-label">Student:</span><span class="meta-value">${escapeHtml(studentName)}</span></div>
            <div class="meta-item"><span class="meta-label">Instructor:</span><span class="meta-value">${escapeHtml(instructorNames)}</span></div>
            <div class="meta-item"><span class="meta-label">Report period:</span><span class="meta-value">${escapeHtml(period)}</span></div>
            <div class="meta-item"><span class="meta-label">Generated on:</span><span class="meta-value">${escapeHtml(reportDate)}</span></div>
          </section>
          ${content}
          <div class="summary">Total completed sessions: <strong>${completedSessions.length}</strong></div>
          <section class="signatures">
            <div class="signature">Instructor Signature<small>${escapeHtml(instructorNames)}</small></div>
            <div class="signature">Authorized Signature<small>Driving School Authority</small></div>
          </section>
          <footer class="report-footer">${
            isSriRagavendraOrganization()
              ? "www.sriragavendradrivingschool.com &nbsp; | &nbsp; "
              : ""
          }This report was generated through DriveDesk.</footer>
        </main>
        <script>window.onload=function(){window.print();window.close();}</script>
      </body>
    </html>`);
    win.document.close();
  };

  const getTrainingSessionList = () => {
    const today = new Date().toISOString().split("T")[0];
    dispatch(
      getTrainingSessionListInformation({ status: "Scheduled", date: today }, (res) => {
       // console.info("Training session list response:", res);
        const trainingSessionList = res?.response?.sessions || [];
        if (trainingSessionList.length > 0) {
          setTrainingSessionData(trainingSessionList);
          setError(null);
        } else {
          setTrainingSessionData([]);
          setError("No training session found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {}, [trainingSessionData]);

  useEffect(() => {
    if (trainingSessionDataLists?.response?.sessions?.length > 0) {
      setTrainingSessionData(trainingSessionDataLists.response?.sessions || []);
      setError(null);
    } else {
      setTrainingSessionData([]);
      setError("No training session found.");
    }
    setLoading(false);
  }, [trainingSessionDataLists]);

  const getInstructorsList = () => {
    dispatch(
      getInstructorsListInformation({}, (res) => {
        const instructorsList = res?.response || [];
        setInstructorsData(Array.isArray(instructorsList) ? instructorsList : []);
      })
    );
  };

  useEffect(() => {
    getInstructorsList();

    if (initialMonth && initialYear) {
      dispatch(
        getTrainingSessionListInformation(filters, (res) => {
          const trainingSessionList = res || [];
          if (Array.isArray(trainingSessionList) && trainingSessionList.length > 0) {
            setTrainingSessionData(trainingSessionList);
            setError(null);
          } else {
            setTrainingSessionData([]);
            setError("No training session found.");
          }
          setLoading(false);
        })
      );
    } else {
      getTrainingSessionList();
    }
  }, [dispatch]);

  const onStudentData = (res, isEdit) => {
    setSelectedStudent(res.response);
    toast[res.isError ? "error" : "success"](
      res.isError ? "Failed....!" : isEdit ? "Session updated successfully!" : "Session added successfully!"
    );
  };

  const onReschduleStudentData = (res, isEdit) => {
    setSelectedStudent(res.response);
    toast[res.isError ? "error" : "success"](
      res.isError ? "Failed....!" : isEdit ? res.response.message : "Session added successfully!"
    );
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleRescheduleSession = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setShowRModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowRModal(false);
    setIsEdit(false);
    setSelectedStudent(null);
  };

  // NEW: open completed sessions modal and fetch data
  const openCompletedModal = (tsession) => {
    const studentId = tsession?.student_id || tsession?.studentId || tsession?.student?.id;
    if (!studentId) {
      toast.error("Student ID not found for this row.");
      return;
    }

    setCompletedLoading(true);
    setCompletedError(null);
    setShowCompletedModal(true);
    setCompletedSessions([]);

    dispatch(
      getStudentCompletedList(
        { studentId, status: "Completed" },
        (res) => {
          const data = res?.response || res || [];
          if (Array.isArray(data) && data.length > 0) {
            setCompletedSessions(data);
          } else {
            setCompletedSessions([]);
            setCompletedError("No completed sessions found.");
          }
          setCompletedLoading(false);
        }
      )
    );
  };

  return (
    <>
      <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />
            <div className="content-wrapper">
              <div className="content">
                <div className="row">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Training Session</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#"><span className="mdi mdi-home"></span></a>
                        </li>
                        <li className="breadcrumb-item">Training Session</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Training Session List
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <div className="col-xl-6 text-right">
                    <PWAInstallButton />
                    <button
                      type="button"
                      className="mb-1 btn btn-secondary mr-2"
                      onClick={() => {
                        setFiltersVisible(!filtersVisible);
                        if (!filtersVisible) setFilterApplied(false);
                      }}
                    >
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                  </div>
                </div>

                {filtersVisible && (
                  <div className="card p-3 mb-4">
                    <Formik
                      initialValues={filters}
                      validationSchema={FilterValidationSchema}
                      enableReinitialize
                      onSubmit={(values) => {
                        const payload = {
                          ...values,
                          instructor_id: values.instructor_id === "ALL" ? "" : values.instructor_id,
                        };

                        dispatch(
                          getTrainingSessionFilterListInformation(payload, (res) => {
                            const trainingSessionList = res || [];
                            if (Array.isArray(trainingSessionList) && trainingSessionList.length > 0) {
                              setTrainingSessionData(trainingSessionList);
                              setError(null);
                            } else {
                              setTrainingSessionData([]);
                              setError("No training session found.");
                            }
                            setLoading(false);
                            setFilterApplied(true);
                          })
                        );
                      }}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          <div className="row align-items-end">
                            <div className="col-md-3">
                              <label>Instructor</label>
                              <Field
                                as="select"
                                name="instructor_id"
                                className={`form-control ${errors.instructor_id && touched.instructor_id ? "is-invalid" : ""}`}
                              >
                                <option value="ALL">All</option>
                                {instructorsData.map((instructor) => (
                                  <option key={instructor.id} value={instructor.id}>
                                    {instructor.name}
                                  </option>
                                ))}
                              </Field>
                              <div style={{ minHeight: "22px" }}>
                                <ErrorMessage name="instructor_id" component="div" className="text-danger" />
                              </div>
                            </div>

                            <div className="col-md-2">
                              <label>Start Date</label>
                              <Field type="date" name="start_date" className="form-control" />
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-md-2">
                              <label>End Date</label>
                              <Field type="date" name="end_date" className="form-control" />
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-md-2">
                              <label>Status</label>
                              <Field as="select" name="status" className="form-control">
                                <option value="All">All</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                               
                              </Field>
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-md-2 align-items-end">
                              <button type="submit" className="btn btn-primary w-100">Apply</button>
                              <div style={{ minHeight: "22px" }}></div>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                )}

                {/* Training session List */}
                <div>
                   <button
                                  className="btn btn-sm btn-warning"
                                  title="Reschedule Session"
                                 
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button> - <span>Reschedule Session</span> {"  "} &nbsp;
                                <button
                                  className="btn btn-sm btn-success"
                                  title="Show Student Completed Sessions"
                                 
                                >
                                  <i className="bi bi-clipboard-check"></i>
                                </button> - <span>Show Student Completed Sessions</span>
                  {loading ? (
                    <p className="text-center my-5">Loading training session...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="table-responsive" style={{display: "block"}}>
                      <table className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th>
                            <th>Student Name</th>
                            <th>Instructor Name</th>
                            <th>Date</th>
                            <th>Session Completed</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainingSessionData.map((tsession, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{tsession.student_name || "Student Name"}</td>
                              <td>{tsession.instructor_name || "Instructor Name"}</td>
                              <td>{tsession.date || "N/A"}</td>
                              <td>{tsession.actual_progress || "N/A"}</td>
                              <td className="status">
                                <i className="bi bi-check-circle"></i>{" "} {tsession.status}
                              </td>
                              <td>
                                <button
                                  className="btn btn-primary btn-sm action-btn"
                                  onClick={() => openSessionModal(tsession)}
                                >
                                  View
                                </button>

                                <button
                                  className="btn btn-sm btn-warning action-btn"
                                  title="Edit Training Session"
                                  onClick={() => handleEditStudent(tsession)}
                                >
                                  {/* <i className="bi bi-pencil"></i> */}
                                  Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-warning"
                                  title="Reschedule Session"
                                  onClick={() => handleRescheduleSession(tsession)}
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button>

                                {/* NEW: Completed Sessions */}
                                {"  "}
                                <button
                                  className="btn btn-sm btn-success"
                                  title="Show Student Completed Sessions"
                                  onClick={() => openCompletedModal(tsession)}
                                >
                                  <i className="bi bi-clipboard-check"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AddTrainingSession
              showModal={showModal}
              hideModal={handleCloseModal}
              onStudentAdded={getTrainingSessionList}
              studentData={onStudentData}
              id={selectedStudent}
              isEdit={isEdit}
            />

            <RescheduleSession
              showModal={showRModal}
              hideModal={handleCloseModal}
              onStudentAdded={getTrainingSessionList}
              studentData={onReschduleStudentData}
              id={selectedStudent}
              isEdit={isEdit}
            />

            <StudentTrainingSessionModal
              show={showSessionModal}
              onClose={closeSessionModal}
              session={sessionStudentData}
            />

            {/* NEW: Completed Sessions Modal */}
            <div
              className={`modal fade ${showCompletedModal ? "show d-block" : ""}`}
              tabIndex="-1"
              role="dialog"
              aria-hidden={!showCompletedModal}
              style={{ background: showCompletedModal ? "rgba(0,0,0,0.5)" : "transparent" }}
            >
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                 

                  <div className="modal-header align-items-start">
  <div className="flex-grow-1 text-center">
    {orgNameForReport && (
      <div className="mb-1" style={{ fontSize: "1rem", fontWeight: 700, color: "#1b223c" }}>
        {orgNameForReport}
      </div>
    )}
    <h5 className="modal-title mb-0" style={{ fontSize: "1.05rem" }}>Progress Report</h5>
  </div>
  <div className="d-flex gap-2">
    <button
      type="button"
      className="btn btn-outline-primary"
      onClick={printCompletedTable}
      disabled={completedLoading || !!completedError || completedSessions.length === 0}
      title="Print completed sessions"
    >
      <i className="bi bi-printer"></i> Print
    </button>
    <button
      type="button"
      className="close btn"
      aria-label="Close"
      onClick={() => setShowCompletedModal(false)}
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</div>


                  <div className="modal-body" style={{overflowX: "auto",whiteSpace: "nowrap"}}>
                    {completedLoading ? (
                      <p className="text-center my-4">Loading completed sessions...</p>
                    ) : completedError ? (
                      <p className="text-center text-danger my-4">{completedError}</p>
                    ) : (
                      <div className="table-responsive">
                        <table ref={completedTableRef} className="table table-bordered align-middle text-center">
  <thead className="table-light">
    <tr>
      <th>#</th>
      <th>Date</th>
      <th>Instructor</th>
      <th>Student</th>
      <th>No. of Classes</th>
      <th>Remarks</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {completedSessions.map((row, idx) => (
      <tr key={idx}>
        <td>{idx + 1}</td>
        <td>{formatDateDDMMYYYY(row?.date)}</td>
        <td>{row?.instructor_name || "-"}</td>
        <td>{row?.student_name || "-"}</td>
        <td>{row?.num_classes ?? "-"}</td>
        <td>{row?.remarks || "-"}</td>
        <td><span className="badge badge-success">Completed</span></td>
      </tr>
    ))}
  </tbody>
</table>

                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowCompletedModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* END Completed Sessions Modal */}

            <Footer />
          </div>
        </div>
      </div>

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

export default TrainingSession;
