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
import ManageOrders from "./pages/ManageOrders";

import NotFound from "./pages/NotFound";

// ============================================================================
// VIVA EXPLANATION: Application Root, Providers & Route Protection Hierarchy
// 1. AuthProvider: Provides global authentication state (currentUser, login, logout).
// 2. ThemeProvider: Provides dynamic dark/light mode context.
// 3. ProtectedRoute: Enforces authentication and role-based permissions at the route level.
// ============================================================================

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
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/gig/:id" element={<GigDetails />} />
                <Route path="/seller/:id" element={<SellerProfile />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Buyer Protected Route (Requirement 9 & 15) */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute
                      requiredRole="buyer"
                      customGuestMessage="Please login or signup to view your orders."
                      deniedMessage="This orders section is for buyers. Sellers can track client orders in Manage Orders."
                    >
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Seller Protected Route: Create Gig (Requirement 4, 5 & 15) */}
                <Route
                  path="/create-gig"
                  element={
                    <ProtectedRoute
                      requiredRole="seller"
                      customGuestMessage="Please login or signup as a seller to create a gig."
                      deniedMessage="Only sellers can create gigs."
                    >
                      <CreateGig />
                    </ProtectedRoute>
                  }
                />

                {/* Seller Protected Route: Manage Orders (Requirement 11 & 15) */}
                <Route
                  path="/manage-orders"
                  element={
                    <ProtectedRoute
                      requiredRole="seller"
                      customGuestMessage="Please login or signup as a seller to manage orders."
                      deniedMessage="Only sellers can access the Manage Orders panel."
                    >
                      <ManageOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Common Protected Route: Dashboard (Requirement 12, 13 & 15) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute customGuestMessage="Please login or signup to access your dashboard.">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 - Keep this LAST */}
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