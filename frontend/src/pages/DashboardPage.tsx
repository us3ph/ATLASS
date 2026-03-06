import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardApi, jobsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import MatchCard from "../components/MatchCard";
import {
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  FileText,
} from "lucide-react";
import type { DashboardStats, JobMatchResponse } from "../types";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myMatches, setMyMatches] = useState<JobMatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await dashboardApi.getStats();
        setStats(statsData);

        if (user?.role === "developer") {
          try {
            const matches = await jobsApi.getMyMatches();
            setMyMatches(matches);
          } catch {
            // No matches yet — that's fine
          }
        }
      } catch {
        setErrorMessage("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    {
      label: "Total Developers",
      value: stats?.totalDevelopers ?? 0,
      icon: Users,
      color: "bg-primary-100 text-primary-600",
    },
    {
      label: "Open Jobs",
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "AI Matches",
      value: stats?.totalMatches ?? 0,
      icon: Sparkles,
      color: "bg-accent-100 text-accent-600",
    },
    {
      label: "Applications",
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening on ATLASS
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/jobs"
          className="card flex items-center justify-between group"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Browse Jobs</h3>
            <p className="text-sm text-gray-500">Discover opportunities matching your skills</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </Link>
        <Link
          to="/profile"
          className="card flex items-center justify-between group"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
            <p className="text-sm text-gray-500">Keep your skills and info up to date</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </Link>
        {user?.role === "developer" && (
          <Link
            to="/applications"
            className="card flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Applications</h3>
              <p className="text-sm text-gray-500">Track your job applications & status</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </Link>
        )}
        {user?.role === "company" && (
          <Link
            to="/applications/manage"
            className="card flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Applications</h3>
              <p className="text-sm text-gray-500">Review & respond to applicants</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </Link>
        )}
      </div>

      {/* My Matches (Developer Only) */}
      {user?.role === "developer" && myMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-500" />
            Your AI Matches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myMatches.map((match) => (
              <MatchCard key={match.jobId} match={match} />
            ))}
          </div>
        </div>
      )}

      {user?.role === "developer" && myMatches.length === 0 && (
        <div className="card text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No matches yet</h3>
          <p className="text-gray-500 mb-6">
            Browse jobs and use AI matching to find your best opportunities
          </p>
          <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
            Explore Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
