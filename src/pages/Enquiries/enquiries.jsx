import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import { getEnquiriesListInformation, getEnquiriesFilterListInformation } from "../../store/Enquiries/actions";
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
  const enquiriesDataList = useSelector(
    (state) => state.enquiriesInfo.enquiriesList
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    status: "All",
  });

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
    status: Yup.string(),
  });

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
                {/* <div className="row">
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
                </div> */}

                <div className="row">
                  <div className=" breadcrumb-wrapper col-xl-6">
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
                      className="mb-1 btn btn-secondary mr-2"
                      onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button
                      type="button"
                      className="mb-1 btn btn-primary"
                      onClick={AddEnquiriesModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Enquiries
                    </button>
                  </div>
                </div>

                {filtersVisible && (
                  <div className="card p-3 mb-4">
                    <Formik
  initialValues={filters}
  validationSchema={FilterValidationSchema}
  onSubmit={(values) => {
    console.log("Filter Submit Payload:", values); // 🔍 Log the payload

    dispatch(
      getEnquiriesFilterListInformation(values, (res) => {
        const { response, isError } = res;

        if (isError && Array.isArray(response)) {
          response.forEach((err) => {
            const field = err?.loc?.[1] || "Field";
            const message = err?.msg || "Invalid input";
            toast.error(`${field}: ${message}`);
          });
          return;
        }

        const enquiriesList = response || [];
        if (Array.isArray(enquiriesList) && enquiriesList.length > 0) {
          setEnquiriesData(enquiriesList);
          setError(null);
        } else {
          setEnquiriesData([]);
          setError("No enquiries found.");
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
                            <div className="col-md-3">
                              <label>Status</label>
                              <Field
                                as="select"
                                name="status"
                                className="form-control"
                              >
                                <option value="All">All</option>
                                <option value="Pending">Pending</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Converted">Converted</option>
                                <option value="Dropped">Dropped</option>
                              </Field>
                              <ErrorMessage
                                name="status"
                                component="div"
                                className="text-danger"
                              />
                            </div>
                            <div className="col-md-1 d-flex">
                              <div
                                className="form-group d-flex align-items-end w-100"
                                style={{ marginTop: "1.75rem" }}
                              >
                                <button
                                  type="submit"
                                  className="btn btn-primary w-100"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                )}

                {/* Student List */}
                <div>
                  {loading ? (
                    <p className="text-center my-5">Loading enquiries...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <>
                    <div className="table-responsive">
                      <table className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th>
                            <th>Student Name</th>
                            <th>Mobile Number</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiriesData.map((enquiries, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{enquiries.name || "Name"}</td>
                              <td>{enquiries.mobile_number || "N/A"}</td>
                              <td>{enquiries.email || "N/A"}</td>
                              <td className="status"><i className="bi bi-check-circle"></i>{" "} {enquiries.follow_up_status}</td>
                              <td>
                                <button
                                className="btn btn-sm btn-warning"
                                title="Edit Enquiries"
                                onClick={() => handleEditEnquiries(enquiries)}
                              >
                                {/* <i className="bi bi-pencil"></i> */}
                                 Edit
                              </button>{" "}
                               <Link
                                  to="#"
                                  onClick={() => openEnquriesProfile(enquiries)}
                                  className="btn btn-primary btn-sm"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* <div className="row g-4">
                      {enquiriesData.map((enquiries, index) => (
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
                                title="Edit Enquiries"
                                onClick={() => handleEditEnquiries(enquiries)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              
                            </div>

                            <div>
                              <img src={avatar} alt="Avatar" />
                              <h5>{enquiries.name || "Name"}</h5>
                              <p>{enquiries.mobile_number || "N/A"}</p>
                              <p>{enquiries.email || "N/A"}</p>
                            </div>

                            <div>
                              <div className="card-buttons">
                                <Link
                                  to="#"
                                  onClick={() => openEnquriesProfile(enquiries)}
                                  className="btn btn-primary btn-sm"
                                >
                                  View
                                </Link>
                                
                              </div>
                              <div className="completed-classes">
                                <i className="bi bi-check-circle"></i>{" "}
                                {enquiries.follow_up_status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div> */}
                    </>
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
