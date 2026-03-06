import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applicationsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Users,
  ArrowLeft,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Mail,
  Briefcase,
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

const RecruiterApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationsApi.getCompanyApplications();
        setApplications(data);
      } catch {
        setErrorMessage("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(applicationId);
    try {
      const updated = await applicationsApi.updateStatus(
        applicationId,
        newStatus,
        reviewerNotes[applicationId] || undefined
      );
      setApplications((prev) =>
        prev.map((applicationItem) => (applicationItem.id === applicationId ? updated : applicationItem))
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosError.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((applicationItem) => applicationItem.status === filterStatus);

  // Group by job for better organization
  const groupedByJob = filteredApplications.reduce<Record<string, ApplicationResponse[]>>((acc, applicationItem) => {
    const jobKey = applicationItem.jobId;
    if (!acc[jobKey]) acc[jobKey] = [];
    acc[jobKey].push(applicationItem);
    return acc;
  }, {});

  if (isLoading) return <LoadingSpinner message="Loading applications..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500">
              {applications.length} total application{applications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          {(["all", "pending", "reviewed", "accepted", "rejected"] as const).map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === statusKey
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {statusKey === "all" ? "All" : statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {errorMessage}
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Applications Found</h3>
          <p className="text-gray-400">
            {filterStatus === "all"
              ? "No one has applied to your jobs yet."
              : `No ${filterStatus} applications.`}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByJob).map(([jobId, jobApplications]) => {
            const jobInfo = jobApplications[0].job;
            return (
              <div key={jobId}>
                {/* Job Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h2
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  >
                    {jobInfo.title}
                  </h2>
                  <span className="text-sm text-gray-400">
                    ({jobApplications.length} applicant{jobApplications.length !== 1 ? "s" : ""})
                  </span>
                </div>

                <div className="space-y-3">
                  {jobApplications.map((application) => {
                    const status = statusConfig[application.status];
                    const isUpdating = updatingId === application.id;
                    return (
                      <div key={application.id} className="card">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Developer Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900">
                                {application.developer.user.fullName}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {application.developer.user.email}
                              </span>
                              {application.developer.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {application.developer.location}
                                </span>
                              )}
                              <span className="text-gray-400">
                                {application.developer.experienceYears} yrs exp
                              </span>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {application.developer.skills.slice(0, 8).map((skill) => (
                                <span key={skill} className="badge-skill text-xs px-2 py-0.5">
                                  {skill}
                                </span>
                              ))}
                              {application.developer.skills.length > 8 && (
                                <span className="text-xs text-gray-400">
                                  +{application.developer.skills.length - 8} more
                                </span>
                              )}
                            </div>

                            {/* Cover Letter */}
                            {application.coverLetter && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cover Letter</p>
                                <p className="text-sm text-gray-600">{application.coverLetter}</p>
                              </div>
                            )}

                            {/* CV Download */}
                            {(application.cvUrl || application.developer.cvUrl) && (
                              <div className="mt-2">
                                <a
                                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${application.cvUrl || application.developer.cvUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                  {application.cvUrl ? "Download Application CV" : "Download Profile CV"}
                                </a>
                              </div>
                            )}

                            {/* Applied date */}
                            <p className="text-xs text-gray-400 mt-2">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* AI Score + Actions */}
                          <div className="lg:w-64 flex-shrink-0 space-y-3">
                            {/* AI Match Score */}
                            {application.matchScore !== null && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-accent-500" />
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">AI Match</p>
                                </div>
                                <p className={`text-3xl font-bold mb-1 ${
                                  application.matchScore >= 70 ? "text-green-600" :
                                  application.matchScore >= 40 ? "text-yellow-600" : "text-red-600"
                                }`}>
                                  {application.matchScore}/100
                                </p>
                                {application.matchReason && (
                                  <p className="text-xs text-gray-500 leading-relaxed">
                                    {application.matchReason}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            {application.status === "pending" && (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  placeholder="Reviewer notes (optional)..."
                                  value={reviewerNotes[application.id] || ""}
                                  onChange={(e) =>
                                    setReviewerNotes((prev) => ({
                                      ...prev,
                                      [application.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleStatusUpdate(application.id, "accepted")}
                                    disabled={isUpdating}
                                    className="flex-1 bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {isUpdating ? "..." : "Accept"}
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application.id, "rejected")}
                                    disabled={isUpdating}
                                    className="flex-1 bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    {isUpdating ? "..." : "Reject"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicationsPage;
