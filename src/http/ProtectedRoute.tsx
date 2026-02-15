import { Navigate } from "react-router";
import getRole from "../http/Role";

type ProtectedRouteProps = {
  children: JSX.Element;
  roles?: string[]; 
};

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const userRole = getRole(); 

  if (userRole == null) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

