// src/pages/FleetExpenses/FleetExpenses.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AddFleetExpenses from "./addFleetExpenses";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";

import { getExpensesListInformation, deleteExpenses } from "../../store/expenses/actions";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const FleetExpenses = () => {
  const dispatch = useDispatch();

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState(null);

  // Data state
  const [expensesDatas, setExpensesDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpensesAppId, setSelectedExpensesAppId] = useState(null);

  // Month options (last 12 months)
  const monthOptions = useMemo(() => {
    const opts = [{ label: "All months", value: "" }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "long", year: "numeric" });
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({ label, value });
    }
    return opts;
  }, []);

  const getExpensesList = (opts = {}) => {
    setLoading(true);
    setError(null);
    const data = {};
    // if your backend supports server-side month filtering, you can pass: if (opts.month) data.month = opts.month;
    dispatch(
      getExpensesListInformation(data, (res) => {
        const list = res?.response || [];
        if (Array.isArray(list) && list.length > 0) {
          setExpensesDatas(list);
          setError(null);
        } else {
          setExpensesDatas([]);
          setError("No Expenses found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    getExpensesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleEditExpenses = (expense) => {
    setSelectedExpenses(expense);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedExpenses(null);
  };

  /**
   * onExpensesData
   * Called by the Add/Edit modal after a successful add/update.
   * Merge returned item into local state or replace list if server sent full list.
   */
  const onExpensesData = (res, wasEdit) => {
    const returned = res?.response || res?.data || res;

    if (res?.isError) {
      toast.error("Operation failed!");
      return;
    }

    if (Array.isArray(returned)) {
      setExpensesDatas(returned);
    } else if (returned && typeof returned === "object") {
      setExpensesDatas((prev) => {
        const idx = prev.findIndex((p) => p.id === returned.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...returned };
          return copy;
        } else {
          return [returned, ...prev];
        }
      });
    } else {
      getExpensesList({ month: selectedMonth });
    }

    toast.success(wasEdit ? "Expense updated successfully!" : "Expense added successfully!");
    handleCloseModal();
  };

  // Category list from server data
  const categories = useMemo(() => {
    const set = new Set();
    expensesDatas.forEach((r) => r.category && set.add(r.category));
    return ["All", ...Array.from(set)];
  }, [expensesDatas]);

  // Apply month -> category -> search filters (client-side)
  const filteredByMonth = useMemo(() => {
    if (!selectedMonth) return expensesDatas;
    return expensesDatas.filter((r) => {
      const dateStr = (r.date || r.created_at || "").toString();
      return dateStr.startsWith(selectedMonth);
    });
  }, [expensesDatas, selectedMonth]);

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === "All") return filteredByMonth;
    return filteredByMonth.filter((r) => r.category === selectedCategory);
  }, [filteredByMonth, selectedCategory]);

  const filteredRecords = useMemo(() => {
    const q = (searchText || "").trim().toLowerCase();
    if (!q) return filteredByCategory;
    return filteredByCategory.filter((r) => {
      const match =
        (r.category || "").toString().toLowerCase().includes(q) ||
        (r.notes || "").toString().toLowerCase().includes(q) ||
        (r.vendor || "").toString().toLowerCase().includes(q) ||
        (r.odo_meter || r.odoMeter || "").toString().toLowerCase().includes(q) ||
        (r.created_by || r.createdBy || "").toString().toLowerCase().includes(q) ||
        (r.amount || "").toString().toLowerCase().includes(q);
      return match;
    });
  }, [filteredByCategory, searchText]);

  // KPIs: totalSpend, distanceDriven, costPerKm, perMonth
  const totalSpend = filteredRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  // Compute month key to calculate per-month spend:
  // - if user selected a month, use that
  // - otherwise use current month
  const now = new Date();
  const defaultMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthKeyToCompute = selectedMonth || defaultMonthKey;

  const monthlySpend = filteredRecords.reduce((sum, r) => {
    const dateStr = (r.date || r.created_at || "").toString();
    if (!dateStr) return sum;
    // normalize date to YYYY-MM
    const dt = new Date(dateStr);
    if (isNaN(dt)) return sum;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (key === monthKeyToCompute) {
      return sum + (Number(r.amount) || 0);
    }
    return sum;
  }, 0);

  const perMonth = monthlySpend; // month spend (current or selected)
  
  // Collect odometer readings robustly and compute distance (max - min)
  const odometerNumbers = filteredRecords
    .map((r) => {
      const raw = r.odo_meter ?? r.odoMeter ?? r.odometer ?? "";
      if (raw === null || raw === undefined || raw === "") return null;
      const cleaned = String(raw).replace(/,/g, "").trim();
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  let numericDistance = 0;
  let distanceDriven = "—";
  if (odometerNumbers.length >= 2) {
    const minOdo = odometerNumbers[0];
    const maxOdo = odometerNumbers[odometerNumbers.length - 1];
    numericDistance = Math.max(0, maxOdo - minOdo);
    distanceDriven = `${numericDistance.toLocaleString("en-IN")} km`;
  } else {
    distanceDriven = "—";
    numericDistance = 0;
  }

  const costPerKm = numericDistance > 0 ? `₹${(totalSpend / numericDistance).toFixed(2)}` : "—";

  // Charts helpers
  const getCategoryAggregation = (items) => {
    const categoriesList = ["Fuel", "Service", "Insurance", "Tax", "Toll", "Repairs", "Wash", "Other"];
    const map = categoriesList.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
    items.forEach((r) => {
      const cat = r.category || "Other";
      map[cat] = (map[cat] || 0) + (Number(r.amount) || 0);
    });
    return { labels: categoriesList, values: categoriesList.map((c) => map[c]) };
  };

  const getMonthlyAggregation = (items, monthsBack = 6) => {
    const nowLocal = new Date();
    const months = [];
    const sums = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(nowLocal.getFullYear(), nowLocal.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      months.push(label);
      sums.push(0);
    }
    items.forEach((r) => {
      const dt = new Date(r.date || r.created_at);
      if (isNaN(dt)) return;
      const label = dt.toLocaleString("default", { month: "short" });
      const idx = months.indexOf(label);
      if (idx >= 0) sums[idx] += Number(r.amount) || 0;
    });
    return { labels: months, values: sums };
  };

  const getEfficiencySeries = (items, monthsBack = 6) => {
    const nowLocal = new Date();
    const labels = [];
    const values = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(nowLocal.getFullYear(), nowLocal.getMonth() - i, 1);
      labels.push(d.toLocaleString("default", { month: "short" }));
      values.push(+(3 + Math.random() * 0.8).toFixed(2));
    }
    return { labels, values };
  };

  const categoryAgg = useMemo(() => getCategoryAggregation(filteredRecords), [filteredRecords]);
  const monthlyAgg = useMemo(() => getMonthlyAggregation(filteredRecords), [filteredRecords]);
  const efficiencySeries = useMemo(() => getEfficiencySeries(filteredRecords), [filteredRecords]);

  const efficiencyRef = useRef(null);
  const pieRef = useRef(null);
  const monthlyRef = useRef(null);
  const categoryRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      layout: { padding: { top: 6, left: 6, right: 6, bottom: 6 } },
      animation: { duration: 800, easing: "easeOutCubic" },
      scales: { y: { beginAtZero: true } },
    };

    if (efficiencyRef.current) {
      chartsRef.current.efficiency?.destroy();
      chartsRef.current.efficiency = new Chart(efficiencyRef.current, {
        type: "bar",
        data: { labels: efficiencySeries.labels, datasets: [{ data: efficiencySeries.values, borderRadius: 6, barThickness: 20 }] },
        options: { ...baseOptions, scales: { y: { suggestedMax: 6 } } },
      });
    }

    if (pieRef.current) {
      chartsRef.current.pie?.destroy();
      chartsRef.current.pie = new Chart(pieRef.current, {
        type: "pie",
        data: { labels: categoryAgg.labels, datasets: [{ data: categoryAgg.values }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } },
      });
    }

    if (monthlyRef.current) {
      chartsRef.current.monthly?.destroy();
      chartsRef.current.monthly = new Chart(monthlyRef.current, {
        type: "line",
        data: {
          labels: monthlyAgg.labels,
          datasets: [
            {
              label: "Monthly Spend (₹)",
              data: monthlyAgg.values,
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              backgroundColor: "rgba(11,94,215,0.08)",
              borderColor: "rgba(11,94,215,1)",
              pointRadius: 3,
            },
          ],
        },
        options: baseOptions,
      });
    }

    if (categoryRef.current) {
      chartsRef.current.category?.destroy();
      chartsRef.current.category = new Chart(categoryRef.current, {
        type: "bar",
        data: { labels: categoryAgg.labels, datasets: [{ data: categoryAgg.values, borderRadius: 6, barThickness: 18 }] },
        options: baseOptions,
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((c) => c?.destroy());
    };
  }, [categoryAgg, monthlyAgg, efficiencySeries]);

  const styles = {
    pageCard: { borderRadius: 18, background: "#fff", padding: 24, boxShadow: "0 6px 20px rgba(29,39,61,0.06)", marginTop: 16 },
    chartTall: { height: 260, borderRadius: 12, border: "1px solid #eef2f6", padding: 16, position: "relative" },
    pieBox: { width: "100%", height: 280, borderRadius: 12, border: "1px solid #eef2f6", padding: 16, position: "relative" },
  };

  // if (loading) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
  //       <div className="spinner-border text-primary" role="status" />
  //     </div>
  //   );
  // }

  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
    setSelectedExpensesAppId(null);
  };

  // show delete modal and keep id to delete after confirmation
  const handleDelete = (id) => {
    setShowDeleteModal(true);
    setSelectedExpensesAppId(id);
  };

  // deleteData: call delete action, then remove from local state (no full refetch)
  const deleteData = (appId) => {
    const payloadDeleteExpenses = { id: appId };

    dispatch(
      deleteExpenses(payloadDeleteExpenses, (res) => {
        if (res?.isError) {
          toast.error("Delete failed");
          handleDeleteCloseModel();
          return;
        }

        // Remove locally
        setExpensesDatas((prev) => prev.filter((p) => p.id !== appId));

        handleDeleteCloseModel();
        toast.success("Expense deleted successfully.");
      })
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
                    <h1>Expenses</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item"><a href="#"><span className="mdi mdi-home" /></a></li>
                        <li className="breadcrumb-item">Expenses</li>
                        <li className="breadcrumb-item" aria-current="page">Expenses Dashboard</li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    <button className="mb-1 btn btn-primary mr-2" onClick={() => { setIsEdit(false); setSelectedExpenses(null); setShowModal(true); }}>
                      <i className="bi bi-plus-lg" /> Add Expense
                    </button>
                  </div>
                </div>

                <div style={styles.pageCard}>
                  {/* Filters */}
                  <div className="row align-items-center mb-3 g-2">
                    <div className="col-auto">
                      <select className="form-select" value={selectedMonth} onChange={(e) => { const v = e.target.value; setSelectedMonth(v); /* optionally call getExpensesList({ month: v }) */ }}>
                        {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>

                    <div className="col-auto">
                      <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
                      </select>
                    </div>

                    <div className="col">
                      <input className="form-control" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="row g-3 mb-3">
                    {[ { label: "Total Spend", value: `₹${totalSpend.toLocaleString("en-IN")}` },
                       { label: "Distance Driven", value: distanceDriven },
                       { label: "Cost per Kilometer", value: costPerKm },
                       { label: "Month", value: `₹${perMonth.toLocaleString("en-IN")}` } ].map((k, i) => (
                      <div className="col-6 col-md-3" key={i}>
                        <div style={{ borderRadius: 12, padding: 18, border: "1px solid #eef2f6", textAlign: "center" }}>
                          <div style={{ color: "#6c757d", fontSize: 14 }}>{k.label}</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{k.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="row g-3 mb-3">
                    <div className="col-lg-8 d-flex">
                      <div style={{ flex: 1, ...styles.chartTall }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Fuel Efficiency (km/L)</div>
                        <canvas ref={efficiencyRef} style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>

                    <div className="col-lg-4 d-flex">
                      <div style={styles.pieBox}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Category Share</div>
                        <canvas ref={pieRef} style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>

                    <div className="col-12 d-flex gap-3 flex-wrap">
                      <div style={{ flex: "1 1 48%", minWidth: 260, ...styles.chartTall }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Monthly Spend</div>
                        <canvas ref={monthlyRef} style={{ width: "100%", height: "100%" }} />
                      </div>

                      <div style={{ flex: "1 1 48%", minWidth: 260, ...styles.chartTall }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Category Breakdown</div>
                        <canvas ref={categoryRef} style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ borderRadius: 12, border: "1px solid #eef2f6", overflow: "hidden" }}>
                    <div style={{ padding: 16, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ fontWeight: 600 }}>Recent Expenses</div>
                    </div>

                    <div className="table-responsive">
                      <table className="table custom-table text-center align-middle" style={{ minWidth: 900 }}>
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Odometer</th>
                            <th>Amount</th>
                            <th>Vendor</th>
                            <th>Notes</th>
                            <th>Created By</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((r) => (
                              <tr key={r.id}>
                                <td>{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "-"}</td>
                                <td>{r.category || "-"}</td>
                                <td>{r.odo_meter || r.odoMeter || "-"}</td>
                                <td>₹{Number(r.amount || 0).toLocaleString("en-IN")}</td>
                                <td>{r.vendor || "-"}</td>
                                <td>{r.notes || "-"}</td>
                                <td>{r.created_by || r.createdBy || "-"}</td>
                                <td className="text-end">
                                  <button className="btn btn-sm btn-warning" onClick={() => handleEditExpenses(r)} title="Edit Expense">Edit</button>{" "}
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)} title="Delete Expense">Delete</button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center text-muted">{error || "No expenses found."}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AddFleetExpenses
              showModal={showModal}
              hideModal={handleCloseModal}
              expense={selectedExpenses}
              isEdit={isEdit}
              onExpensesAdded={() => {}}
              expensesData={onExpensesData}
            />
            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedExpensesAppId}
              message={"Are you sure want to delete this expenses?"}
            />

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeButton={false} closeOnClick pauseOnHover />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default FleetExpenses;
