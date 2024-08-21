import React from 'react';
import { Home } from './components/Home';
import { About } from './components/About';
import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import {Navbar} from './components/Navbar/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar/><Home/></>
    },
    {
      path: "/login",
      element: <><Navbar/><Login/></>
    },
    {
      path: "/register",
      element: <><Navbar/><Register/></>
    },
    {
      path: "/about",
      element: <><Navbar/><About/></>
    },
  ])
  return (
    <>
      <RouterProvider router = {router}/>
    </>
  )
}

export default App
