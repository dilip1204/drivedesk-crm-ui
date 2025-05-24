import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";
// import "../../assets/plugins/toastr/toastr.min.css";

import "./Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import AddStudents from "./addStudents";
import { getStudentsListInformation } from "../../store/students/actions";
import { getTariffsListInformation } from "../../store/tariff/actions";
import { getInstructorsListInformation } from "../../store/instructors/actions";
import { deleteStudent } from "../../store/deleteStudent/actions";
import avatar from "../../assets/img/avatar.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentProfileModal from "./StudentProfile";


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
    const data = {};
    dispatch(
      getTariffsListInformation(data, (res) => {
        const tariffsList = res?.response || [];
        if (Array.isArray(tariffsList) && tariffsList.length > 0) {
          setTariffsData(tariffsList);
        } else {
          setTariffsData([]);
        }
      })
    );
  };

  const getInstructorsList = () => {
      const data = {};
      dispatch(
        getInstructorsListInformation(data, (res) => {
          const instructorsList = res?.response || [];
          if (Array.isArray(instructorsList) && instructorsList.length > 0) {
            setInstructorsData(instructorsList);
          } else {
            setInstructorsData([]);
          }
        })
      );
    };

  useEffect(() => {
    getStudentsList();
    getTariffsList();
    getInstructorsList();
  }, [dispatch]);

  const onStudentData = (res, isEdit) => {
    if (!res.isError) {
      toast.success(
        isEdit ? "Student updated successfully!" : "Student added successfully!"
      );
    } else {
      toast.error("Failed....!");
    }
  };

  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
  };

  const deleteDataConfirmation = () => {
    setShowDeleteModal(true);
  };

  const deleteData = (appId) => {
    const payloadDeleteStudent = {
      appId: appId,
    };

    dispatch(
      deleteStudent(payloadDeleteStudent, (res) => {
        handleDeleteCloseModel();
        getStudentsList();
        toast.success("Student deleted successfully.....");
      })
    );
    handleDeleteCloseModel();
  };

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedStudentAppId(appId);
  };

  const AddStudentsModal = () => {
    setShowModal(true);
    // setIsEdit(true)
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedStudent(null); // clear after closing
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
                {/* Breadcrumb */}
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
                      className="mb-1 btn btn-primary"
                      onClick={AddStudentsModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Students
                    </button>
                  </div>
                </div>

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
                            {/* Top Right Actions */}
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
                                <Link to="#" onClick={() => openProfileModal(student)} className="btn btn-primary btn-sm">
                                  Profile
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
                                {student.classesCompleted || 0} Class(es)
                                Completed
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

            {/* Modal Form */}
            <AddStudents
              showModal={showModal}
              hideModal={handleCloseModal}
              onStudentAdded={getStudentsList}
              studentData={onStudentData}
              id={selectedStudent}
              isEdit={isEdit}
              plans={tariffsData}
              instructors={instructorsData}
            ></AddStudents>

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
