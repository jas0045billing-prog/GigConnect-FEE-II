
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import GigDetails from "./pages/GigDetails";
import SellerProfile from "./pages/SellerProfile";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import CreateGig from "./pages/CreateGig";
import MyProjects from "./pages/MyProjects";
import ManageOrders from "./pages/ManageOrders";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />

            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route
                  path="/home"
                  element={<Navigate to="/" replace />}
                />
                <Route path="/explore" element={<Explore />} />
                <Route path="/gig/:id" element={<GigDetails />} />
                <Route path="/seller/:id" element={<SellerProfile />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Existing Orders Route */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute
                      requiredRole="buyer"
                      customGuestMessage="Please log in to view your orders."
                      deniedMessage="This section is for buyers."
                    >
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Client Route: Post a Project */}
                <Route
                  path="/create-gig"
                  element={
                    <ProtectedRoute
                      requiredRole="client"
                      customGuestMessage="Please log in or sign up as a client to post a project."
                      deniedMessage="Only clients can post projects."
                    >
                      <CreateGig />
                    </ProtectedRoute>
                  }
                />

                {/* Client Route: My Projects */}
                <Route
                  path="/my-projects"
                  element={
                    <ProtectedRoute
                      requiredRole="client"
                      customGuestMessage="Please log in or sign up to view your projects."
                      deniedMessage="Only clients can view their projects."
                    >
                      <MyProjects />
                    </ProtectedRoute>
                  }
                />

                {/* Existing Seller Route: Manage Orders */}
                <Route
                  path="/manage-orders"
                  element={
                    <ProtectedRoute
                      requiredRole="seller"
                      customGuestMessage="Please log in as a seller to manage orders."
                      deniedMessage="Only sellers can access Manage Orders."
                    >
                      <ManageOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Common Protected Route: Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      customGuestMessage="Please log in to access your dashboard."
                    >
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;