import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) return navigate("/login");

  return <div>{children}</div>;
};

export default ProtectedRoutes;
