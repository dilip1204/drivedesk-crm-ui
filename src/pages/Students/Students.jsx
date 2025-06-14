import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";

import "./Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import AddStudents from "./addStudents";
import {
  getStudentsListInformation,
  getStudentsFilterListInformation,
} from "../../store/students/actions";
import { getTariffsListInformation } from "../../store/tariff/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";
import { deleteStudent } from "../../store/deleteStudent/actions";
import avatar from "../../assets/img/avatar.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentProfileModal from "./StudentProfile";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Students = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentAppId, setSelectedStudentAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tariffsData, setTariffsData] = useState([]);
  const [instructorsData, setInstructorsData] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStudentData, setProfileStudentData] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);


  const [searchParams] = useSearchParams();
const initialMonth = searchParams.get("month") || "";
const initialYear = searchParams.get("year") || "";

const [filters, setFilters] = useState({
  month: initialMonth,
  year: initialYear,
  status: "",
  instructor_mobile: "",
  test_scheduled: false,
});
  // const [filters, setFilters] = useState({
  //   month: "",
  //   year: "",
  //   status: "",
  //   instructor_mobile: "",
  //   test_scheduled: "",
  // });

  const FilterValidationSchema = Yup.object().shape({
    month: Yup.number()
      .typeError("Month must be a number")
      .min(1, "Min value is 1")
      .max(12, "Max value is 12")
      .required("Month is required"),
    year: Yup.number()
      .typeError("Year must be a number")
      .min(2000, "Min value is 2000")
      .max(2100, "Max value is 2100")
      .required("Year is required"),
    status: Yup.string()
      .oneOf(["pending", "completed"], "Invalid status")
      .required("Status is required"),
    instructor_mobile: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Invalid mobile number")
      .required("Instructor mobile is required"),
    test_scheduled: Yup.string()
      .oneOf(["true", "false"], "Must be Yes or No")
      .required("Test scheduled is required"),
  });

  const openProfileModal = (student) => {
    setProfileStudentData(student);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileStudentData(null);
  };

  const getStudentsList = () => {
    dispatch(
      getStudentsListInformation({}, (res) => {
        const studentList = res?.response || [];
        if (Array.isArray(studentList) && studentList.length > 0) {
          setStudentsData(studentList);
        } else {
          setStudentsData([]);
          setError("No students found.");
        }
        setLoading(false);
      })
    );
  };

  const getTariffsList = () => {
    dispatch(
      getTariffsListInformation({}, (res) => {
        const tariffsList = res?.response || [];
        setTariffsData(Array.isArray(tariffsList) ? tariffsList : []);
      })
    );
  };

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
   // getStudentsList();
    getTariffsList();
    getInstructorsList();
    if (initialMonth && initialYear) {
    dispatch(
      getStudentsFilterListInformation(filters, (res) => {
        const { response, isError } = res;
        
        if (!isError && Array.isArray(response) && response.length > 0) {
          setStudentsData(response);
          setError(null);
        } else { 
          setStudentsData([]);
          setError("No students found.");
        }
        setLoading(false);
      })
    );
  } else {
    getStudentsList();
  }
  }, [dispatch]);

  const onStudentData = (res, isEdit) => {
    toast[res.isError ? "error" : "success"](
      res.isError
        ? "Failed....!"
        : isEdit
        ? "Student updated successfully!"
        : "Student added successfully!"
    );
  };

  const handleDeleteCloseModel = () => setShowDeleteModal(false);

  const deleteData = (appId) => {
    dispatch(
      deleteStudent({ appId }, (res) => {
        handleDeleteCloseModel();
        getStudentsList();
        toast.success("Student deleted successfully.....");
      })
    );
  };

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedStudentAppId(appId);
  };

  const AddStudentsModal = () => setShowModal(true);

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedStudent(null);
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
                    <h1>Students</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Students</li>
                        <li className="breadcrumb-item" aria-current="page">
                          StudentList
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <div className="col-xl-6 text-right">
                    <button
                      type="button"
                      className="mb-1 btn btn-secondary mr-2"
                      onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button
                      type="button"
                      className="mb-1 btn btn-primary"
                      onClick={AddStudentsModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Students
                    </button>
                  </div>
                </div>

                {filtersVisible && (
                  <div className="card p-3 mb-4">
                    <Formik
                      initialValues={filters}
                      validationSchema={FilterValidationSchema}
                      onSubmit={(values) => {
                        dispatch(
                          getStudentsFilterListInformation(values, (res) => {
                            const { response, isError } = res;

                            if (isError && Array.isArray(response)) {
                              response.forEach((err) => {
                                const field = err?.loc?.[1] || "Field";
                                const message = err?.msg || "Invalid input";
                                toast.error(`${field}: ${message}`);
                              });
                              return;
                            }

                            const studentLists = response || [];
                            if (
                              Array.isArray(studentLists) &&
                              studentLists.length > 0
                            ) {
                              setStudentsData(studentLists);
                              setError(null);
                            } else {
                              setStudentsData([]);
                              setError("No students found.");
                            }
                            setLoading(false);
                          })
                        );
                      }}
                    >
                      {({ handleSubmit }) => (
                        <Form onSubmit={handleSubmit}>
                          <div className="row">
                            <div className="col-md-2">
                              <label>Month</label>
                              <Field
                                type="number"
                                name="month"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="month"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Year</label>
                              <Field
                                type="number"
                                name="year"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="year"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Status</label>
                              <Field
                                as="select"
                                name="status"
                                className="form-control"
                              >
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                              </Field>
                              <ErrorMessage
                                name="status"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-3">
                              <label>Instructor Mobile</label>
                              <Field
                                type="text"
                                name="instructor_mobile"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="instructor_mobile"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Test Scheduled</label>
                              <Field
                                as="select"
                                name="test_scheduled"
                                className="form-control"
                              >
                                <option value="">All</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </Field>
                              <ErrorMessage
                                name="test_scheduled"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="submit"
                                className="btn btn-primary w-100"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                )}

                {/* Student List */}
                <div className="container py-0 p-0">
                  {loading ? (
                    <p className="text-center my-5">Loading students...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="row g-4">
                      {studentsData.map((student, index) => (
                        <div
                          className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-3"
                          key={index}
                        >
                          <div className="student-card position-relative">
                            <div
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                              }}
                            >
                              <button
                                className="btn btn-sm btn-warning"
                                title="Edit Student"
                                onClick={() => handleEditStudent(student)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                title="Delete Student"
                                onClick={() =>
                                  deleteUser(student.application_number)
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                            <div>
                              <img src={avatar} alt="Avatar" />
                              <h5>{student.name || "Student Name"}</h5>
                              <p>
                                {student.courseCount || 0} course(s) Enrolled
                              </p>
                              <p>{student.mobile_number || "N/A"}</p>
                            </div>
                            <div>
                              <div className="card-buttons">
                                <Link
                                  to="#"
                                  onClick={() => openProfileModal(student)}
                                  className="btn btn-primary btn-sm"
                                >
                                  View
                                </Link>
                                <a
                                  href="#"
                                  className="btn btn-secondary btn-sm"
                                >
                                  Schedule
                                </a>
                              </div>
                              <div className="completed-classes">
                                <i className="bi bi-check-circle"></i>{" "}
                                {student.plan}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <AddStudents
              showModal={showModal}
              hideModal={handleCloseModal}
              onStudentAdded={getStudentsList}
              studentData={onStudentData}
              id={selectedStudent}
              isEdit={isEdit}
              plans={tariffsData}
              instructors={instructorsData}
            />
            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedStudentAppId}
              message={"Are you sure want to delete this student?"}
            />
            <StudentProfileModal
              show={showProfileModal}
              onClose={closeProfileModal}
              student={profileStudentData}
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

export default Students;
