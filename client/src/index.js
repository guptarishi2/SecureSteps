import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Reg from './Components/Reg'
import Nav from './Components/Nav';
import Det from './Components/Detail';
import Log from './Components/Log';
import Loc from './Components/Loc';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Location from './Components/Map';
import { AuthProvider } from './context/authcontext';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App/>
    ),
  },
  {
    path: "Register",
    element: <Reg/>,
  },
  {
    path: "Details",
    element: <Det/>,
  },
  {
    path: "Share-Location",
    element: <Loc/>,
  },
  {
    path: "Log-in",
    element: <Log/>,
  },
  {
    path: "*",
    element: <App/>,
  },
  {
    path:"/maplocation/:id",
    element:<Location></Location>
  }
]);


createRoot(document.getElementById("root")).render(
  <AuthProvider>
  <RouterProvider router={router} />
  </AuthProvider>
);

reportWebVitals();