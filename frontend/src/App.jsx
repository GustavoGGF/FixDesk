import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { FilterProvider } from "./context/FilterContext";
import { MessageProvider } from "./context/MessageContext";
import { OptionsProvider } from "./context/OptionsContext";
import { TicketProvider } from "./context/TicketContext";
import { UserManagementProvider } from "./context/UserManagement";
import { AreaProvider } from "./context/AreaContext";
import Dashboard from "./pages/dashboard";
import Helpdesk from "./pages/helpdesk";
import History from "./pages/history";
import Login from "./pages/login";
import ManageUser from "./pages/manageUser";

// import { ChatProvider } from "./context/ChatContext";

// Layout para envolver Helpdesk com o TickerProvider
const HelpdeskLayout = ({ children }) => (
	<AreaProvider>
		<OptionsProvider>
			<MessageProvider>{children}</MessageProvider>
		</OptionsProvider>
	</AreaProvider>
);

// Layout para envolver History e Dashboard com o TicketProvider
const TicketLayout = ({ children }) => (
	<AreaProvider>
		<TicketProvider>
			<FilterProvider>
				<MessageProvider>
					<UserManagementProvider>{children}</UserManagementProvider>
				</MessageProvider>
			</FilterProvider>
		</TicketProvider>
	</AreaProvider>
);

const UtilityLayout = ({ children }) => (
	<MessageProvider>{children}</MessageProvider>
);

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
			path: "/dashboard/:sector?",
			element: (
				<TicketLayout>
					<Dashboard />
				</TicketLayout>
			),
		},
		{
			path: "/dashboard-ti",
			element: (
				<TicketLayout>
					<Dashboard />
				</TicketLayout>
			),
		},
		{
			path: "/gerenciar-usuarios",
			element: (
				<TicketLayout>
					<ManageUser />
				</TicketLayout>
			),
		},
	]);
	return <RouterProvider router={router} />;
}
