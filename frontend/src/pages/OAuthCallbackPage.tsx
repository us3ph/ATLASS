import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { AlertCircle } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setErrorMessage("Authentication failed. Please try again.");
      return;
    }

    if (code) {
      const exchangeCode = async () => {
        try {
          const response = await axios.post(`${API_URL}/auth/exchange`, { code });
          const { token, user } = response.data.data;
          loginWithToken(token, user);
          navigate("/dashboard", { replace: true });
        } catch {
          setErrorMessage("Failed to complete authentication. The code may have expired.");
        }
      };
      exchangeCode();
    } else {
      setErrorMessage("Missing authentication data.");
    }
  }, [searchParams, loginWithToken, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner message="Completing sign in..." />;
};

export default OAuthCallbackPage;
