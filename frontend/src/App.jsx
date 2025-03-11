import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import Helpdesk from "./pages/helpdesk";
import History from "./pages/history";
import DashboardTI from "./dashboard/dashboardTI";
import { TickerProvider } from "./services/TickerContext";
import { TicketProvider } from "./services/TicketContext";

// Layout para envolver Helpdesk com o TickerProvider
const HelpdeskLayout = ({ children }) => <TickerProvider>{children}</TickerProvider>;

// Layout para envolver History e Dashboard com o TicketProvider
const TicketLayout = ({ children }) => <TicketProvider>{children}</TicketProvider>;

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
    {
      path: "/helpdesk",
      element: (
        <HelpdeskLayout>
          <Helpdesk />
        </HelpdeskLayout>
      ),
    },
    {
      path: "/helpdesk/history",
      element: (
        <TicketLayout>
          <History />
        </TicketLayout>
      ),
    },
    {
      path: "/dashboard_TI",
      element: (
        <TicketLayout>
          <DashboardTI />
        </TicketLayout>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}
