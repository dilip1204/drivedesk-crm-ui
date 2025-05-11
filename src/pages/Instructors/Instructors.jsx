import React from "react";
import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../../assets/plugins/daterangepicker/daterangepicker.css";
// import "../../assets/plugins/toastr/toastr.min.css";

import "./Instructors.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Instructors = () => {
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
                  <h1>Instructors</h1>

                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item">
                        <a href="index.html">
                          <span className="mdi mdi-home"></span>
                        </a>
                      </li>
                      <li className="breadcrumb-item">tables</li>
                      <li className="breadcrumb-item" aria-current="page">
                        basic-tables
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-right">
                <button type="button" class="mb-1 btn btn-primary" data-target="#exampleModalForm" data-toggle="modal" >Add Instructors</button>
                </div>
                </div>
               

                <div className="row">
                  <div className="col-12">
                    <div
                      className="card card-table-border-none recent-orders"
                      id="recent-orders"
                    >
                      <div className="card-header justify-content-between">
                        <h2>Recent Orders</h2>
                        <div className="date-range-report ">
                          <span></span>
                        </div>
                      </div>
                      <div className="card-body pt-0 pb-5">
                        <table
                          className="table card-table table-responsive table-responsive-large table-hover"
                          style={{width:"100%"}}
                        >
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Product Name</th>
                              <th className="d-none d-lg-table-cell">Units</th>
                              <th className="d-none d-lg-table-cell">Order Date</th>
                              <th className="d-none d-lg-table-cell">Order Cost</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>24541</td>
                              <td>
                                <a className="text-dark" href="">
                                  {" "}
                                  Coach Swagger
                                </a>
                              </td>
                              <td className="d-none d-lg-table-cell">1 Unit</td>
                              <td className="d-none d-lg-table-cell">
                                Oct 20, 2018
                              </td>
                              <td className="d-none d-lg-table-cell">$230</td>
                              <td>
                                <span className="badge badge-success">
                                  Completed
                                </span>
                              </td>
                              <td className="text-right">
                                <div className="dropdown show d-inline-block widget-dropdown">
                                  <a
                                    className="dropdown-toggle icon-burger-mini"
                                    href=""
                                    role="button"
                                    id="dropdown-recent-order1"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                  ></a>
                                  <ul
                                    className="dropdown-menu dropdown-menu-right"
                                    aria-labelledby="dropdown-recent-order1"
                                  >
                                    <li className="dropdown-item">
                                      <a href="#">View</a>
                                    </li>
                                    <li className="dropdown-item">
                                      <a href="#">Remove</a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>24541</td>
                              <td>
                                <a className="text-dark" href="">
                                  {" "}
                                  Toddler Shoes, Gucci Watch
                                </a>
                              </td>
                              <td className="d-none d-lg-table-cell">2 Units</td>
                              <td className="d-none d-lg-table-cell">
                                Nov 15, 2018
                              </td>
                              <td className="d-none d-lg-table-cell">$550</td>
                              <td>
                                <span className="badge badge-warning">Delayed</span>
                              </td>
                              <td className="text-right">
                                <div className="dropdown show d-inline-block widget-dropdown">
                                  <a
                                    className="dropdown-toggle icon-burger-mini"
                                    href="#"
                                    role="button"
                                    id="dropdown-recent-order2"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                  ></a>
                                  <ul
                                    className="dropdown-menu dropdown-menu-right"
                                    aria-labelledby="dropdown-recent-order2"
                                  >
                                    <li className="dropdown-item">
                                      <a href="#">View</a>
                                    </li>
                                    <li className="dropdown-item">
                                      <a href="#">Remove</a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>24541</td>
                              <td>
                                <a className="text-dark" href="">
                                  {" "}
                                  Hat Black Suits
                                </a>
                              </td>
                              <td className="d-none d-lg-table-cell">1 Unit</td>
                              <td className="d-none d-lg-table-cell">
                                Nov 18, 2018
                              </td>
                              <td className="d-none d-lg-table-cell">$325</td>
                              <td>
                                <span className="badge badge-warning">On Hold</span>
                              </td>
                              <td className="text-right">
                                <div className="dropdown show d-inline-block widget-dropdown">
                                  <a
                                    className="dropdown-toggle icon-burger-mini"
                                    href="#"
                                    role="button"
                                    id="dropdown-recent-order3"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                  ></a>
                                  <ul
                                    className="dropdown-menu dropdown-menu-right"
                                    aria-labelledby="dropdown-recent-order3"
                                  >
                                    <li className="dropdown-item">
                                      <a href="#">View</a>
                                    </li>
                                    <li className="dropdown-item">
                                      <a href="#">Remove</a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>24541</td>
                              <td>
                                <a className="text-dark" href="">
                                  {" "}
                                  Backpack Gents, Swimming Cap Slin
                                </a>
                              </td>
                              <td className="d-none d-lg-table-cell">5 Units</td>
                              <td className="d-none d-lg-table-cell">
                                Dec 13, 2018
                              </td>
                              <td className="d-none d-lg-table-cell">$200</td>
                              <td>
                                <span className="badge badge-success">
                                  Completed
                                </span>
                              </td>
                              <td className="text-right">
                                <div className="dropdown show d-inline-block widget-dropdown">
                                  <a
                                    className="dropdown-toggle icon-burger-mini"
                                    href="#"
                                    role="button"
                                    id="dropdown-recent-order4"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                  ></a>
                                  <ul
                                    className="dropdown-menu dropdown-menu-right"
                                    aria-labelledby="dropdown-recent-order4"
                                  >
                                    <li className="dropdown-item">
                                      <a href="#">View</a>
                                    </li>
                                    <li className="dropdown-item">
                                      <a href="#">Remove</a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>24541</td>
                              <td>
                                <a className="text-dark" href="">
                                  {" "}
                                  Speed 500 Ignite
                                </a>
                              </td>
                              <td className="d-none d-lg-table-cell">1 Unit</td>
                              <td className="d-none d-lg-table-cell">
                                Dec 23, 2018
                              </td>
                              <td className="d-none d-lg-table-cell">$150</td>
                              <td>
                                <span className="badge badge-danger">
                                  Cancelled
                                </span>
                              </td>
                              <td className="text-right">
                                <div className="dropdown show d-inline-block widget-dropdown">
                                  <a
                                    className="dropdown-toggle icon-burger-mini"
                                    href="#"
                                    role="button"
                                    id="dropdown-recent-order5"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                  ></a>
                                  <ul
                                    className="dropdown-menu dropdown-menu-right"
                                    aria-labelledby="dropdown-recent-order5"
                                  >
                                    <li className="dropdown-item">
                                      <a href="#">View</a>
                                    </li>
                                    <li className="dropdown-item">
                                      <a href="#">Remove</a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal fade" id="exampleModalForm" tabindex="-1" role="dialog" aria-labelledby="exampleModalFormTitle" aria-hidden="true">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="exampleModalFormTitle">Modal Title</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>

			<div class="modal-body">
				<form>
					<div class="form-group">
						<label for="exampleInputEmail1">Email address</label>
						<input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
						<small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
					</div>

					<div class="form-group">
						<label for="exampleInputPassword1">Password</label>
						<input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
					</div>

					<div class="form-check pl-0">
						<label class="control control-checkbox">Check me out
							<input type="checkbox" checked="checked" />
							<div class="control-indicator"></div>
						</label>
					</div>
					<button type="submit" class="btn btn-primary">Submit</button>
				</form>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-danger btn-pill" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary btn-pill">Save Changes</button>
			</div>
		</div>
	</div>
</div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Instructors;
