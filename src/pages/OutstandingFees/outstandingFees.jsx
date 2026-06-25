import React, { useEffect, useState } from "react";
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

import { getOutstandingFees } from "../../store/dashboardSummary/actions";


import avatar from "../../assets/img/avatar.png";
import Pagination from "../Students/Pagenation";

import { useAuth } from "../../hooks/useAuth";

const OutstandingFees = () => {
  const { role } = useAuth();

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
    

  const getOutstandingFeesList = () => {
  const data = {
    page: currentPage,
    limit: pageSize,
  };

  dispatch(
    getOutstandingFees(data, (res) => {
      const response = res?.response || {};
      const students = response?.students || [];

      setTotalCount(response.total_count || 0);

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
                    <div className="table-responsive">
                      <table className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th>
                            <th>Name</th>
                            <th>Mobile Number</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Full Payment Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((outstandingFees, index) => (
                            <tr key={index}>
                              <td>{startIndex + index + 1}</td>
                              <td>{outstandingFees?.name || "Name"}</td>
                              <td>{outstandingFees?.mobile_number || 0}</td>
                              <td>{outstandingFees?.balance || "N/A"}</td>
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
