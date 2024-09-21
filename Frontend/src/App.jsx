import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './app/store';
import { Navbar } from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import { About } from './pages/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import Results from './components/SearchResults/SearchResults';
import Booking from './components/Booking/Booking';
import Profile from './pages/Profile/Profile';
import { Footer } from './components/Footer/Footer';
import Create from './components/Create/Create';
import Display from './shared/Display';
import Book from './components/Book/Book';

const AppRoutes = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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
      path: "/results/:location",
      element: isAuthenticated ? (
        <>
          <Navbar />
          <Results />
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
