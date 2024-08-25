import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import { About }from './pages/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import Results from './components/SearchResults/SearchResults'; // Import Results component
import Booking from './components/Booking/Booking'; // Import Booking component

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
      path: "/results/:location",
      element: (
        <>
          <Navbar />
          <Results />
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
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
