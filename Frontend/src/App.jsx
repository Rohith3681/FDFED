import React from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer'; // New Footer import
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Home />
          <Footer /> {/* Footer added */}
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Navbar />
          <Login />
          <Footer /> {/* Footer added */}
        </>
      ),
    },
    {
      path: "/register",
      element: (
        <>
          <Navbar />
          <Register />
          <Footer /> {/* Footer added */}
        </>
      ),
    },
    {
      path: "/about",
      element: (
        <>
          <Navbar />
          <About />
          <Footer /> {/* Footer added */}
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
