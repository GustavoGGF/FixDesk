import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import Helpdesk from "./pages/helpdesk";
import History from "./pages/history";
import DashboardTI from "./pages/dashboardTI";
import { TickerProvider } from "./context/TickerContext";
import { TicketProvider } from "./context/TicketContext";
import { FilterProvider } from "./context/FilterContext";
import { MessageProvider } from "./context/MessageContext";
// import { ChatProvider } from "./context/ChatContext";

// Layout para envolver Helpdesk com o TickerProvider
const HelpdeskLayout = ({ children }) => (
  <TickerProvider>
    <MessageProvider>{children}</MessageProvider>
  </TickerProvider>
);

// Layout para envolver History e Dashboard com o TicketProvider
const TicketLayout = ({ children }) => (
  <TicketProvider>
    <FilterProvider>
      <MessageProvider>{children}</MessageProvider>
    </FilterProvider>
  </TicketProvider>
);

const UtilityLayout = ({ children }) => <MessageProvider>{children}</MessageProvider>;

export default function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: (
        <UtilityLayout>
          <Login />
        </UtilityLayout>
      ),
    },
    {
      path: "/",
      element: (
        <UtilityLayout>
          <Login />
        </UtilityLayout>
      ),
    },
    {
      path: "/login",
      element: (
        <UtilityLayout>
          <Login />
        </UtilityLayout>
      ),
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
