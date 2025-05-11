import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

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
import { deleteStudent } from "../../store/deleteStudent/actions";

import avatar from "../../assets/img/avatar.png";
import {
  toaster,
  successNotification,
  errorNotification
} from '../../shared/commonComponent/toaster/toaster'



const Students = () => {

  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentAppId, setSelectedStudentAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);


  const getStudentsList = () => {
    const data = {};
    dispatch(getStudentsListInformation(data, (res) => {
      if (Array.isArray(res) && res.length > 0) {
        setStudentsData(res);
        setError(null);
      } else if (Array.isArray(res) && res.length === 0) {
        setStudentsData([]);
        setError("No students found.");
      } else if (res?.message || typeof res === "string") {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }));
  }

  useEffect(() => {
    getStudentsList();
  }, [dispatch]);
  
  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
  }

  const deleteDataConfirmation = () => {
    setShowDeleteModal(true);
  }

  const deleteData = (appId) => {
    const payloadDeleteStudent = {
      appId: appId
    }
   
    dispatch(
      deleteStudent(payloadDeleteStudent, (res) => {
        handleDeleteCloseModel()
        getStudentsList();
        // toaster(
        //   'Delete Student',
        //   'Student deleted successfully.....',
        //   successNotification,
        // )
        
      })
   )
    handleDeleteCloseModel();
  }

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedStudentAppId(appId)
  }

  const AddStudentsModal = () => {
    setShowModal(true)
   // setIsEdit(true)
  }

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
      <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
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
                          <a href="#"><span className="mdi mdi-home"></span></a>
                        </li>
                        <li className="breadcrumb-item">Students</li>
                        <li className="breadcrumb-item" aria-current="page">StudentList</li>
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
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-3" key={index}>
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
              <button className="btn btn-sm btn-warning" title="Edit Student" onClick={() => handleEditStudent(student)}>
                <i className="bi bi-pencil"></i>
              </button>
              <button className="btn btn-sm btn-danger" title="Delete Student" onClick={()=>deleteUser(student.application_number)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>

            <div>
              <img src={avatar} alt="Avatar" />
              <h5>{student.name || "Student Name"}</h5>
              <p>{student.courseCount || 0} course(s) Enrolled</p>
              <p>{student.mobile_number || "N/A"}</p>
            </div>

            <div>
              <div className="card-buttons">
                <a href="#" className="btn btn-primary btn-sm">Profile</a>
                <a href="#" className="btn btn-secondary btn-sm">Schedule</a>
              </div>
              <div className="completed-classes">
                <i className="bi bi-check-circle"></i> {student.classesCompleted || 0} Class(es) Completed
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
            id={selectedStudent} 
            isEdit={isEdit}
            ></AddStudents>

          <DeleteConfirmation
            showDeleteModal={showDeleteModal}
            hideDeleteModal={handleDeleteCloseModel}
            confirmModal={deleteData}
            id={selectedStudentAppId}
            message={'Are you sure want to delete this student?'}
          />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;
