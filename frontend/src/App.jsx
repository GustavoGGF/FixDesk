import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import Helpdesk from "./pages/helpdesk";
import History from "./pages/history";
import DashboardTI from "./dashboard/dashboardTI";
import Describe from "./pages/describe";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <Login />,
    },
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    { path: "/helpdesk", element: <Helpdesk /> },
    { path: "/helpdesk/history", element: <History /> },
    { path: "/dashboard_TI", element: <DashboardTI /> },
    { path: "/helpdesk/describe", element: <Describe /> },
  ]);
  return <RouterProvider router={router} />;
}
