import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Instructors.css";

import { getInstructorAvailInformation } from "../../store/instructors/actions"; // <-- adjust path
import Sidebar from "../../components/Sidebar"; // <-- adjust path
import Header from "../../components/Header"; // <-- adjust path
import Footer from "../../components/Footer"; // <-- adjust path

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
function CalendarGrid({ weeks, dayMap, onSelect }) {
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
            const isSunday = cell.getDay() === 0;

            const totalCount =
              (d?.available_slots?.length || 0) +
              (d?.booked_slots?.length || 0);
            const bookedCount = d?.booked_slots?.length || 0;

            // tint by utilization (Bootstrap-only colors)
            let tint = "";
            if (!isSunday) {
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
                  isSunday && "calendar__cell--sunday"
                )}
                onClick={() => !isSunday && onSelect?.(iso)}
                disabled={isSunday}
                aria-label={iso}
              >
                <div className="calendar__celltop">
                  <div className="calendar__date">{cell.getDate()}</div>
                  {d?.is_sunday && (
                    <span className="calendar__sunday">Sunday</span>
                  )}
                </div>

                <div className="calendar__counts">
                  <div>
                    Avail:{" "}
                    <span className="fw-semibold text-success">
                      {d?.available_slots?.length || 0}
                    </span>
                  </div>
                  <div>
                    Booked:{" "}
                    <span className="fw-semibold text-primary">
                      {d?.booked_slots?.length || 0}
                    </span>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className="progress mt-2" style={{ height: 6 }}>
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
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div
        className="modal-dialog modal-dialog-slideout modal-lg"
        role="document"
        style={{ zIndex: "99999999" }}
      >
        <div className="modal-content" style={{ zIndex: "99999999" }}>
          <div className="modal-header">
            <h5 className="modal-title">
              {new Date(day.date).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            {day.window && (
              <div className="mb-3 small text-secondary">
                Window: {day.window.from} – {day.window.to} ·{" "}
                {day.window.slot_minutes}m/slot
              </div>
            )}

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="fw-semibold mb-2">Available Slots</div>
                <div className="d-flex flex-wrap gap-2">
                  {available.length ? (
                    available.map((t) => (
                      <span
                        key={t}
                        className="badge rounded-pill text-bg-success"
                      >
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
                <div className="fw-semibold mb-2">Booked Slots</div>
                <div className="d-flex flex-column gap-2">
                  {booked.length ? (
                    booked.map((b) => (
                      <div
                        key={b.id}
                        className="d-flex align-items-center justify-content-between border rounded p-2"
                      >
                        <div>
                          <div className="fw-medium">
                            {formatTimeLabel(b.time)}
                          </div>
                          <div className="small text-secondary">
                            {b.student}
                          </div>
                        </div>
                        <span
                          className={clsx(
                            "badge border",
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
              <div className="mt-3 small text-secondary">Note: {day.note}</div>
            )}
          </div>

          <div className="modal-footer">
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
      <div className="modal-backdrop show" onClick={onClose}></div>
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
      <div>
        {/* Header section */}
        <section className="mb-4">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-md-between">
            <div className="d-flex align-items-center gap-3">
              {/* <div
                          className="rounded-circle bg-light d-grid place-items-center"
                          style={{ width: 56, height: 56, display: "grid" }}
                        >
                          <span className="text-secondary fw-semibold">
                            {instructor?.name?.charAt(0) || "?"}
                          </span>
                        </div> */}
              <div>
                <h1 className="h4 m-0">{instructor?.name}</h1>
                <div className="small text-secondary mt-1 d-flex flex-wrap gap-3">
                  <span>📞 {instructor?.mobile_number}</span>
                  <span>✉️ {instructor?.email}</span>
                  <span>
                    ⏰ {instructor?.available_from} – {instructor?.available_to}
                  </span>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                className={clsx(
                  "badge rounded-pill px-3 py-2",
                  instructor?.is_active
                    ? "text-bg-success"
                    : "text-bg-secondary"
                )}
              >
                {instructor?.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
              <div className="d-none d-sm-flex align-items-center gap-3 small text-secondary">
                <span className="badge rounded-pill text-bg-success">
                  Available
                </span>
                <span className="badge rounded-pill text-bg-primary">
                  Scheduled
                </span>
                <span className="badge rounded-pill text-bg-success">
                  Completed
                </span>
                <span className="badge rounded-pill text-bg-danger">
                  Missed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small">Working Days</div>
                <div className="display-6 fw-semibold">
                  {summary.working_days}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small">Daily Slots</div>
                <div className="display-6 fw-semibold">
                  {summary.daily_slot_count}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small">Total Slots</div>
                <div className="display-6 fw-semibold">
                  {summary.total_slots}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small">Total Available</div>
                <div className="display-6 fw-semibold">
                  {summary.total_available}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-body d-flex justify-content-center align-items-center">
                <Donut
                  value={summary.utilization_pct}
                  max={100}
                  labelTop={`${summary.utilization_pct ?? 0}%`}
                  labelBottom="Utilization"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Availability donut + status counts */}
        <section className="row g-4">
          <div className="col-12">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h2 className="h6 m-0">
                    {new Date(year, monthIndex).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                </div>
                <div className="d-flex justify-content-center">
                  <Donut
                    value={summary.total_available}
                    max={summary.total_slots || 1}
                    labelTop={summary.total_available ?? 0}
                    labelBottom="Available"
                  />
                </div>
                <div className="row row-cols-3 g-2 text-center mt-3">
                  <div className="col">
                    <div className="p-2 rounded bg-success-subtle text-success fw-semibold">
                      {statusCounts.completed}
                      <div className="small fw-normal text-secondary">
                        Completed
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-2 rounded bg-primary-subtle text-primary fw-semibold">
                      {statusCounts.scheduled}
                      <div className="small fw-normal text-secondary">
                        Scheduled
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="p-2 rounded bg-danger-subtle text-danger fw-semibold">
                      {statusCounts.missed}
                      <div className="small fw-normal text-secondary">
                        Missed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar grid */}
        <section className="row g-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h2 className="h6 m-0">
                    {new Date(year, monthIndex).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <div className="small text-secondary">{summary.month}</div>
                </div>

                <CalendarGrid
                  weeks={weeks}
                  dayMap={dayMap}
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
      className="header-fixed sidebar-fixed sidebar-dark header-light"
      id="body"
    >
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <div className="content">
              <div className="row">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Instructor</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item">
                        <a href="#!" aria-label="home">
                          <span className="mdi mdi-home"></span>
                        </a>
                      </li>
                      <li className="breadcrumb-item">Instructor</li>
                      <li className="breadcrumb-item" aria-current="page">
                        Instructor Schedule
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-end">
                  {/* NEW: Month selector UI */}
                  <div className="d-flex align-items-center justify-content-end mb-3">
                    <label className="me-2 text-secondary small mb-0">
                      Month
                    </label>
                    <select
                      className="form-select form-select-sm"
                      style={{ maxWidth: 240 }}
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
                <div className="card">
                  <div className="card-body py-5 text-center text-secondary">
                    Loading instructor availability…
                  </div>
                </div>
              ) : instructorsData ? (
                <InstructorAvailabilityDashboard data={instructorsData} />
              ) : (
                <div className="card">
                  <div className="card-body py-5 text-center text-muted">
                    No data found.
                  </div>
                </div>
              )}

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
