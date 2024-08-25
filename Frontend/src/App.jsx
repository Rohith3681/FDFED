import React from 'react';
import Home from './pages/Home/Home';
import { About } from './pages/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import Booking from './components/Booking/Booking'; // Import the Booking component
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
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
      path: "/booking/:id",
      element: (
        <>
          <Navbar />
          <Booking />
          <Footer /> 
        </>
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
