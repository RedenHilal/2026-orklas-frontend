import { createBrowserRouter } from "react-router"
import { RouterProvider } from "react-router/dom"
import RootLayout from "./layouts/RootLayout"
import LoginPage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import RoomsPage from "./pages/RoomPage"
import RoomDetailPage from "./pages/RoomDetailPage"
import SchedulesPage from "./pages/SchedulePage"
import ReservationsPage from "./pages/ReservationsPage"
//import UsersPage from "./pages/UsersPage"
//import UserDetailPage from "./pages/UserDetailPage"
import NotFoundPage from "./pages/NotFoundPage"
import ProtectedRoute from "./http/ProtectedRoute"

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element:
		<ProtectedRoute>
			<RootLayout />
		</ProtectedRoute>, 
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "rooms",
        element: <RoomsPage />,
      },
      {
        path: "rooms/:roomId",
        element: <RoomDetailPage />,
      },
      {
        path: "rooms/:roomId/schedules",
        element: <SchedulesPage />,
      },
      {
        path: "schedules",
        element: <SchedulesPage />,
      },
      {
        path: "reservations",
        element: <ReservationsPage />,
      },
//      {
//        path: "users",
//        element: <UsersPage />,
//      },
//      {
//        path: "users/:id",
//        element: <UserDetailPage />,
//      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App

