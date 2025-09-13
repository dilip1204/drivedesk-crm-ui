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
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import { getTariffsListInformation } from "../../store/tariff/actions";
import { deleteTariff } from "../../store/tariff/actions";

import avatar from "../../assets/img/avatar.png";
import AddTariffs from "./addTariffs";
import ProfileModal from "../../components/ProfileModal"; // new generic component

import { useAuth } from "../../hooks/useAuth";

const Tariff = () => {
  const { role } = useAuth();

  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tariffsData, setTariffsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTariffAppId, setSelectedTariffAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState([]);

  const tariffList = useSelector((state) => state.tariffUpdate.tariffsList);

  const openTariffProfile = (tariff) => {
    const fields = [
      { label: "Plan Name", value: tariff.plan_name },
      { label: "Training Days", value: tariff.training_days },
      { label: "Amount", value: tariff.amount },
      { label: "Reference Fee", value: tariff.reference_fee },
      { label: "Description", value: tariff.description },
      { label: "Remarks", value: tariff.remarks },
      { label: "Category", value: tariff.category },
      // add more if needed
    ];
    setProfileData(fields);
    setShowProfileModal(true);
  };

  const getTariffsList = () => {
    const data = {};
    dispatch(
      getTariffsListInformation(data, (res) => {
        const tariffsList = res?.response || [];
        if (tariffsList.length > 0) {
          setTariffsData(tariffsList);
        } else {
          setTariffsData([]);
          setError("No Tariffs found.");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    if (tariffList?.response?.length > 0) {
      setTariffsData(tariffList.response);
      setError(null);
    } else {
      setTariffsData([]);
      setError("No Tariffs found.");
    }
    setLoading(false);
  }, [tariffList]);

  useEffect(() => {
    getTariffsList();
  }, []);

  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
  };

  const deleteDataConfirmation = () => {
    setShowDeleteModal(true);
  };

  const deleteData = (appId) => {
    const payloadDeleteTarrif = {
      appId: appId,
    };

    dispatch(
      deleteTariff(payloadDeleteTarrif, (res) => {
        handleDeleteCloseModel();
        getTariffsList();
        toast.success("Tariff deleted successfully.....");
      })
    );
    handleDeleteCloseModel();
  };

  const deleteTariffPlan = (appId) => {
    setShowDeleteModal(true);
    setSelectedTariffAppId(appId);
  };

  const AddTariffsModal = () => {
    setShowModal(true);
    // setIsEdit(true)
  };

  const handleEditTariff = (tariff) => {
    setSelectedTariff(tariff);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedTariff(null); // clear after closing
  };

  const onTariffData = (res, isEdit) => {
    if (!res.isError) {
      getTariffsList();
      toast.success(
        isEdit ? "Tariff updated successfully!" : "Tariff added successfully!"
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
                    <h1>Tariffs</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <span className="mdi mdi-home"></span>
                          </a>
                        </li>
                        <li className="breadcrumb-item">Tariffs</li>
                        <li className="breadcrumb-item" aria-current="page">
                          TariffList
                        </li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    {role === "admin" ? (
                      <button
                        type="button"
                        className="mb-1 btn btn-primary"
                        onClick={AddTariffsModal}
                      >
                        <i className="bi bi-plus-lg"></i> Add Tariffs
                      </button>
                    ) : (
                      <p></p>
                    )}
                  </div>
                </div>

                {/* Student List */}
                <div>
                  {loading ? (
                    <p className="text-center my-5">Loading tariffs...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <>
                    <div className="table-responsive">
                      <table className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th>
                            <th>Plan Name</th>
                            <th>Training Days</th>
                            <th>Amount</th>
                            <th>Reference Fee</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tariffsData.map((tariff, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td>{tariff.plan_name || "Plan Name"}</td>
                              <td>{tariff.training_days || 0} Training days</td>
                              <td>{tariff.amount || "N/A"}</td>
                              <td className="status"><i className="bi bi-check-circle"></i>{" "} {tariff.reference_fee || 0} Reference fee</td>
                              <td>
                                {role === "admin" ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    title="Edit Tariff"
                                    onClick={() => handleEditTariff(tariff)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>{" "}
                                  <button
                                    className="btn btn-sm btn-danger"
                                    title="Delete Tariff"
                                    onClick={() =>
                                      deleteTariffPlan(tariff.plan_name)
                                    }
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              ) : (
                                <span>Disabled</span>
                              )}{" "}
                              <Link
                                  to="#"
                                  onClick={() => openTariffProfile(tariff)}
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
                      {tariffsData?.map((tariff, index) => (
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
                              {role === "admin" ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    title="Edit Tariff"
                                    onClick={() => handleEditTariff(tariff)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    title="Delete Tariff"
                                    onClick={() =>
                                      deleteTariffPlan(tariff.plan_name)
                                    }
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              ) : (
                                <span></span>
                              )}
                            </div>

                            <div>
                              <img src={avatar} alt="Avatar" />
                              <h5>{tariff.plan_name || "Plan Name"}</h5>
                              <p>{tariff.training_days || 0} Training days</p>
                              <p>{tariff.amount || "N/A"}</p>
                            </div>

                            <div>
                              <div className="card-buttons">
                                <Link
                                  to="#"
                                  onClick={() => openTariffProfile(tariff)}
                                  className="btn btn-primary btn-sm"
                                >
                                  View
                                </Link>
                                
                              </div>
                              <div className="completed-classes">
                                <i className="bi bi-check-circle"></i>{" "}
                                {tariff.reference_fee || 0} Reference fee
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
            <AddTariffs
              showModal={showModal}
              hideModal={handleCloseModal}
              onTariffSaved={getTariffsList}
              tariffData={onTariffData}
              id={selectedTariff}
              isEdit={isEdit}
            ></AddTariffs>

            <DeleteConfirmation
              showDeleteModal={showDeleteModal}
              hideDeleteModal={handleDeleteCloseModel}
              confirmModal={deleteData}
              id={selectedTariffAppId}
              message={"Are you sure want to delete this tariff?"}
            />
            <ProfileModal
              show={showProfileModal}
              onClose={() => setShowProfileModal(false)}
              title="Tariff Profile"
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

export default Tariff;
