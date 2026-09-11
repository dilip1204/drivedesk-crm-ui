import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Instructors.css";
import "./InstructorAvailabilityDashboard.css";

import { getInstructorAvailInformation } from "../../store/instructors/actions"; // <-- adjust path
import Sidebar from "../../components/Sidebar"; // <-- adjust path
import Header from "../../components/Header"; // <-- adjust path
import Footer from "../../components/Footer"; // <-- adjust path
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";

/********************
 * small helpers
 ********************/
function clsx(...parts) {
  return parts.filter(Boolean).join(" ");
}
function formatTimeLabel(hhmm) {
  return hhmm;
}
function getMonthYear(summaryMonth) {
  const parts = `${summaryMonth ?? ""}`.split("-");
  const y = Number(parts[0]) || new Date().getFullYear();
  const m = Number(parts[1]) || new Date().getMonth() + 1;
  return { year: y, monthIndex: m - 1 };
}
function getMonthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function isInstructorWorkingDay(day, date, workingDaySet) {
  if (typeof day?.is_working_day === "boolean") {
    return day.is_working_day;
  }

  if (workingDaySet.size > 0) {
    return workingDaySet.has(DAY_CODES[date.getDay()]);
  }

  return Boolean(day);
}
function badgeColorByStatus(status) {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "bg-success-subtle text-success border-success";
    case "scheduled":
      return "bg-primary-subtle text-primary border-primary";
    case "missed":
      return "bg-danger-subtle text-danger border-danger";
    default:
      return "bg-secondary-subtle text-secondary border-secondary";
  }
}

/********************
 * Donut
 ********************/
function Donut({
  value = 0,
  max = 100,
  size = 140,
  stroke = 14,
  labelTop,
  labelBottom,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const v = Math.min(Math.max(value, 0), max || 1);
  const dash = (v / (max || 1)) * circumference;
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} stroke="#e9ecef" strokeWidth={stroke} fill="none" />
        <circle
          r={radius}
          stroke="#0d6efd"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90)"
        />
        <text textAnchor="middle" dominantBaseline="central" fill="#495057">
          <tspan x="0" y="-8" style={{ fontSize: 18, fontWeight: 700 }}>
            {labelTop ?? `${v}`}
          </tspan>
          <tspan x="0" y="14" style={{ fontSize: 12, opacity: 0.7 }}>
            {labelBottom ?? ""}
          </tspan>
        </text>
      </g>
    </svg>
  );
}

/********************
 * CalendarGrid (aligned 7-column grid)
 ********************/
