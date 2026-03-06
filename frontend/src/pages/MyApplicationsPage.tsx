import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FileText,
  ArrowLeft,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  FileDown,
} from "lucide-react";
import type { ApplicationResponse, ApplicationStatus } from "../types";

const statusConfig: Record<ApplicationStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-700",
    label: "Pending",
  },
  reviewed: {
    icon: <Eye className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-700",
    label: "Reviewed",
  },
  accepted: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "bg-green-100 text-green-700",
    label: "Accepted",
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-red-100 text-red-700",
    label: "Rejected",
  },
};

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationsApi.getMyApplications();
        setApplications(data);
      } catch {
        setErrorMessage("Failed to load your applications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading your applications..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-7 h-7 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500">{applications.length} application{applications.length !== 1 ? "s" : ""} submitted</p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {errorMessage}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Applications Yet</h3>
          <p className="text-gray-400 mb-4">Browse jobs and apply to get started.</p>
          <button onClick={() => navigate("/jobs")} className="btn-primary">
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = statusConfig[application.status];
            return (
              <div key={application.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                        onClick={() => navigate(`/jobs/${application.jobId}`)}
                      >
                        {application.job.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {application.job.company.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* AI Score */}
                  {application.matchScore !== null && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 sm:min-w-[160px]">
                      <Sparkles className="w-5 h-5 text-accent-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">AI Score</p>
                        <p className={`text-xl font-bold ${
                          application.matchScore >= 70 ? "text-green-600" :
                          application.matchScore >= 40 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {application.matchScore}/100
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Reason */}
                {application.matchReason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Analysis</p>
                    <p className="text-sm text-gray-600">{application.matchReason}</p>
                  </div>
                )}

                {/* CV Info */}
                {application.cvUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${application.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4" />
                      View submitted CV
                    </a>
                  </div>
                )}

                {/* Reviewer Notes */}
                {application.reviewerNotes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recruiter Feedback</p>
                    <p className="text-sm text-gray-600">{application.reviewerNotes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
