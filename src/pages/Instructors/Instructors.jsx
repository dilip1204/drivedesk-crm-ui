import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";
// import "../../assets/plugins/toastr/toastr.min.css";

import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import { getInstructorsListInformation } from "../../store/instructors/actions";

import { deleteInstructor } from "../../store/instructors/actions";

import avatar from "../../assets/img/avatar.png";
import AddInstructors from "./addInstructors";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileModal from "../../components/ProfileModal";

const Instructors = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorsData, setInstructorsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInstructorAppId, setSelectedInstructorAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
const [profileData, setProfileData] = useState([]);

const openInstructorProfile = (data) => {
  const fields = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Password", value: data.password },
    { label: "Mobile Number", value: data.mobile_number },
    { label: "Available From", value: data.available_from },
    { label: "Available To", value: data.available_to },
    { label: "Status ", value: data.status },
    { label: "Role ", value: data.role },
    // add more if needed
  ];
  setProfileData(fields);
  setShowProfileModal(true);
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
          setError("No Instructors found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    getInstructorsList();
  }, [dispatch]);

  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
  };

  const deleteDataConfirmation = () => {
    setShowDeleteModal(true);
  };

  const deleteData = (appId) => {
    const payloadDeleteInstructor = {
      appId: appId,
    };

    dispatch(
      deleteInstructor(payloadDeleteInstructor, (res) => {
        handleDeleteCloseModel();
        getInstructorsList();
        toast.success("Instructor deleted successfully.....");
      })
    );
    handleDeleteCloseModel();
  };

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedInstructorAppId(appId);
  };

  const AddInstructorsModal = () => {
    setShowModal(true);
    // setIsEdit(true)
  };

  const handleEditInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedInstructor(null); // clear after closing
  };

  const onInstructorsData = (res, isEdit) => {
    if (!res.isError) {
      toast.success(
        isEdit
          ? "Instructor updated successfully!"
          : "Instructor added successfully!"
      );
    } else {
      toast.error("Failed....!");
    }
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
                    <h1>Instructors</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Instructors</li>
                        <li className="breadcrumb-item" aria-current="page">
                          InstructorsList
                        </li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    <button
                      type="button"
                      className="mb-1 btn btn-primary"
                      onClick={AddInstructorsModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Instructors
                    </button>
                  </div>
                </div>

                {/* Instructors List */}
                <div className="container py-0 p-0">
                  {loading ? (
                    <p className="text-center my-5">Loading instructors...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="row g-4">
                      {instructorsData.map((ins, index) => (
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
                                title="Edit Instructor"
                                onClick={() => handleEditInstructor(ins)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                title="Delete INstructor"
                                onClick={() => deleteUser(ins.mobile_number)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>

                            <div>
                              <img src={avatar} alt="Avatar" />
                              <h5>{ins.name || "Instructor Name"}</h5>
                              {/* <p>{student.courseCount || 0} course(s) Enrolled</p> */}
                              <p>{ins.mobile_number || "N/A"}</p>
                            </div>

                            <div>
                              <div className="card-buttons">
                                <Link to="#" onClick={() => openInstructorProfile(ins)} className="btn btn-primary btn-sm">
                                  View
                                </Link>
                                {/* <a href="#" className="btn btn-secondary btn-sm">Assisgn Student</a> */}
                              </div>
                              <div className="completed-classes">
                                <i className="bi bi-check-circle"></i>{" "}
                                {ins.available_from} to {ins.available_to}
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
            <AddInstructors
              showModal={showModal}
              hideModal={handleCloseModal}
              onInstructorAdded={getInstructorsList}
              instructorsData={onInstructorsData}
              id={selectedInstructor}
              isEdit={isEdit}
            ></AddInstructors>

            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedInstructorAppId}
              message={"Are you sure want to delete this instructor?"}
            />
            <ProfileModal
  show={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  title="Instructor Profile"
  avatar={avatar}
  data={profileData}
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

export default Instructors;
