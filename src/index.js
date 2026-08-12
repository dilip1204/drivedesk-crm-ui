import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import "./assets/css/sleek.css"
import { Provider } from "react-redux";
import store from './store/store';
import { registerServiceWorker } from "./serviceWorkerRegistration";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store} >
  <BrowserRouter>  
    <AppRoutes />
  </BrowserRouter>
  </Provider>
);

registerServiceWorker();
