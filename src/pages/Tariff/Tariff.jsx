import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
import { getTariffsListInformation } from "../../store/tariff/actions";
import { deleteStudent } from "../../store/deleteStudent/actions";

import avatar from "../../assets/img/avatar.png";
import AddTariffs from "./addTariffs";



const Tariff = () => {

  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tariffsData, setTariffsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTariffAppId, setSelectedTariffAppId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);


  const getTariffsList = () => {
    const data = {};
    dispatch(getTariffsListInformation(data, (res) => {
      const tariffsList = res?.response || [];
  if (Array.isArray(tariffsList) && tariffsList.length > 0) {
    setTariffsData(tariffsList);
  } else {
    setTariffsData([]);
    setError("No Tariffs found.");
  }
      setLoading(false);
    }));
  }

  useEffect(() => {
    getTariffsList();
  }, [dispatch]);
  
  const handleDeleteCloseModel = () => {
    setShowDeleteModal(false);
  }

  const deleteDataConfirmation = () => {
    setShowDeleteModal(true);
  }

  const deleteData = (appId) => {
    const payloadDeleteTarrif = {
      appId: appId
    }
   
    dispatch(
      deleteStudent(payloadDeleteTarrif, (res) => {
        handleDeleteCloseModel()
        getTariffsList();
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
    setSelectedTariffAppId(appId)
  }

  const AddTariffsModal = () => {
    setShowModal(true)
   // setIsEdit(true)
  }

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
                    <h1>Tariffs</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <a href="#"><span className="mdi mdi-home"></span></a>
                        </li>
                        <li className="breadcrumb-item">Tariffs</li>
                        <li className="breadcrumb-item" aria-current="page">TariffList</li>
                      </ol>
                    </nav>
                  </div>

                  <div className="col-xl-6 text-right">
                    <button
                      type="button"
                      className="mb-1 btn btn-primary"
                      onClick={AddTariffsModal}
                    >
                      <i className="bi bi-plus-lg"></i> Add Tariffs
                    </button>
                  </div>
                </div>

                {/* Student List */}
                <div className="container py-0 p-0">
                {loading ? (
    <p className="text-center my-5">Loading tariffs...</p>
  ) : error ? (
    <p className="text-center text-danger my-5">{error}</p>
  ) : (
    <div className="row g-4">
      {tariffsData.map((tariff, index) => (
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
              <button className="btn btn-sm btn-warning" title="Edit Tariff" onClick={() => handleEditTariff(tariff)}>
                <i className="bi bi-pencil"></i>
              </button>
              <button className="btn btn-sm btn-danger" title="Delete Tariff" onClick={()=>deleteUser(tariff.mobile_number)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>

            <div>
              <img src={avatar} alt="Avatar" />
              <h5>{tariff.plan_name || "Plan Name"}</h5>
              <p>{tariff.training_days || 0} Training days</p>
              <p>{tariff.amount || "N/A"}</p>
            </div>

            <div>
              <div className="card-buttons">
                <a href="#" className="btn btn-primary btn-sm">Profile</a>
                <a href="#" className="btn btn-secondary btn-sm">Schedule</a>
              </div>
              <div className="completed-classes">
                <i className="bi bi-check-circle"></i> {tariff.reference_fee || 0} Reference fee
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
            <AddTariffs
            showModal={showModal} 
            hideModal={handleCloseModal}
            onTariffAdded={getTariffsList}
            id={selectedTariff} 
            isEdit={isEdit}
            ></AddTariffs>

          <DeleteConfirmation
            showDeleteModal={showDeleteModal}
            hideDeleteModal={handleDeleteCloseModel}
            confirmModal={deleteData}
            id={selectedTariffAppId}
            message={'Are you sure want to delete this tariff?'}
          />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Tariff;
