import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";
import { Protected } from "./components/Protected";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import FoodDetails from "./pages/FoodDetails";
import MyRequests from "./pages/MyRequests";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/browse" element={<Protected roles={["beneficiary"]}><Browse /></Protected>} />
            <Route path="/food/:id" element={<Protected><FoodDetails /></Protected>} />
            <Route path="/my-requests" element={<Protected roles={["beneficiary"]}><MyRequests /></Protected>} />

            <Route path="/restaurant" element={<Protected roles={["restaurant"]}><RestaurantDashboard tab="overview" /></Protected>} />
            <Route path="/restaurant/listings" element={<Protected roles={["restaurant"]}><RestaurantDashboard tab="listings" /></Protected>} />
            <Route path="/restaurant/requests" element={<Protected roles={["restaurant"]}><RestaurantDashboard tab="requests" /></Protected>} />

            <Route path="/volunteer" element={<Protected roles={["volunteer"]}><VolunteerDashboard tab="available" /></Protected>} />
            <Route path="/volunteer/mine" element={<Protected roles={["volunteer"]}><VolunteerDashboard tab="mine" /></Protected>} />

            <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard tab="overview" /></Protected>} />
            <Route path="/admin/users" element={<Protected roles={["admin"]}><AdminDashboard tab="users" /></Protected>} />
            <Route path="/admin/foods" element={<Protected roles={["admin"]}><AdminDashboard tab="foods" /></Protected>} />
            <Route path="/admin/requests" element={<Protected roles={["admin"]}><AdminDashboard tab="requests" /></Protected>} />
            <Route path="/admin/deliveries" element={<Protected roles={["admin"]}><AdminDashboard tab="deliveries" /></Protected>} />
            <Route path="/admin/analytics" element={<Protected roles={["admin"]}><AdminDashboard tab="analytics" /></Protected>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
