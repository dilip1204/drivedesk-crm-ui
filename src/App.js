import React from "react";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
//import { ReactNotifications } from "react-notifications-component";
//import 'react-notifications-component/dist/theme.css'

export default function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      {/* <ReactNotifications /> */}
    </>
  );
}