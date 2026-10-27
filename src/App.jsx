
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
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


import ExploreProjects from "./pages/ExploreProjects";
import ProjectDetails from "./pages/ProjectDetails";
import MyProposals from "./pages/MyProposals";


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />

            <main className="main-content">
              <Routes>
                {/* Freelancer: explore open projects */}
<Route
  path="/projects"
  element={
    <ProtectedRoute
      requiredRole="seller"
      customGuestMessage="Please log in as a freelancer to explore projects."
      deniedMessage="Only freelancer accounts can access project opportunities."
    >
      <ExploreProjects />
    </ProtectedRoute>
  }
/>

{/* Freelancer: view a project and submit a proposal */}
<Route
  path="/projects/:id"
  element={
    <ProtectedRoute
      requiredRole="seller"
      customGuestMessage="Please log in as a freelancer to view project details."
      deniedMessage="Only freelancer accounts can submit proposals."
    >
      <ProjectDetails />
    </ProtectedRoute>
  }
/>

{/* Freelancer: track proposal decisions */}
<Route
  path="/my-proposals"
  element={
    <ProtectedRoute
      requiredRole="seller"
      customGuestMessage="Please log in as a freelancer to view your proposals."
      deniedMessage="Only freelancer accounts can view their proposals."
    >
      <MyProposals />
    </ProtectedRoute>
  }
/>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route
                  path="/home"
                  element={<Navigate to="/" replace />}
                />
                <Route path="/explore" element={<Navigate to="/projects" replace />} />
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