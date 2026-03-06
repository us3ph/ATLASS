import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Briefcase, BarChart3, Zap, FileText } from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">ATLASS</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/jobs"
              className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to={user?.role === "company" ? "/applications/manage" : "/applications"}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Applications
                </Link>
                {user?.role === "developer" && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-semibold">{user?.fullName}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
