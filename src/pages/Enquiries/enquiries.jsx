import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

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
import { getEnquiriesListInformation } from "../../store/Enquiries/actions";
import { deleteStudent } from "../../store/deleteStudent/actions";

import avatar from "../../assets/img/avatar.png";
import AddEnquiries from "./addEnquiries";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileModal from "../../components/ProfileModal";

const Enquiries = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enquiriesData, setEnquiriesData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiriesAppId, setSelectedEnquiriesAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEnquiries, setSelectedEnquiries] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
const [profileData, setProfileData] = useState([]);
const enquiriesDataList = useSelector((state) => state.enquiriesInfo.enquiriesList);

const openEnquriesProfile = (data) => {
  const fields = [
    { label: "Name", value: data.name },
    { label: "Mobile Number", value: data.mobile_number },
    { label: "DOB", value: data.dob },
    { label: "Referred By", value: data.referred_by },
    { label: "Email", value: data.email },
    { label: "Course Interest", value: data.course_interest },
    { label: "Enquiry Date", value: data.enquiry_date },
    { label: "Remarks", value: data.remarks },
    { label: "Follow Up Status", value: data.follow_up_status },
    // add more if needed
  ];
  setProfileData(fields);
  setShowProfileModal(true);
};


  const getEnquiriesList = () => {
    const data = {};
    dispatch(
      getEnquiriesListInformation(data, (res) => {
        const enquiresList = res?.response || [];
        if (Array.isArray(enquiresList) && enquiresList.length > 0) {
          setEnquiriesData(enquiresList);
        } else {
          setEnquiriesData([]);
          setError("No enquiries found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    if (enquiriesDataList?.response?.length > 0) {
      setEnquiriesData(enquiriesDataList.response);
      setError(null);
    } else {
      setEnquiriesData([]);
      setError("No enquiries found.");
    }
    setLoading(false);
  }, [enquiriesDataList]);

  useEffect(() => {
    getEnquiriesList();
  }, [dispatch]);

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
        getEnquiriesList();
      })
    );
    handleDeleteCloseModel();
  };

  const deleteUser = (appId) => {
    setShowDeleteModal(true);
    setSelectedEnquiriesAppId(appId);
  };

  const AddEnquiriesModal = () => {
    setShowModal(true);
    // setIsEdit(true)
  };

  const handleEditEnquiries = (student) => {
    setSelectedEnquiries(student);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedEnquiries(null); // clear after closing
  };

  const onEnquiriesData = (res, isEdit) => {
    if (!res.isError) {
      getEnquiriesList();
      toast.success(
        isEdit
          ? "Enquiries updated successfully!"
          : "Enquiries added successfully!"
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
                    <h1>Enquiries</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Enquiries</li>
                        <li className="breadcrumb-item" aria-current="page">
                          EnquiriesList
                        </li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    <button
                      type="button"
                      className="mb-1 btn btn-primary"
                      onClick={AddEnquiriesModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Enquiries
                    </button>
                  </div>
                </div>

                {/* Student List */}
                <div className="container py-0 p-0">
                  {loading ? (
                    <p className="text-center my-5">Loading enquiries...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="row g-4">
                      {enquiriesData.map((enquiries, index) => (
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
                                title="Edit Enquiries"
                                onClick={() => handleEditEnquiries(enquiries)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {/* <button
                                className="btn btn-sm btn-danger"
                                title="Delete Enquiries"
                                onClick={() =>
                                  deleteUser(enquiries.application_number)
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button> */}
                            </div>

                            <div>
                              <img src={avatar} alt="Avatar" />
                              <h5>{enquiries.name || "Name"}</h5>
                              <p>{enquiries.mobile_number || "N/A"}</p>
                              <p>{enquiries.email || "N/A"}</p>
                            </div>

                            <div>
                              <div className="card-buttons">
                                <Link to="#" onClick={() => openEnquriesProfile(enquiries)} className="btn btn-primary btn-sm">
                                  View
                                </Link>
                                {/* <a href="#" className="btn btn-secondary btn-sm">Schedule</a> */}
                              </div>
                              <div className="completed-classes">
                                <i className="bi bi-check-circle"></i>{" "}
                                {enquiries.follow_up_status}
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
            <AddEnquiries
              showModal={showModal}
              hideModal={handleCloseModal}
              onEnquiriesAdded={getEnquiriesList}
              enquiriesData={onEnquiriesData}
              id={selectedEnquiries}
              isEdit={isEdit}
            ></AddEnquiries>

            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedEnquiriesAppId}
              message={"Are you sure want to delete this enquiries?"}
            />
            <ProfileModal
  show={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  title="Enquiries Profile"
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

export default Enquiries;
