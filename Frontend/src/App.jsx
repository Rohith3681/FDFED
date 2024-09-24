import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './app/store';
import { Navbar } from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import { About } from './pages/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import SearchResults from './components/SearchResults/SearchResults';
import Booking from './components/Booking/Booking';
import Profile from './pages/Profile/Profile';
import { Footer } from './components/Footer/Footer';
import Create from './components/Create/Create';
import Display from './shared/Display';
import Book from './components/Book/Book';
import Admin from './components/AdminLogin/AdminLogin';
import AddAdmin from './components/Admin/AddAdmin/AddAdmin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Statistics from './components/Admin/Statistics/Statistics';
import Customers from './components/Admin/Customers/Customers';
import Tours from './components/Admin/Tours/Tours';

const AppRoutes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Home />
          <Footer />
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Navbar />
          <Login />
          <Footer />
        </>
      ),
    },
    {
      path: "/adminLogin",
      element: (
        <>
          <Navbar />
          <Admin />
          <Footer />
        </>
      ),
    },
    {
      path: "/register",
      element: (
        <>
          <Navbar />
          <Register />
          <Footer />
        </>
      ),
    },
    {
      path: "/about",
      element: (
        <>
          <Navbar />
          <About />
          <Footer />
        </>
      ),
    },
    {
      path: "/results",
      element: isAuthenticated ? (
        <>
          <Navbar />
          <SearchResults />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: "/booking",
      element: isAuthenticated ? (
        <>
          {/* <Navbar /> */}
          <Booking />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: "/profile",
      element: isAuthenticated ? (
        <>
          <Navbar />
          <Profile />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: "/create",
      element: isAuthenticated ? (
        <>
          <Navbar />
          <Create />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: "/Admin",
      element: isAuthenticated && role == '5150'? (
        <>
          <AdminDashboard />
          <Footer />
        </>
      ) : null
    },
    {
      path: "/book",
      element: isAuthenticated ? (
        <>
          {/* <Navbar /> */}
          <Book />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: "/display",
      element: isAuthenticated ? (
        <>
          <Navbar />
          <Display />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: '/statistics',
      element: isAuthenticated && role === '5150' ? (
        <div className="dashboard-container">
          <AdminDashboard />
          <Statistics />
        </div>
      ) : null
    },    
    {
      path: '/customers',
      element: isAuthenticated && role == '5150'? (
        <>
          <div className="dashboard-container">
            <AdminDashboard />
            <Customers />
          </div>
        </>
      ) : null
    },
    {
      path: '/tours',
      element: isAuthenticated && role == '5150'? (
        <>
          <div className="dashboard-container">
            <AdminDashboard />
            <Tours />
          </div>
        </>
      ) : null
    },
    {
      path: "/AddAdmin",
      element: isAuthenticated && role == '5150'? (
        <>
          <div className="dashboard-container">
            <AdminDashboard />
            <AddAdmin />
          </div>
        </>
      ) : null
    },
    {
      path: '/bookings',
      element: (
        <>
          <Navbar />
          <Home />
          <Footer />
        </>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
