import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";

import "./../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AddTrainingSession from "./addTrainingSession";
import RescheduleSession from "./RescheduleSession";

import { getTrainingSessionListInformation, getTrainingSessionFilterListInformation } from "../../store/trainingSession/actions";

//import { getTariffsListInformation } from "../../store/tariff/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentTrainingSessionModal from "./StudentTrainingSession";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


const TrainingSession = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showRModal, setShowRModal] = useState(false);
  const [trainingSessionData, setTrainingSessionData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  //const [tariffsData, setTariffsData] = useState([]);
  const [instructorsData, setInstructorsData] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionStudentData, setSessionStudentData] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  const trainingSessionDataLists = useSelector(
    (state) => state.trainingSessionListInfo.trainingSessionList
  );

  const [searchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") || "";
  const initialYear = searchParams.get("year") || "";

  const today = new Date().toISOString().split("T")[0]; // format: 'YYYY-MM-DD'
  const [filters, setFilters] = useState({
  instructor_id: "",
  start_date: today,
  end_date: today,
  status: "All",
});

  

 const FilterValidationSchema = Yup.object().shape({
  instructor_id: Yup.string().required("Instructor is required"),
  start_date: Yup.date().nullable(),
  end_date: Yup.date().nullable(),
  status: Yup.string().oneOf(["All", "Scheduled", "Completed", "Missed", "Cancelled"]),
});


  const openSessionModal = (session) => {
    setSessionStudentData(session);
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSessionStudentData(null);
  };

  const getTrainingSessionList = () => {
     const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    dispatch(
      getTrainingSessionListInformation({ status: "Scheduled", date: today }, (res) => {
        const trainingSessionList = res || [];
        if (
          Array.isArray(trainingSessionList) &&
          trainingSessionList.length > 0
        ) {
          
          setTrainingSessionData(trainingSessionList);
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
    if (trainingSessionDataLists?.length > 0) {
      setTrainingSessionData(trainingSessionDataLists);
      setError(null);
    } else {
      setTrainingSessionData([]);
      setError("No training session found.");
    }
    setLoading(false);
  }, [trainingSessionDataLists]);

  // const getTariffsList = () => {
  //   dispatch(
  //     getTariffsListInformation({}, (res) => {
  //       const tariffsList = res?.response || [];
  //       setTariffsData(Array.isArray(tariffsList) ? tariffsList : []);
  //     })
  //   );
  // };

  const getInstructorsList = () => {
    dispatch(
      getInstructorsListInformation({}, (res) => {
        const instructorsList = res?.response || [];
        setInstructorsData(
          Array.isArray(instructorsList) ? instructorsList : []
        );
      })
    );
  };

  useEffect(() => {
    
    //getTariffsList();
    getInstructorsList();
    if (initialMonth && initialYear) {
      // dispatch(
      //   getStudentsFilterListInformation(filters, (res) => {
      //     const { response, isError } = res;

      //     if (!isError && Array.isArray(response) && response.length > 0) {
      //       //  setStudentsData(response);
      //       setError(null);
      //     } else {
      //       //  setStudentsData([]);
      //       setError("No students found.");
      //     }
      //     setLoading(false);
      //   })
      // );

      dispatch(getTrainingSessionListInformation(filters, (res) => {
  const trainingSessionList = res || [];
  if (Array.isArray(trainingSessionList) && trainingSessionList.length > 0) {
    setTrainingSessionData(trainingSessionList);
    setError(null);
  } else {
    setTrainingSessionData([]);
    setError("No training session found.");
  }
  setLoading(false);
}));

    } else {
      getTrainingSessionList();
    }
  }, [dispatch]);

  const onStudentData = (res, isEdit) => {
    setSelectedStudent(res.response);
    toast[res.isError ? "error" : "success"](
      res.isError
        ? "Failed....!"
        : isEdit
        ? "Session updated successfully!"
        : "Session added successfully!"
    );
  };

  const onReschduleStudentData = (res, isEdit) => {
    setSelectedStudent(res.response);
    toast[res.isError ? "error" : "success"](
      res.isError
        ? "Failed....!"
        : isEdit
        ? res.response.message
        : "Session added successfully!"
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

  }
  const handleCloseModal = () => {
    setShowModal(false);
    setShowRModal(false);
    setIsEdit(false);
    setSelectedStudent(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

 
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
                <div className="row">
                  <div className="breadcrumb-wrapper col-xl-6">
                    <h1>Training Session</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Training Session</li>
                        <li className="breadcrumb-item" aria-current="page">
                          Training Session List
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <div className="col-xl-6 text-right">
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
      console.log("Submitting with values:", values); 
      dispatch(getTrainingSessionFilterListInformation(values, (res) => {
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
      }));
    }}
  >
  {({ errors, touched }) => (
    <Form>
      <div className="row align-items-end">
        {/* Instructor */}
        <div className="col-md-3">
          <label>Instructor</label>
          <Field
            as="select"
            name="instructor_id"
            className={`form-control ${
              errors.instructor_id && touched.instructor_id ? "is-invalid" : ""
            }`}
          >
            <option value="">--Select--</option>
            {instructorsData.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </Field>
          <div style={{ minHeight: "22px" }}>
            <ErrorMessage
              name="instructor_id"
              component="div"
              className="text-danger"
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="col-md-2">
          <label>Start Date</label>
          <Field type="date" name="start_date" className="form-control" />
          <div style={{ minHeight: "22px" }}></div>
        </div>

        {/* End Date */}
        <div className="col-md-2">
          <label>End Date</label>
          <Field type="date" name="end_date" className="form-control" />
          <div style={{ minHeight: "22px" }}></div>
        </div>

        {/* Status */}
        <div className="col-md-2">
          <label>Status</label>
          <Field as="select" name="status" className="form-control">
            <option value="All">All</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Cancelled">Cancelled</option>
          </Field>
          <div style={{ minHeight: "22px" }}></div>
        </div>

        {/* Apply Button */}
        <div className="col-md-2 align-items-end">
          <button type="submit" className="btn btn-primary w-100">
            Apply
          </button>
          <div style={{ minHeight: "22px" }}></div>
        </div>
      </div>
    </Form>
  )}
</Formik>

  </div>
)}


                {/* Training session List */}
                <div className="container py-0 p-0">
                  {loading ? (
                    <p className="text-center my-5">
                      Loading training session...
                    </p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="table-responsive">
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
                              <td>{index+1}</td>
                              <td>{tsession.student_name || "Student Name"}</td>
                              <td>{tsession.instructor_name || "Instructor Name"}</td>
                              <td>{tsession.date || "N/A"}</td>
                              <td>{tsession.actual_progress || "N/A"}</td>
                              <td className="status"><i className="bi bi-check-circle"></i>{" "} {tsession.status}</td>
                              <td>
                                <button className="btn btn-primary btn-sm action-btn" onClick={() => openSessionModal(tsession)}>
                                  View
                                </button>
                                <button
                                  className="btn btn-sm btn-warning action-btn"
                                  title="Edit Training Session"
                                  onClick={() => handleEditStudent(tsession)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                 <button
                                  className="btn btn-sm btn-warning"
                                  title="Reschedule Session"
                                  onClick={() => handleRescheduleSession(tsession)}
                                >
                                  <i className="bi bi-clock-history"></i>
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
             // plans={tariffsData}
             // instructors={instructorsData}
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
