import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AddFleetExpenses from "./addFleetExpenses";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const FleetExpenses = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);

  // Redux data (fallback to mock)
  const reduxExpenses = useSelector((state) => state.fleet?.expenses || null);

  // Mock fallback
  const mockRecords = useMemo(
    () => [
      { id: 1, date: "2025-01-02", category: "Fuel", odometer: "52,340", amount: 2300, location: "Shell", notes: "Full tank" },
      { id: 2, date: "2025-01-10", category: "Service", odometer: "52,700", amount: 1500, location: "Auto Care", notes: "Oil change" },
      { id: 3, date: "2025-02-01", category: "Insurance", odometer: "53,000", amount: 4000, location: "ICICI", notes: "Renewal" },
      { id: 4, date: "2025-02-10", category: "Tax", odometer: "53,200", amount: 3000, location: "RTO Office", notes: "Road tax" },
      { id: 5, date: "2025-02-20", category: "Toll", odometer: "53,500", amount: 500, location: "NH44", notes: "Toll payment" },
      { id: 6, date: "2025-03-02", category: "Repairs", odometer: "54,000", amount: 2500, location: "City Garage", notes: "Brake replacement" },
      { id: 7, date: "2025-03-10", category: "Wash", odometer: "54,300", amount: 400, location: "Quick Wash", notes: "Exterior + Interior" },
      { id: 8, date: "2025-03-15", category: "Fuel", odometer: "54,500", amount: 2100, location: "HP Petrol", notes: "Fuel top-up" },
      { id: 9, date: "2025-03-20", category: "Other", odometer: "54,700", amount: 900, location: "Cafe Stop", notes: "Snacks" },
    ],
    []
  );

  const records = Array.isArray(reduxExpenses) && reduxExpenses.length ? reduxExpenses : mockRecords;

  // Category Filter
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(() => {
    const set = new Set();
    records.forEach((r) => r.category && set.add(r.category));
    return ["All", ...Array.from(set)];
  }, [records]);
  const filteredRecords = useMemo(() => {
    if (selectedCategory === "All") return records;
    return records.filter((r) => r.category === selectedCategory);
  }, [records, selectedCategory]);

  // KPIs
  const totalSpend = filteredRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const distanceDriven = "2,400 km";
  const costPerKm = (totalSpend / 2400).toFixed(2);
  const perMonth = Math.round(totalSpend / 3);

  // Chart refs
  const efficiencyRef = useRef(null);
  const pieRef = useRef(null);
  const monthlyRef = useRef(null);
  const categoryRef = useRef(null);
  const chartsRef = useRef({});

  const efficiencyContainerRef = useRef(null);
  const pieContainerRef = useRef(null);
  const monthlyContainerRef = useRef(null);
  const categoryContainerRef = useRef(null);

  // Helpers
  const getCategoryAggregation = (items) => {
    const categories = ["Fuel", "Service", "Insurance", "Tax", "Toll", "Repairs", "Wash", "Other"];
    const map = categories.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
    items.forEach((r) => (map[r.category] = (map[r.category] || 0) + (Number(r.amount) || 0)));
    return { labels: categories, values: categories.map((c) => map[c]) };
  };

  const getMonthlyAggregation = (items, monthsBack = 6) => {
    const now = new Date();
    const months = [];
    const sums = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      months.push(label);
      sums.push(0);
    }
    items.forEach((r) => {
      const dt = new Date(r.date);
      if (isNaN(dt)) return;
      const label = dt.toLocaleString("default", { month: "short" });
      const idx = months.indexOf(label);
      if (idx >= 0) sums[idx] += Number(r.amount) || 0;
    });
    return { labels: months, values: sums };
  };

  const getEfficiencySeries = (items, monthsBack = 6) => {
    const now = new Date();
    const labels = [];
    const values = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString("default", { month: "short" }));
      values.push(+(3 + Math.random() * 0.8).toFixed(2));
    }
    return { labels, values };
  };

  const categoryAgg = useMemo(() => getCategoryAggregation(filteredRecords), [filteredRecords]);
  const monthlyAgg = useMemo(() => getMonthlyAggregation(filteredRecords), [filteredRecords]);
  const efficiencySeries = useMemo(() => getEfficiencySeries(filteredRecords), [filteredRecords]);

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

  // Styles
  const styles = {
    pageCard: { borderRadius: 18, background: "#fff", padding: 24, boxShadow: "0 6px 20px rgba(29,39,61,0.06)", marginTop: 16 },
    chartTall: { height: 260, borderRadius: 12, border: "1px solid #eef2f6", padding: 16, position: "relative" },
    pieBox: { width: "100%", height: 280, borderRadius: 12, border: "1px solid #eef2f6", padding: 16, position: "relative" },
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
                    <h1>Fleet Expenses</h1>
                  </div>
                  <div className="col-xl-6 text-right">
                    <button className="mb-1 btn btn-secondary mr-2"><i className="bi bi-funnel" /> Filter</button>
                    <button className="mb-1 btn btn-primary mr-2" onClick={() => setShowModal(true)}><i className="bi bi-plus-lg" /> Add Fleet Expense</button>
                  </div>
                </div>

                <div style={styles.pageCard}>
                  {/* Filters */}
                  <div className="row align-items-center mb-3">
                    <div className="col-auto"><select className="form-select"><option>March 2025</option><option>February 2025</option></select></div>
                    <div className="col-auto">
                      <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col"><input className="form-control" placeholder="Search" /></div>
                  </div>

                  {/* KPIs */}
                  <div className="row g-3 mb-3">
                    {[
                      { label: "Total Spend", value: `₹${totalSpend.toLocaleString("en-IN")}` },
                      { label: "Distance Driven", value: distanceDriven },
                      { label: "Cost per Kilometer", value: `₹${costPerKm}` },
                      { label: "Per Month", value: `₹${perMonth.toLocaleString("en-IN")}` },
                    ].map((k, i) => (
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
                      <div ref={efficiencyContainerRef} style={{ flex: 1, ...styles.chartTall }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Fuel Efficiency (km/L)</div>
                        <canvas ref={efficiencyRef} style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>

                    <div className="col-lg-4 d-flex">
                      <div ref={pieContainerRef} style={styles.pieBox}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Category Share</div>
                        <canvas ref={pieRef} style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>

                    <div className="col-12 d-flex gap-3 flex-wrap">
                      <div ref={monthlyContainerRef} style={{ flex: "1 1 48%", minWidth: 260, ...styles.chartTall }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Monthly Spend</div>
                        <canvas ref={monthlyRef} style={{ width: "100%", height: "100%" }} />
                      </div>

                      <div ref={categoryContainerRef} style={{ flex: "1 1 48%", minWidth: 260, ...styles.chartTall }}>
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
                      <table className="table table-borderless mb-0" style={{ minWidth: 900 }}>
                        <thead>
                          <tr>
                            <th>Date</th><th>Category</th><th>Odometer</th><th>Amount</th><th>Location</th><th>Notes</th><th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.map((r) => (
                            <tr key={r.id}>
                              <td>{new Date(r.date).toLocaleDateString("en-IN")}</td>
                              <td>{r.category}</td>
                              <td>{r.odometer}</td>
                              <td>₹{r.amount.toLocaleString("en-IN")}</td>
                              <td>{r.location}</td>
                              <td>{r.notes}</td>
                              <td className="text-end">
                                <a href="#" className="me-2">Edit</a>
                                <button className="btn btn-sm btn-outline-danger">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AddFleetExpenses showModal={showModal} hideModal={handleCloseModal} />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default FleetExpenses;
