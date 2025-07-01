import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import AddPayment from "./addPayment";
import { addStudentPayment } from "../../store/addStudentPayment/actions";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [getStuentData, setGetStuentData] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [filterApplied, setFilterApplied] = useState(false);

  const studentDataLists = useSelector(
    (state) => state.studentsListInfo.studentsList
  );

  const [searchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") || "";
  const initialYear = searchParams.get("year") || "";

  const getOneStudentPaymentData = (flag, student) => {
    setShowPaymentModal(flag);
    setGetStuentData(student);
  };

  const [filters, setFilters] = useState({
    month: initialMonth,
    year: initialYear,
    status: "All",
    instructor_name: "",
    test_date: "",
  });
  // const [filters, setFilters] = useState({
  //   month: "",
  //   year: "",
  //   status: "",
  //   instructor_name: "",
  //   test_date: "",
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
    status: Yup.string(), // Optional
    instructor_name: Yup.string(), // Optional
    test_date: Yup.string(),
    //.matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    // .nullable(), // optional
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
useEffect(()=> {

}, [studentsData])
  useEffect(() => {
    if (studentDataLists?.response?.length > 0) {
      setStudentsData(studentDataLists.response);
      setError(null);
    } else {
      setStudentsData([]);
      setError("No students found.");
    }
    setLoading(false);
  }, [studentDataLists]);

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
    setSelectedStudent(res.response);
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

  const handleAddPayment = (payload) => {
    console.log("Payment Payload:", payload, getStuentData);

    const initialValues = {
      appId: getStuentData.application_number,
      studentPaymentData: {
        payment_id:
          getStuentData.payments?.[getStuentData.payments.lenth - 1]
            ?.payment_id || "",
        receipt_no:
          getStuentData.payments?.[getStuentData.payments.lenth - 1]
            ?.receipt_no || "",
        amount: payload.amount,
        transaction_id: "",
        date: payload.date,
        payment_method: payload.payment_method,
        payment_status: payload.payment_status,
        remarks: payload.remarks,
        payment_received_by:
          getStuentData.payments?.[getStuentData.payments.lenth - 1]
            ?.payment_received_by || "",
      },
    };

    dispatch(
      addStudentPayment(initialValues, (response) => {
        const errorList =
          response?.data?.detail || response?.detail || response;

        if (Array.isArray(errorList)) {
          errorList.forEach((err) => {
            const field = err?.loc?.[1];
            const msg = err?.msg || err?.message || "Invalid input";
            toast.error(`${field}: ${msg}`);
          });
          return;
        }

        if (response?.isError) {
          toast.error("Payment failed. Please try again.");
        } else {
          setReceiptData(response);
          toast.success("Payment added successfully!");
          //setShowPaymentModal(false);
          getStudentsList(); // refresh student data after payment
        }
      })
    );
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


  const PrintableStudentTable = ({ students }) => {
    //if (!students.length) return null;

    return (
      <div className="printable-student-table mt-3">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Application No</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Instructor</th>
              <th>Balance</th>
              <th>Test Date</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.application_number || index}>
                <td>{index + 1}</td>
                <td>{student.application_number || "-"}</td>
                <td>{student.name || "-"}</td>
                <td>{student.mobile_number || "-"}</td>
                <td>{student.status || "-"}</td>
                <td>{student.plan || "-"}</td>
                <td>{student.instructor_name || "-"}</td>
                <td>₹{student.balance || 0}</td>
                <td>{formatDate(student.test_date)}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrint = () => {
  const originalTitle = document.title;
  document.title = "Filtered Students Report";

  window.print();

  // Restore original title after a short delay
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
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
                      // onClick={() => setFiltersVisible(!filtersVisible)}
                      onClick={() => {
                        setFiltersVisible(!filtersVisible);
                        if (!filtersVisible) setFilterApplied(false);
                      }}
                    >
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button
                      type="button"
                      className="mb-1 btn btn-primary mr-2"
                      onClick={AddStudentsModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Students
                    </button>
                    {filterApplied && studentsData.length > 0 && (
                              
                                <button  type="button" className="mb-1 btn btn-outline-secondary" onClick={handlePrint}>
  <i className="bi bi-printer"></i> Print
</button>

                              
                            )}
                  </div>
                </div>

                {filtersVisible && (
                  <div className="card p-3 mb-4">
                    <Formik
                      initialValues={filters}
                      validationSchema={FilterValidationSchema}
                      onSubmit={(values) => {
                        setFilterApplied(true);
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
                                <option value="All">All</option>
                                <option value="Process Started">
                                  Process Started
                                </option>
                                <option value="Process failed">
                                  Process failed
                                </option>
                                <option value="Process stalled">
                                  Process stalled
                                </option>
                                <option value="Process completed">
                                  Process completed
                                </option>
                              </Field>
                              <ErrorMessage
                                name="status"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-3">
                              <label>Instructor Name</label>
                              <Field
                                as="select"
                                name="instructor_name"
                                className="form-control"
                              >
                                <option value="">--Select--</option>
                                {instructorsData.map((instructor, idx) => (
                                  <option key={idx} value={instructor.name}>
                                    {instructor.name}
                                  </option>
                                ))}
                              </Field>

                              <ErrorMessage
                                name="instructor_name"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="col-md-2">
                              <label>Test Date</label>
                              <Field
                                type="date"
                                name="test_date"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="test_date"
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
                              <button
                                className="btn btn-sm btn-success"
                                title={
                                  Number(student.balance) <= 0
                                    ? "No balance due"
                                    : "Add Payment"
                                }
                                onClick={() =>
                                  getOneStudentPaymentData(true, student)
                                }
                                disabled={Number(student.balance) <= 0}
                              >
                                <i className="bi bi-currency-rupee"></i>
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

            <AddPayment
              show={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onSubmit={handleAddPayment}
              payReceiptData={receiptData}
              student={getStuentData}
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
      <div className="d-none d-print-block">
              <h2 className="text-center my-3">Students Test List</h2>
              <PrintableStudentTable students={studentsData} />
            </div>
    </>
  );
};

export default Students;