function CalendarGrid({ weeks, dayMap, workingDays, onSelect }) {
  const workingDaySet = useMemo(
    () => new Set((workingDays || []).map((day) => String(day).toUpperCase())),
    [workingDays]
  );

  return (
    <div className="calendar">
      <div className="calendar__head">
        {"SUN MON TUE WED THU FRI SAT".split(" ").map((d) => (
          <div key={d} className="calendar__headcell">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar__body">
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            if (!cell) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="calendar__cell calendar__cell--empty"
                />
              );
            }

            const iso = toISODate(cell);
            const d = dayMap.get(iso);
            const isWorkingDay = isInstructorWorkingDay(
              d,
              cell,
              workingDaySet
            );

            const totalCount =
              (d?.available_slots?.length || 0) +
              (d?.booked_slots?.length || 0);
            const bookedCount = d?.booked_slots?.length || 0;

            // tint by utilization (Bootstrap-only colors)
            let tint = "";
            if (isWorkingDay) {
              const pct = totalCount ? bookedCount / totalCount : 0;
              if (pct === 0) tint = "bg-success-subtle";
              else if (pct < 0.33) tint = "bg-success-subtle";
              else if (pct < 0.66) tint = "bg-warning-subtle";
              else if (pct < 1) tint = "bg-warning-subtle";
              else tint = "bg-danger-subtle";
            }

            return (
              <button
                type="button"
                key={iso}
                className={clsx(
                  "calendar__cell",
                  tint,
                  !isWorkingDay && "calendar__cell--sunday"
                )}
                onClick={() => isWorkingDay && onSelect?.(iso)}
                disabled={!isWorkingDay}
                aria-label={`${iso}${isWorkingDay ? "" : " - non-working day"}`}
              >
                <div className="calendar__celltop">
                  <div className="calendar__date">{cell.getDate()}</div>
                  {!isWorkingDay && (
                    <span className="calendar__sunday">Off</span>
                  )}
                </div>

                <div className="calendar__counts">
                  <div className="calendar__count-row">
                    <span>Available</span>
                    <span className="fw-semibold text-success">
                      {d?.available_slots?.length || 0}
                    </span>
                  </div>
                  <div className="calendar__count-row">
                    <span>Booked</span>
                    <span className="fw-semibold text-primary">
                      {d?.booked_slots?.length || 0}
                    </span>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className="progress calendar__progress">
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${(bookedCount / totalCount) * 100}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/********************
 * Day detail drawer (modal slideout)
 ********************/
function DayDetailDrawer({ day, onClose }) {
  const booked = (day.booked_slots || []).map((b, i) => ({
    id: `${b.session_id || i}`,
    time: b.time,
    status: b.status,
    student: b.student_name,
  }));
  const available = day.available_slots || [];

  return (
    <div className="modal d-block availability-detail-modal" tabIndex="-1" role="dialog">
      <div
        className="modal-dialog modal-dialog-slideout modal-lg availability-detail-dialog"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header availability-detail-header">
            <div>
              <span className="availability-detail-eyebrow">Daily schedule</span>
              <h5 className="modal-title">{formatDateDDMMYYYY(day.date)}</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body availability-detail-body">
            {day.window && (
              <div className="availability-window-summary">
                <i className="bi bi-clock" aria-hidden="true" />
                <span>{day.window.from} – {day.window.to}</span>
                <span className="availability-window-divider" aria-hidden="true" />
                <span>{day.window.slot_minutes} minutes per slot</span>
              </div>
            )}

            <div className="row g-3 availability-slot-columns">
              <div className="col-12 col-md-6">
                <div className="availability-slot-heading"><span>Available Slots</span><strong>{available.length}</strong></div>
                <div className="availability-slot-list">
                  {available.length ? (
                    available.map((t) => (
                      <span
                        key={t}
                        className="availability-time-slot"
                      >
                        <i className="bi bi-check-circle" aria-hidden="true" />
                        {formatTimeLabel(t)}
                      </span>
                    ))
                  ) : (
                    <div className="small text-secondary">
                      No available slots
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="availability-slot-heading"><span>Booked Slots</span><strong>{booked.length}</strong></div>
                <div className="availability-booked-list">
                  {booked.length ? (
                    booked.map((b) => (
                      <div
                        key={b.id}
                        className="availability-booked-item"
                      >
                        <div>
                          <div className="availability-booked-time">
                            {formatTimeLabel(b.time)}
                          </div>
                          <div className="availability-booked-student">
                            {b.student}
                          </div>
                        </div>
                        <span
                          className={clsx(
                            "badge border text-bg-danger",
                            badgeColorByStatus(b.status)
                          )}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="small text-secondary">No bookings</div>
                  )}
                </div>
              </div>
            </div>

            {day.note && (
              <div className="availability-day-note"><i className="bi bi-info-circle" aria-hidden="true" /><span>{day.note}</span></div>
            )}
          </div>

          <div className="modal-footer availability-detail-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show availability-detail-backdrop" onClick={onClose}></div>
    </div>
  );
}

/********************
 * Dashboard (pure presentational)
 ********************/
export function InstructorAvailabilityDashboard({ data }) {
  const payloadRoot = data || {};
  const payload = payloadRoot.response ?? payloadRoot;

  const instructor = payload.instructor ?? {};
  const summary = payload.summary ?? {};
  const days = payload.days ?? [];

  const { year, monthIndex } = useMemo(
    () => getMonthYear(summary.month),
    [summary.month]
  );
  const [selectedISO, setSelectedISO] = useState(null);

  const dayMap = useMemo(() => {
    const m = new Map();
    for (const d of days) m.set(d.date, d);
    return m;
  }, [days]);

  const weeks = useMemo(
    () => getMonthMatrix(year, monthIndex),
    [year, monthIndex]
  );
  const selectedDay = selectedISO ? dayMap.get(selectedISO) : null;

  const statusCounts = useMemo(() => {
    const tally = { completed: 0, scheduled: 0, missed: 0 };
    for (const d of days) {
      if (!d.booked_slots) continue;
      for (const b of d.booked_slots) {
        const k = (b.status || "").toLowerCase();
        if (k === "completed") tally.completed++;
        else if (k === "scheduled") tally.scheduled++;
        else if (k === "missed") tally.missed++;
      }
    }
    return tally;
  }, [days]);

  return (
    <>
      <div className="availability-dashboard">
        {/* Header section */}
        <section className="availability-profile-card">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-md-between availability-profile-layout">
            <div className="d-flex align-items-center gap-3 availability-profile-identity">
              <div className="availability-profile-avatar" aria-hidden="true">
                {instructor?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="availability-profile-copy">
                <span className="availability-profile-eyebrow">Instructor schedule</span>
                <h2>{instructor?.name || "Instructor"}</h2>
                <div className="availability-contact-details">
                  <span><i className="bi bi-telephone" aria-hidden="true" />{instructor?.mobile_number || "Not provided"}</span>
                  <span><i className="bi bi-envelope" aria-hidden="true" />{instructor?.email || "Not provided"}</span>
                  <span><i className="bi bi-clock" aria-hidden="true" />{instructor?.available_from || "--:--"} – {instructor?.available_to || "--:--"}</span>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 availability-status-legend">
              <span
                className={clsx(
                  "availability-active-status",
                  instructor?.is_active
                    ? "text-bg-success"
                    : "text-bg-secondary"
                )}
              >
                {instructor?.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
              <div className="availability-legend">
                <span className="availability-legend-item is-available">
                  Available
                </span>
                <span className="availability-legend-item is-scheduled">
                  Scheduled
                </span>
                <span className="availability-legend-item is-completed">
                  Completed
                </span>
                <span className="availability-legend-item is-missed">
                  Missed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="row g-3 availability-summary-grid">
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100 availability-metric-card">
              <div className="card-body">
                <span className="availability-metric-icon"><i className="bi bi-calendar-week" /></span>
                <div><span className="availability-metric-label">Working Days</span><strong>{summary.working_days ?? 0}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100 availability-metric-card">
              <div className="card-body">
                <span className="availability-metric-icon"><i className="bi bi-clock-history" /></span>
                <div><span className="availability-metric-label">Daily Slots</span><strong>{summary.daily_slot_count ?? 0}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100 availability-metric-card">
              <div className="card-body">
                <span className="availability-metric-icon"><i className="bi bi-grid-3x3-gap" /></span>
                <div><span className="availability-metric-label">Total Slots</span><strong>{summary.total_slots ?? 0}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100 availability-metric-card is-success">
              <div className="card-body">
                <span className="availability-metric-icon"><i className="bi bi-check2-circle" /></span>
                <div><span className="availability-metric-label">Available</span><strong>{summary.total_available ?? 0}</strong></div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card h-100 availability-utilization-card">
              <div className="card-body">
                <div className="availability-utilization-copy">
                  <span>Slot Utilization</span>
                  <strong>{summary.utilization_pct ?? 0}%</strong>
                  <small>{summary.total_slots ?? 0} total slots this month</small>
                </div>
                <Donut
                  value={summary.utilization_pct}
                  max={100}
                  size={90}
                  stroke={9}
                  labelTop={`${summary.utilization_pct ?? 0}%`}
                  labelBottom="Utilization"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Availability donut + status counts */}
        <section className="row availability-overview-section">
          <div className="col-12">
            <div className="card h-100">
              <div className="card-body">
                <div className="availability-section-header">
                  <div>
                    <span className="availability-section-eyebrow">Booking summary</span>
                    <h2>
                    {new Date(year, monthIndex).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                    </h2>
                  </div>
                </div>
                <div className="availability-overview-content">
                  <div className="availability-overview-donut">
                  <Donut
                    value={summary.total_available}
                    max={summary.total_slots || 1}
                    size={112}
                    stroke={10}
                    labelTop={summary.total_available ?? 0}
                    labelBottom="Available"
                  />
                  </div>
                  <div className="availability-status-grid">
                    <div className="availability-status-card is-completed">
                      <span>Completed</span>
                      <strong>{statusCounts.completed}</strong>
                    </div>
                    <div className="availability-status-card is-scheduled">
                      <span>Scheduled</span>
                      <strong>{statusCounts.scheduled}</strong>
                    </div>
                    <div className="availability-status-card is-missed">
                      <span>Missed</span>
                      <strong>{statusCounts.missed}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar grid */}
        <section className="row availability-calendar-section">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="availability-section-header availability-calendar-header">
                  <div>
                    <span className="availability-section-eyebrow">Monthly calendar</span>
                    <h2>
                    {new Date(year, monthIndex).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                    </h2>
                  </div>
                  <div className="availability-calendar-help"><i className="bi bi-hand-index-thumb" /> Select a day to view its slots</div>
                </div>

                <CalendarGrid
                  weeks={weeks}
                  dayMap={dayMap}
                  workingDays={instructor.working_days}
                  onSelect={(iso) => setSelectedISO(iso)}
                />
              </div>
            </div>
          </div>
        </section>

        {selectedDay && (
          <DayDetailDrawer
            day={selectedDay}
            onClose={() => setSelectedISO(null)}
          />
        )}
      </div>
    </>
  );
}

/********************
 * Container (data load & gating)
 ********************/
// export default function InstructorAvailability() {
//   const { instructorId } = useParams(); // route: /instructors/:instructorId/availability
//   const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
//   const dispatch = useDispatch();

//   const [instructorsData, setInstructorsData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchAvail = useCallback(() => {
//     setLoading(true);
//     setError(null);

//     const payload = { mobile_number: instructorId, month: currentMonth };
//     dispatch(
//       getInstructorAvailInformation(payload, (res, err) => {
//         if (err) {
//           setError("Failed to load instructor availability.");
//           setInstructorsData(null);
//           setLoading(false);
//           return;
//         }
//         setInstructorsData(res || null);
//         setLoading(false);
//       })
//     );
//   }, [dispatch, instructorId, currentMonth]);

//   useEffect(() => {
//     fetchAvail();
//   }, [fetchAvail]);

//   if (loading) return <div className="p-3">Loading instructor availability…</div>;
//   if (error) {
//     return (
//       <div className="p-3">
//         <div className="text-danger mb-2">{error}</div>
//         <button className="btn btn-outline-primary btn-sm" onClick={fetchAvail}>
//           Retry
//         </button>
//       </div>
//     );
//   }
//   if (!instructorsData) return <div className="p-3 text-secondary">No data found.</div>;

//   return <InstructorAvailabilityDashboard data={instructorsData} />;
// }

/********************
 * Container (data load & gating) — UPDATED
 ********************/
export default function InstructorAvailability() {
  const { instructorId } = useParams(); // route: /instructors/:instructorId/availability
  const dispatch = useDispatch();

  // current month in YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);

  // NEW: month selector state
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [instructorsData, setInstructorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW: compute last 6 months for dropdown
  const lastSixMonths = useMemo(() => {
    const arr = [];
    const base = new Date(); // today
    for (let i = 0; i < 12; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, "0");
      const value = `${y}-${m}`; // YYYY-MM
      const label = d.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });
      arr.push({ value, label });
    }
    return arr; // [{value:'2025-08',label:'August 2025'}, ...]
  }, []);

  // UPDATED: use selectedMonth in payload
  const fetchAvail = useCallback(() => {
    setLoading(true);
    setError(null);

    const payload = { mobile_number: instructorId, month: selectedMonth };
    dispatch(
      getInstructorAvailInformation(payload, (res, err) => {
        if (err) {
          setError("Failed to load instructor availability.");
          setInstructorsData(null);
          setLoading(false);
          return;
        }
        setInstructorsData(res || null);
        setLoading(false);
      })
    );
  }, [dispatch, instructorId, selectedMonth]);

  useEffect(() => {
    fetchAvail();
  }, []);

  return (
    <div
      className="header-fixed sidebar-fixed sidebar-dark header-light instructor-availability-page"
      id="body"
    >
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <div className="content">
              <div className="row availability-page-heading">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Instructor Availability</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item">
                        <a
                          href="#!"
                          className="availability-breadcrumb-home"
                          aria-label="Instructor availability home"
                        >
                          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                          </svg>
                        </a>
                      </li>
                      <li className="breadcrumb-item">Instructors</li>
                      <li className="breadcrumb-item" aria-current="page">
                        Availability
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-end availability-month-column">
                  {/* NEW: Month selector UI */}
                  <div className="availability-month-control">
                    <label htmlFor="availability-month">
                      <i className="bi bi-calendar3" aria-hidden="true" />
                      Month
                    </label>
                    <select
                      id="availability-month"
                      className="form-select form-select-sm availability-month-select"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        // immediately fetch for the chosen month
                        // note: fetchAvail reads selectedMonth via state; call after state update in next tick
                        // to fetch right away with the new value:
                        const next = e.target.value;
                        const payload = {
                          mobile_number: instructorId,
                          month: next,
                        };
                        setLoading(true);
                        setError(null);
                        dispatch(
                          getInstructorAvailInformation(payload, (res, err) => {
                            if (err) {
                              setError(
                                "Failed to load instructor Schedule."
                              );
                              setInstructorsData(null);
                              setLoading(false);
                              return;
                            }
                            setInstructorsData(res || null);
                            setLoading(false);
                          })
                        );
                      }}
                    >
                      {lastSixMonths.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label} ({m.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dashboard area */}
              {loading ? (
                <div className="card availability-state-card">
                  <div className="card-body">
                    <LoadingState label="Loading instructor availability" />
                  </div>
                </div>
              ) : instructorsData ? (
                <InstructorAvailabilityDashboard data={instructorsData} />
              ) : (
                <div className="card availability-state-card">
                  <div className="card-body">
                    <EmptyState
                      icon={error ? "bi bi-exclamation-circle" : "bi bi-calendar-x"}
                      title={error ? "Unable to load availability" : "No availability found"}
                      description={error || "No instructor availability is configured for this month."}
                      variant={error ? "error" : "default"}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
