import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "./../Students/Students.css";
import "./TrainingSession.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import AddTrainingSession from "./addTrainingSession";

import {
  getTrainingSessionListInformation,
  getTrainingSessionFilterListInformation,
  RescheduleTrainingSession,
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

const isCompletedSession = (session) =>
  String(session?.status || session?.session_status || "")
    .trim()
    .toLowerCase() === "completed";

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DEFAULT_WORKING_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const normalizeWorkingDay = (day) => String(day || "").trim().slice(0, 3).toUpperCase();

const parseSessionDate = (value) => {
  const datePart = String(value || "").slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

  const parsedDate = new Date(year, month - 1, day, 12, 0, 0);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextWorkingDate = (sessionDate, workingDays) => {
  const currentDate = parseSessionDate(sessionDate);
  if (!currentDate) return null;

  const normalizedDays = Array.isArray(workingDays)
    ? workingDays.map(normalizeWorkingDay).filter(Boolean)
    : [];
  const workingDaySet = new Set(normalizedDays.length ? normalizedDays : DEFAULT_WORKING_DAYS);
  const candidate = new Date(currentDate);

  for (let offset = 1; offset <= 7; offset += 1) {
    candidate.setDate(candidate.getDate() + 1);
    if (workingDaySet.has(DAY_CODES[candidate.getDay()])) {
      return toLocalISODate(candidate);
    }
  }

  return null;
};

const formatLeaveDate = (value) => {
  const date = parseSessionDate(value);
  if (!date) return value || "-";
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const TrainingSession = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
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
  const [studentSearch, setStudentSearch] = useState("");
  const [leavePlan, setLeavePlan] = useState(null);
  const [markingLeave, setMarkingLeave] = useState(false);
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

  const handleEditStudent = (student) => {
    if (isCompletedSession(student)) return;
    setSelectedStudent(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const findSessionInstructor = (session) => {
    const sessionInstructorId = session?.instructor_id || session?.instructorId;
    const sessionInstructorMobile =
      session?.instructor_mobile || session?.instructor_mobile_number || session?.instructorMobile;
    const sessionInstructorName = String(session?.instructor_name || "").trim().toLowerCase();

    return instructorsData.find((instructor) => {
      const instructorId = instructor?.id || instructor?._id;
      const instructorMobile = instructor?.mobile_number || instructor?.mobile;
      const instructorName = String(instructor?.name || "").trim().toLowerCase();

      return (
        (sessionInstructorId && String(instructorId) === String(sessionInstructorId)) ||
        (sessionInstructorMobile && String(instructorMobile) === String(sessionInstructorMobile)) ||
        (sessionInstructorName && instructorName === sessionInstructorName)
      );
    });
  };

  const handleMarkLeave = (student) => {
    if (isCompletedSession(student)) return;

    const sessionId = student?._id || student?.id;
    if (!sessionId) {
      toast.error("Session ID was not found.");
      return;
    }

    const instructor = findSessionInstructor(student);
    const newDate = getNextWorkingDate(student?.date, instructor?.working_days);
    if (!newDate) {
      toast.error("Unable to determine the instructor's next working day.");
      return;
    }

    setLeavePlan({ session: student, sessionId, instructor, newDate });
  };

  const closeLeaveConfirmation = () => {
    if (markingLeave) return;
    setLeavePlan(null);
  };

  const confirmMarkLeave = () => {
    if (!leavePlan || markingLeave) return;

    setMarkingLeave(true);
    dispatch(
      RescheduleTrainingSession(
        {
          session_id: leavePlan.sessionId,
          action: "postpone",
          new_date: leavePlan.newDate,
        },
        (res) => {
          setMarkingLeave(false);

          if (res?.isError || !res) {
            const message =
              res?.data?.detail ||
              res?.detail ||
              "Unable to mark leave and move the session.";
            toast.error(typeof message === "string" ? message : "Unable to mark leave and move the session.");
            return;
          }

          toast.success(`Leave marked. Session moved to ${formatLeaveDate(leavePlan.newDate)}.`);
          setLeavePlan(null);
          getTrainingSessionList();
        }
      )
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  const completedReportStudent = completedSessions[0]?.student_name || "-";
  const completedReportInstructors = [
    ...new Set(completedSessions.map((session) => session?.instructor_name).filter(Boolean)),
  ].join(", ") || "-";

  const normalizedStudentSearch = studentSearch.trim();
  const searchedTrainingSessions = useMemo(() => {
    const query = normalizedStudentSearch.toLowerCase();
    if (!query) return trainingSessionData;

    return trainingSessionData.filter((session) =>
      String(session?.student_name || "").toLowerCase().includes(query)
    );
  }, [normalizedStudentSearch, trainingSessionData]);

  return (
    <>
      <div className="header-fixed sidebar-fixed sidebar-dark header-light training-session-page" id="body">
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />
            <div className="content-wrapper">
              <div className="content">
                <div className="row training-session-heading">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Training Session</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#" className="training-breadcrumb-home" aria-label="Training sessions home">
                            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                              <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                            </svg>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Training Session</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Training Session List
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <div className="col-xl-6 text-right training-session-toolbar">
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
                  <div className="card p-3 mb-4 training-filter-card">
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
                          <div className="row align-items-end training-filter-grid">
                            <div className="col-lg-3 col-md-6">
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

                            <div className="col-lg-2 col-md-6">
                              <label>Start Date</label>
                              <Field type="date" name="start_date" className="form-control" />
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-lg-2 col-md-6">
                              <label>End Date</label>
                              <Field type="date" name="end_date" className="form-control" />
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-lg-2 col-md-6">
                              <label>Status</label>
                              <Field as="select" name="status" className="form-control">
                                <option value="All">All</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                               
                              </Field>
                              <div style={{ minHeight: "22px" }}></div>
                            </div>

                            <div className="col-lg-2 col-md-6 align-items-end">
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
                <div className="training-session-list">
                  <div className="training-action-legend">
                    <div className="training-legend-item">
                      <span className="training-legend-icon is-warning" aria-hidden="true">
                        <i className="bi bi-calendar-x" />
                      </span>
                      <span>Mark leave and move to next working day</span>
                    </div>
                    <div className="training-legend-item">
                      <span className="training-legend-icon is-success" aria-hidden="true">
                        <i className="bi bi-clipboard-check" />
                      </span>
                      <span>View completed sessions</span>
                    </div>
                    <div className="training-student-search" role="search">
                      <div className="training-student-search-control">
                        <div className="training-student-search-field">
                          <i className="bi bi-search" aria-hidden="true" />
                          <input
                            id="training-student-search-input"
                            type="text"
                            className="form-control"
                            value={studentSearch}
                            onChange={(event) => setStudentSearch(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") setStudentSearch("");
                            }}
                            placeholder="Type a student name..."
                            aria-label="Search by student name"
                            autoComplete="off"
                            spellCheck="false"
                          />
                          {studentSearch && (
                            <button
                              type="button"
                              className="training-student-search-clear"
                              onClick={() => setStudentSearch("")}
                              aria-label="Clear student search"
                            >
                              <i className="bi bi-x-lg" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="training-student-search-count" aria-live="polite">
                        {normalizedStudentSearch
                          ? `${searchedTrainingSessions.length} of ${trainingSessionData.length}`
                          : trainingSessionData.length}{" "}
                        session{trainingSessionData.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  {loading ? (
                    <LoadingState label="Loading training sessions" />
                  ) : error ? (
                    <EmptyState
                      icon="bi bi-calendar2-x"
                      title="No training sessions found"
                      description="Training sessions will appear here after they are scheduled or when they match the selected filters."
                    />
                  ) : (
                    <div className="table-responsive training-session-table-wrap">
                      <table className="table custom-table text-center align-middle training-session-table">
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
                          {searchedTrainingSessions.length > 0 ? (
                            searchedTrainingSessions.map((tsession, index) => (
                            <tr key={tsession.id || tsession._id || `${tsession.student_name}-${tsession.date}-${index}`}>
                              <td data-label="S.No">{index + 1}</td>
                              <td data-label="Student">{tsession.student_name || "Student Name"}</td>
                              <td data-label="Instructor">{tsession.instructor_name || "Instructor Name"}</td>
                              <td data-label="Date">{formatDateDDMMYYYY(tsession.date)}</td>
                              <td data-label="Progress">{tsession.actual_progress || "N/A"}</td>
                              <td data-label="Status" className="status">
                                <span className="training-session-status">
                                  <i className="bi bi-check-circle"></i> {tsession.status}
                                </span>
                              </td>
                              <td data-label="Actions" className="training-session-actions">
                                <div className="training-session-action-buttons">
                                  <button className="btn btn-primary btn-sm training-session-action-button" title="View Training Session" aria-label="View Training Session" onClick={() => openSessionModal(tsession)}><i className="bi bi-eye" aria-hidden="true"></i><span className="training-session-action-label">View</span></button>
                                  <button
                                    className="btn btn-sm btn-warning training-session-action-button"
                                    title={isCompletedSession(tsession) ? "Completed sessions cannot be edited" : "Edit Training Session"}
                                    aria-label={isCompletedSession(tsession) ? "Edit disabled: session completed" : "Edit Training Session"}
                                    disabled={isCompletedSession(tsession)}
                                    onClick={() => handleEditStudent(tsession)}
                                  >
                                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                                    <span className="training-session-action-label">Edit</span>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning training-session-action-button"
                                    title={isCompletedSession(tsession) ? "Completed sessions cannot be marked as leave" : "Mark leave and move this session"}
                                    aria-label={isCompletedSession(tsession) ? "Mark leave disabled: session completed" : "Mark leave"}
                                    disabled={isCompletedSession(tsession) || (markingLeave && leavePlan?.sessionId === (tsession?._id || tsession?.id))}
                                    onClick={() => handleMarkLeave(tsession)}
                                  >
                                    <i className="bi bi-calendar-x" aria-hidden="true"></i>
                                    <span className="training-session-action-label">Mark Leave</span>
                                  </button>
                                  <button className="btn btn-sm btn-success training-session-action-button" title="Show Student Completed Sessions" aria-label="Show Student Completed Sessions" onClick={() => openCompletedModal(tsession)}><i className="bi bi-clipboard-check" aria-hidden="true"></i><span className="training-session-action-label">Completed</span></button>
                                </div>
                              </td>
                            </tr>
                            ))
                          ) : (
                            <tr className="training-search-empty-row">
                              <td colSpan="7">
                                <EmptyState
                                  icon="bi bi-person-x"
                                  title="No matching student"
                                  description={`No training sessions match “${normalizedStudentSearch}”.`}
                                  actionLabel="Clear search"
                                  onAction={() => setStudentSearch("")}
                                  variant="compact"
                                />
                              </td>
                            </tr>
                          )}
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

            <Modal
              show={Boolean(leavePlan)}
              onHide={closeLeaveConfirmation}
              centered
              backdrop="static"
              keyboard={!markingLeave}
              dialogClassName="mark-leave-dialog"
            >
              <Modal.Header closeButton={!markingLeave} className="mark-leave-header">
                <Modal.Title>Confirm Student Leave</Modal.Title>
              </Modal.Header>
              <Modal.Body className="mark-leave-body">
                <div className="mark-leave-content">
                  <span className="mark-leave-icon" aria-hidden="true">
                    <i className="bi bi-calendar-x" />
                  </span>
                  <div>
                    <p>
                      Mark <strong>{leavePlan?.session?.student_name || "this student"}</strong> as
                      leave for {formatDateDDMMYYYY(leavePlan?.session?.date)}?
                    </p>
                    <div className="mark-leave-date-change">
                      <span>{formatLeaveDate(leavePlan?.session?.date)}</span>
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                      <strong>{formatLeaveDate(leavePlan?.newDate)}</strong>
                    </div>
                    <small>
                      The session will move automatically to the instructor&apos;s next working day.
                    </small>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="mark-leave-footer">
                <Button variant="secondary" onClick={closeLeaveConfirmation} disabled={markingLeave}>
                  Cancel
                </Button>
                <Button variant="warning" onClick={confirmMarkLeave} disabled={markingLeave}>
                  {markingLeave ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-1" aria-hidden="true" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2 mr-1" aria-hidden="true" />
                      Mark Leave
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Modal>

            <StudentTrainingSessionModal
              show={showSessionModal}
              onClose={closeSessionModal}
              session={sessionStudentData}
            />

            {/* Completed Sessions Modal */}
            <div
              className={`modal fade completed-sessions-modal ${showCompletedModal ? "show d-block" : ""}`}
              tabIndex="-1"
              role="dialog"
              aria-hidden={!showCompletedModal}
              aria-modal={showCompletedModal ? "true" : undefined}
              aria-labelledby="completed-sessions-title"
              style={{ background: showCompletedModal ? "rgba(16,24,40,0.58)" : "transparent" }}
            >
              <div className="modal-dialog modal-lg completed-sessions-dialog" role="document">
                <div className="modal-content completed-sessions-content">
                  <div className="modal-header completed-sessions-header">
                    <div className="completed-report-identity">
                      <span className="completed-report-icon" aria-hidden="true">
                        <i className="bi bi-clipboard2-check" />
                      </span>
                      <div>
                        {orgNameForReport && (
                          <div className="completed-report-org">{orgNameForReport}</div>
                        )}
                        <h5 className="modal-title" id="completed-sessions-title">
                          Student - Progress Report
                        </h5>
                        <p>Completed practical training sessions</p>
                      </div>
                    </div>

                    <div className="completed-report-actions">
                      <button
                        type="button"
                        className="btn btn-outline-primary completed-print-button"
                        onClick={printCompletedTable}
                        disabled={completedLoading || !!completedError || completedSessions.length === 0}
                        title="Print completed sessions"
                      >
                        <i className="bi bi-printer" aria-hidden="true" />
                        <span>Print Report</span>
                      </button>
                      <button
                        type="button"
                        className="btn completed-report-close"
                        aria-label="Close progress report"
                        onClick={() => setShowCompletedModal(false)}
                      >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="modal-body completed-sessions-body">
                    {completedLoading ? (
                      <LoadingState label="Loading completed sessions" />
                    ) : completedError ? (
                      <EmptyState
                        icon="bi bi-calendar2-x"
                        title="No completed sessions found"
                        description={completedError}
                        variant="compact"
                      />
                    ) : (
                      <>
                        <div className="completed-report-summary">
                          <div className="completed-summary-item">
                            <span>Student</span>
                            <strong>{completedReportStudent}</strong>
                          </div>
                          <div className="completed-summary-item">
                            <span>Instructor</span>
                            <strong>{completedReportInstructors}</strong>
                          </div>
                          <div className="completed-summary-item">
                            <span>Completed Sessions</span>
                            <strong>{completedSessions.length}</strong>
                          </div>
                        </div>

                        <div className="table-responsive completed-sessions-table-wrap">
                          <table ref={completedTableRef} className="table align-middle completed-sessions-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Instructor</th>
                                <th>Student</th>
                                <th>Remarks</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {completedSessions.map((row, idx) => (
                                <tr key={idx}>
                                  <td data-label="#">{idx + 1}</td>
                                  <td data-label="Date">{formatDateDDMMYYYY(row?.date)}</td>
                                  <td data-label="Instructor">{row?.instructor_name || "-"}</td>
                                  <td data-label="Student">{row?.student_name || "-"}</td>
                                  <td data-label="Remarks">{row?.remarks || "-"}</td>
                                  <td data-label="Status">
                                    <span className="completed-session-status badge badge-success">
                                      <i className="bi bi-check-circle-fill" aria-hidden="true" />
                                      Completed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="modal-footer completed-sessions-footer">
                    <span>
                      {completedSessions.length} completed {completedSessions.length === 1 ? "session" : "sessions"}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCompletedModal(false)}
                    >
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
