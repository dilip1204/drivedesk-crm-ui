import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
import Pagination from "../Students/Pagenation";

const Enquiries = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    status: "All",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const startIndex = (currentPage - 1) * pageSize;

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
      { label: "Referred By", value: data.referred_by },
      { label: "Course Interest", value: data.course_interest },
      { label: "Enquiry Date", value: data.enquiry_date },
      { label: "Follow Up Status", value: data.follow_up_status },
      { label: "Follow Up Date", value: data.follow_up_date || null },
      { label: "Remarks", value: data.remarks },
    ];
    setProfileData(fields);
    setShowProfileModal(true);
  };

  const parseEnquiriesResponse = (res, fallbackPageSize = 10) => {
    const response = res?.response;

    if (Array.isArray(response)) {
      return {
        list: response,
        total: response.length,
        skip: 0,
        limit: fallbackPageSize,
      };
    }

    const list = Array.isArray(response?.enquiries) ? response.enquiries : [];
    const limit = Number(response?.limit);
    const skip = Number(response?.skip);
    const total = Number(response?.total);

    return {
      list,
      total: Number.isFinite(total) ? total : list.length,
      skip: Number.isFinite(skip) ? skip : 0,
      limit: Number.isFinite(limit) && limit > 0 ? limit : fallbackPageSize,
    };
  };

  const getEnquiriesList = (page = currentPage, limit = pageSize) => {
    const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
    const data = { skip: (safePage - 1) * safeLimit, limit: safeLimit };
    setLoading(true);

    dispatch(
      getEnquiriesListInformation(data, (res) => {
        const parsed = parseEnquiriesResponse(res, safeLimit);
        if (parsed.list.length > 0) {
          setEnquiriesData(parsed.list);
          setTotalCount(parsed.total);
          setPageSize(parsed.limit);
          setCurrentPage(Math.floor(parsed.skip / parsed.limit) + 1);
          setError(null);
        } else {
          setEnquiriesData([]);
          setTotalCount(0);
          setCurrentPage(1);
          setError("No enquiries found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    getEnquiriesList(currentPage, pageSize);
  }, [dispatch, currentPage, pageSize]);

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

  const onEnquiriesData = (res, isEdit, meta = {}) => {
    if (!res.isError) {
      getEnquiriesList();
      if (meta?.enrolledFlow) {
        if (meta?.studentCreated) {
          toast.success(
            isEdit
              ? "Enquiry updated and student added successfully!"
              : "Enquiry and student added successfully!"
          );
          navigate("/students");
        } else {
          const studentError = meta?.studentResponse || {};
          const studentDetailMessage = Array.isArray(studentError?.detail)
            ? studentError.detail
                .map((d) => d?.msg || d?.message)
                .filter(Boolean)
                .join(", ")
            : "";
          const studentMsg =
            studentDetailMessage ||
            (typeof studentError?.response === "string" && studentError.response) ||
            studentError?.message ||
            studentError?.response?.message ||
            "Failed to add student from enrolled enquiry.";
          toast.error(
            `${
              isEdit ? "Enquiry updated" : "Enquiry saved"
            }, but student add failed: ${studentMsg}`
          );
        }
      } else {
        toast.success(
          isEdit
            ? "Enquiries updated successfully!"
            : "Enquiries added successfully!"
        );
      }
    } else {
      const detailMessage = Array.isArray(res?.detail)
        ? res.detail.map((d) => d?.msg || d?.message).filter(Boolean).join(", ")
        : "";
      const msg =
        detailMessage ||
        (typeof res?.response === "string" && res.response) ||
        res?.message ||
        res?.response?.message ||
        "Failed....!";
      toast.error(msg);
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

        const parsed = parseEnquiriesResponse(res, pageSize);
        if (parsed.list.length > 0) {
          setEnquiriesData(parsed.list);
          setTotalCount(parsed.total);
          setCurrentPage(Math.floor(parsed.skip / parsed.limit) + 1);
          setPageSize(parsed.limit);
          setError(null);
        } else {
          setEnquiriesData([]);
          setTotalCount(0);
          setCurrentPage(1);
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
                              {(() => {
                                const isEnrolled =
                                  String(enquiries?.follow_up_status || "")
                                    .trim()
                                    .toLowerCase() === "enrolled";
                                return (
                                  <>
                              <td>{startIndex + index + 1}</td>
                              <td>{enquiries.name || "Name"}</td>
                              <td>{enquiries.mobile_number || "N/A"}</td>
                              <td>{enquiries.email || "N/A"}</td>
                              <td className="status"><i className="bi bi-check-circle"></i>{" "} {enquiries.follow_up_status}</td>
                              <td>
                                <button
                                className="btn btn-sm btn-warning"
                                title="Edit Enquiries"
                                disabled={isEnrolled}
                                onClick={() => handleEditEnquiries(enquiries)}
                              >
                                {/* <i className="bi bi-pencil"></i> */}
                                 Edit
                              </button>{" "}
                               <Link
                                  to="#"
                                  onClick={(e) => {
                                    if (isEnrolled) {
                                      e.preventDefault();
                                      return;
                                    }
                                    openEnquriesProfile(enquiries);
                                  }}
                                  className={`btn btn-primary btn-sm${
                                    isEnrolled ? " disabled" : ""
                                  }`}
                                  aria-disabled={isEnrolled}
                                  tabIndex={isEnrolled ? -1 : 0}
                                >
                                  View
                                </Link>
                              </td>
                                  </>
                                );
                              })()}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
