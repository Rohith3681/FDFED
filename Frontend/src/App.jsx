import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import { Navbar } from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import { About } from './pages/About'; // Adjusted import path
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import Results from './components/SearchResults/SearchResults'; // Adjusted import path
import Booking from './components/Booking/Booking';
import Profile from './pages/Profile/Profile'
import { Footer } from './components/Footer/Footer';
import Create from './components/Create/Create';

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
  },
  {
    path: "/profile",
    element: (
      <>
        {/* <Navbar/> */}
        <Profile />
        <Footer />
      </>
    ),
  },
  {
    path: "/create",
    element: (
      <>
        {/* <Navbar/> */}
        <Create />
        <Footer />
      </>
    ),
  },
]);

function App() {
  return (
    <Provider store = {store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
