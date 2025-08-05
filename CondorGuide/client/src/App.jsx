import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./components/Home";
import Map from "./components/Map";
import AvailableClassrooms from "./components/AvailableClassrooms";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUp";
import ReportIssue from "./components/ReportIssue";

import { ThemeContext } from "./context/ThemeContext";
import AdminManagement from "./components/AdminManagement";
import IssueManagement from "./components/IssueManagement";
import ClassroomManagement from "./components/classroomManagement";
import AlertManagement from "./components/AlertManagement";
import ProfilePage from "./components/ProfilePage";
import UserManagement from "./components/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import SecurityAlert from "./components/SecurityAlert";
import Donation from "./components/Donation";
import AboutUs from "./components/AboutUsPage";

const AppWrapper = () => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const hideHeaderFooter = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className={theme === "dark" ? "bg-dark text-light min-vh-100 d-flex flex-column" : "bg-light text-dark min-vh-100 d-flex flex-column"}>
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin-management"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <AdminManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue-management"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin", "maintenance"]}>
                <IssueManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classroom-management"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <ClassroomManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={<Map />} />
          <Route
            path="/issues"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classrooms"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                {" "}
                <AvailableClassrooms />{" "}
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-alerts"
            element={
              <ProtectedRoute allowedRoles={["user", "security", "admin", "superadmin"]}>
                <SecurityAlert />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <Donation />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
