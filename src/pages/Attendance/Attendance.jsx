import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../Students/Pagenation";
import { getAllStudents } from "../../services/functional/students/getStudentsListService";
import { getAllInstructors } from "../../services/functional/instructors/getInstructorsListService";
import {
  getAttendanceRecords,
  saveAttendanceRecords,
} from "../../services/functional/attendance/attendanceService";
import "./Attendance.css";

const STATUS_OPTIONS = [
  { value: "unmarked", label: "Not marked" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

const STUDENT_ROSTER_PAGE_SIZE = 100;
const MAX_STUDENT_ROSTER_PAGES = 100;

const getToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getPersonId = (person) =>
  String(
    person?._id ||
      person?.id ||
      person?.mobile_number ||
      person?.application_no ||
      person?.email ||
      person?.name ||
      ""
  );

const normalizeStudents = (response) => {
  const payload = response?.data?.response ?? response?.data ?? response;
  const records = payload?.students ?? payload?.response?.students ?? payload;
  return Array.isArray(records) ? records : [];
};

const getStudentTotal = (response) => {
  const payload = response?.data?.response ?? response?.data ?? response;
  const total = Number(payload?.total ?? payload?.response?.total);
  return Number.isFinite(total) && total >= 0 ? total : null;
};

const loadAllStudents = async () => {
  const students = [];
  let skip = 0;

  for (let page = 0; page < MAX_STUDENT_ROSTER_PAGES; page += 1) {
    const response = await getAllStudents({
      skip,
      limit: STUDENT_ROSTER_PAGE_SIZE,
    });
    const records = normalizeStudents(response);
    const total = getStudentTotal(response);

    students.push(...records);

    if (
      records.length === 0 ||
      records.length < STUDENT_ROSTER_PAGE_SIZE ||
      (total !== null && students.length >= total)
    ) {
      break;
    }

    skip += records.length;
  }

  return Array.from(
    new Map(students.map((student) => [getPersonId(student), student])).values()
  );
};

const normalizeInstructors = (response) => {
  const payload = response?.data?.response ?? response?.data ?? response;
  return Array.isArray(payload) ? payload : [];
};

const normalizeAttendance = (response) => {
  const payload = response?.data?.response ?? response?.data ?? response;
  const records = payload?.records ?? payload?.attendance ?? payload;
  return Array.isArray(records) ? records : [];
};

const getTenantKey = () => {
  try {
    const tenant = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const user = JSON.parse(localStorage.getItem("userRoleInfo") || "{}");
    return String(
      tenant?.id || tenant?._id || tenant?.org_name || tenant?.organization_name || user?.email || "default"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  } catch (_error) {
    return "default";
  }
};

const getStorageKey = (date, personType) =>
  `drivedesk-attendance:${getTenantKey()}:${personType}:${date}`;

const readDeviceRecords = (date, personType) => {
  try {
    const stored = JSON.parse(localStorage.getItem(getStorageKey(date, personType)) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (_error) {
    return [];
  }
};

const writeDeviceRecords = (date, personType, records) => {
  localStorage.setItem(getStorageKey(date, personType), JSON.stringify(records));
};

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function Attendance() {
  const [personType, setPersonType] = useState("student");
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [searchText, setSearchText] = useState("");
  const [rosters, setRosters] = useState({ student: [], instructor: [] });
  const [attendance, setAttendance] = useState({});
  const [rosterLoading, setRosterLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const people = useMemo(() => rosters[personType] || [], [personType, rosters]);

  const loadRosters = useCallback(async () => {
    setRosterLoading(true);
    setError("");

    const [studentsResult, instructorsResult] = await Promise.allSettled([
      loadAllStudents(),
      getAllInstructors({}),
    ]);

    const students = studentsResult.status === "fulfilled" ? studentsResult.value : [];
    const instructors = instructorsResult.status === "fulfilled" ? normalizeInstructors(instructorsResult.value) : [];

    setRosters({ student: students, instructor: instructors });
    setRosterLoaded(true);
    setRosterLoading(false);

    if (!students.length && !instructors.length) {
      setError("Unable to load the student and instructor rosters.");
    }
  }, []);

  useEffect(() => {
    loadRosters();
  }, [loadRosters]);

  const loadAttendance = useCallback(async () => {
    if (!rosterLoaded) return;

    setAttendanceLoading(true);
    setDirty(false);
    setError("");

    let records = [];
    let usingDeviceMode = false;

    try {
      const response = await getAttendanceRecords({ date: selectedDate, personType });
      records = normalizeAttendance(response);
    } catch (_apiError) {
      records = readDeviceRecords(selectedDate, personType);
      usingDeviceMode = true;
    }

    const recordsById = new Map(
      records.map((record) => [String(record.person_id || record.personId || record.mobile_number || record.id), record])
    );

    const nextAttendance = {};
    (rosters[personType] || []).forEach((person) => {
      const personId = getPersonId(person);
      const record = recordsById.get(personId) || {};
      nextAttendance[personId] = {
        status: String(record.status || "unmarked").toLowerCase(),
        remarks: record.remarks || record.notes || "",
      };
    });

    setAttendance(nextAttendance);
    setDeviceMode(usingDeviceMode);
    setAttendanceLoading(false);
  }, [personType, rosterLoaded, rosters, selectedDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    setCurrentPage(1);
  }, [personType, searchText, selectedDate]);

  const filteredPeople = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return people;

    return people.filter((person) =>
      [person?.name, person?.mobile_number, person?.application_no, person?.email, person?.instructor_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [people, searchText]);

  const pageCount = Math.max(1, Math.ceil(filteredPeople.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const visiblePeople = filteredPeople.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summary = useMemo(() => {
    const counts = { total: people.length, present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 };
    people.forEach((person) => {
      const status = attendance[getPersonId(person)]?.status || "unmarked";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [attendance, people]);

  const updateAttendance = (personId, field, value) => {
    setAttendance((current) => ({
      ...current,
      [personId]: {
        status: current[personId]?.status || "unmarked",
        remarks: current[personId]?.remarks || "",
        [field]: value,
      },
    }));
    setDirty(true);
  };

  const markFilteredPresent = () => {
    setAttendance((current) => {
      const next = { ...current };
      filteredPeople.forEach((person) => {
        const personId = getPersonId(person);
        next[personId] = { ...next[personId], status: "present", remarks: next[personId]?.remarks || "" };
      });
      return next;
    });
    setDirty(true);
  };

  const clearFilteredMarks = () => {
    setAttendance((current) => {
      const next = { ...current };
      filteredPeople.forEach((person) => {
        const personId = getPersonId(person);
        next[personId] = { ...next[personId], status: "unmarked", remarks: next[personId]?.remarks || "" };
      });
      return next;
    });
    setDirty(true);
  };

  const buildRecords = () =>
    people.map((person) => {
      const personId = getPersonId(person);
      const record = attendance[personId] || { status: "unmarked", remarks: "" };
      return {
        person_id: personId,
        person_type: personType,
        name: person?.name || "",
        mobile_number: person?.mobile_number || "",
        status: record.status,
        remarks: record.remarks.trim(),
      };
    });

  const saveAttendance = async () => {
    const records = buildRecords();
    setSaving(true);

    const payload = {
      date: selectedDate,
      person_type: personType,
      records,
    };

    try {
      await saveAttendanceRecords(payload);
      writeDeviceRecords(selectedDate, personType, records);
      setDeviceMode(false);
      setDirty(false);
      toast.success("Attendance saved successfully.");
    } catch (_apiError) {
      writeDeviceRecords(selectedDate, personType, records);
      setDeviceMode(true);
      setDirty(false);
      toast.warning("Server attendance API is unavailable. Attendance was saved on this device.");
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = () => {
    const rows = filteredPeople.map((person, index) => {
      const record = attendance[getPersonId(person)] || {};
      return [
        index + 1,
        selectedDate,
        personType,
        person?.name || "",
        person?.mobile_number || "",
        record.status || "unmarked",
        record.remarks || "",
      ];
    });
    const csv = [
      ["S.No", "Date", "Type", "Name", "Mobile Number", "Status", "Remarks"],
      ...rows,
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${personType}-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSecondaryValue = (person) => {
    if (personType === "student") {
      return person?.instructor_name || person?.plan_name || person?.plan || "Not assigned";
    }
    return person?.email || "No email";
  };

  const isLoading = rosterLoading || attendanceLoading;

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light attendance-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <main className="content">
              <div className="attendance-heading">
                <div className="breadcrumb-wrapper">
                  <h1>Attendance Management</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item"><span className="mdi mdi-home" aria-hidden="true" /></li>
                      <li className="breadcrumb-item">Attendance</li>
                      <li className="breadcrumb-item" aria-current="page">Daily Register</li>
                    </ol>
                  </nav>
                </div>

                <div className="attendance-heading-actions">
                  <button type="button" className="btn btn-outline-primary" onClick={exportAttendance} disabled={!filteredPeople.length}>
                    <i className="bi bi-download" aria-hidden="true" /> Export
                  </button>
                  <button type="button" className="btn btn-primary" onClick={saveAttendance} disabled={saving || isLoading || !people.length}>
                    <i className="bi bi-check2-circle" aria-hidden="true" /> {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              </div>

              {deviceMode && (
                <div className="attendance-device-notice" role="status">
                  <i className="bi bi-device-ssd" aria-hidden="true" />
                  <div><strong>Device backup mode</strong><span>The attendance API is unavailable, so changes are stored only on this device.</span></div>
                </div>
              )}

              <section className="attendance-toolbar" aria-label="Attendance controls">
                <div className="attendance-tabs" role="tablist" aria-label="Attendance type">
                  <button type="button" role="tab" aria-selected={personType === "student"} className={personType === "student" ? "active" : ""} onClick={() => setPersonType("student")}>
                    <i className="mdi mdi-account-convert" aria-hidden="true" /> Students
                  </button>
                  <button type="button" role="tab" aria-selected={personType === "instructor"} className={personType === "instructor" ? "active" : ""} onClick={() => setPersonType("instructor")}>
                    <i className="mdi mdi-account-tie" aria-hidden="true" /> Instructors
                  </button>
                </div>

                <div className="attendance-filter-row">
                  <label className="attendance-date-field">
                    <span>Date</span>
                    <input type="date" className="form-control" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                  </label>
                  <label className="attendance-search-field">
                    <span>Search register</span>
                    <span className="attendance-search-input">
                      <i className="bi bi-search" aria-hidden="true" />
                      <input type="search" className="form-control" placeholder="Search by name, mobile or application number" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
                    </span>
                  </label>
                  <div className="attendance-bulk-actions">
                    <button type="button" className="btn btn-outline-success" onClick={markFilteredPresent} disabled={!filteredPeople.length || isLoading}>Mark all present</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={clearFilteredMarks} disabled={!filteredPeople.length || isLoading}>Clear marks</button>
                  </div>
                </div>
              </section>

              <section className="attendance-summary-grid" aria-label="Attendance summary">
                {[
                  ["Register", summary.total, "mdi-account-group-outline", "is-total"],
                  ["Present", summary.present, "mdi-account-check-outline", "is-present"],
                  ["Absent", summary.absent, "mdi-account-remove-outline", "is-absent"],
                  ["Late", summary.late, "mdi-clock-alert-outline", "is-late"],
                  ["Leave", summary.leave, "mdi-calendar-remove-outline", "is-leave"],
                  ["Not marked", summary.unmarked, "mdi-help-circle-outline", "is-unmarked"],
                ].map(([label, value, icon, tone]) => (
                  <article key={label} className={`attendance-summary-card ${tone}`}>
                    <span className="attendance-summary-icon"><i className={`mdi ${icon}`} aria-hidden="true" /></span>
                    <span><small>{label}</small><strong>{value}</strong></span>
                  </article>
                ))}
              </section>

              <section className="attendance-register-card" aria-labelledby="attendance-register-title">
                <div className="attendance-register-header">
                  <div><h2 id="attendance-register-title">{personType === "student" ? "Student" : "Instructor"} attendance</h2><p>{selectedDate} · {filteredPeople.length} records</p></div>
                  {dirty && <span className="attendance-unsaved"><i className="bi bi-circle-fill" /> Unsaved changes</span>}
                </div>

                {isLoading ? (
                  <LoadingState label="Loading attendance register" />
                ) : error ? (
                  <div className="attendance-state is-error"><i className="bi bi-exclamation-circle" /><span>{error}</span><button type="button" className="btn btn-sm btn-outline-primary" onClick={loadRosters}>Retry</button></div>
                ) : !filteredPeople.length ? (
                  <EmptyState
                    icon="bi bi-person-x"
                    title={`No ${personType === "student" ? "students" : "instructors"} found`}
                    description={`Adjust the search or add ${personType === "student" ? "students" : "instructors"} first.`}
                  />
                ) : (
                  <>
                    <div className="table-responsive attendance-table-wrap">
                      <table className="table align-middle attendance-table">
                        <thead><tr><th>S.No</th><th>Name</th><th>Mobile Number</th><th>{personType === "student" ? "Instructor / Plan" : "Email"}</th><th>Status</th><th>Remarks</th></tr></thead>
                        <tbody>
                          {visiblePeople.map((person, index) => {
                            const personId = getPersonId(person);
                            const record = attendance[personId] || { status: "unmarked", remarks: "" };
                            return (
                              <tr key={personId}>
                                <td data-label="S.No">{(safePage - 1) * pageSize + index + 1}</td>
                                <td data-label="Name"><span className="attendance-person"><span className="attendance-person-avatar">{String(person?.name || "?").charAt(0).toUpperCase()}</span><span><strong>{person?.name || "Unnamed"}</strong><small>{person?.application_no || (personType === "student" ? "Student" : "Instructor")}</small></span></span></td>
                                <td data-label="Mobile Number">{person?.mobile_number || "N/A"}</td>
                                <td data-label={personType === "student" ? "Instructor / Plan" : "Email"}>{getSecondaryValue(person)}</td>
                                <td data-label="Status"><select className={`form-select attendance-status-select is-${record.status}`} value={record.status} onChange={(event) => updateAttendance(personId, "status", event.target.value)} aria-label={`Attendance status for ${person?.name || "record"}`}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
                                <td data-label="Remarks"><input type="text" className="form-control attendance-remarks" value={record.remarks} maxLength={160} placeholder="Optional remarks" onChange={(event) => updateAttendance(personId, "remarks", event.target.value)} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination currentPage={safePage} totalCount={filteredPeople.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} pageSizeOptions={[10, 20, 50, 100]} />
                  </>
                )}
              </section>
            </main>
          </div>

          <Footer />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={4000} closeButton={false} />
    </div>
  );
}
