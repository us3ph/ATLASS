import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobsApi, applicationsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import MatchCard from "../components/MatchCard";
import CvUpload from "../components/CvUpload";
import {
  MapPin,
  Globe2,
  DollarSign,
  Building2,
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import type { Job, JobMatchResponse, ApplicationResponse } from "../types";

const JobDetailPage = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Application state
  const [isApplying, setIsApplying] = useState(false);
  const [applicationResult, setApplicationResult] = useState<ApplicationResponse | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        const jobData = await jobsApi.getJobById(jobId);
        setJob(jobData);
      } catch {
        setErrorMessage("Failed to load job details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleAiMatch = async () => {
    if (!jobId) return;
    setIsMatching(true);
    setErrorMessage("");

    try {
      const result = await jobsApi.matchJob(jobId);
      setMatchResult(result);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosError.response?.data?.message || "Matching failed. Please try again."
      );
    } finally {
      setIsMatching(false);
    }
  };

  const handleApply = async () => {
    if (!jobId) return;
    setIsApplying(true);
    setErrorMessage("");

    try {
      const result = await applicationsApi.applyToJob(
        jobId,
        coverLetter || undefined,
        cvFile || undefined
      );
      setApplicationResult(result);
      setShowApplyForm(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosError.response?.data?.message || "Application failed. Please try again."
      );
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading job details..." />;
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Job not found.</p>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency || "USD";
    const min = job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : "";
    const max = job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : "";
    if (min && max) return `${currency} ${min} - ${max}/year`;
    if (min) return `${currency} ${min}+/year`;
    return `Up to ${currency} ${max}/year`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* Job Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Building2 className="w-4 h-4" />
              <span>{job.company.name}</span>
            </div>
          </div>
          <span className="badge bg-green-100 text-green-700 capitalize text-sm px-3 py-1">
            {job.status}
          </span>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
          {job.isRemote && (
            <span className="flex items-center gap-1 text-primary-600 font-medium">
              <Globe2 className="w-4 h-4" />
              Remote Friendly
            </span>
          )}
          {formatSalary() && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatSalary()}
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span key={skill} className="badge-skill text-sm px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </div>

      {/* Developer Actions: Check Match & Apply */}
      {isAuthenticated && user?.role === "developer" && (
        <div className="space-y-6">
          {/* AI Match Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-500" />
                  AI Job Match
                </h2>
                <p className="text-sm text-gray-500">
                  See how well your profile matches this job using AI
                </p>
              </div>
              {!matchResult && !applicationResult && (
                <button
                  onClick={handleAiMatch}
                  disabled={isMatching}
                  className="btn-accent flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isMatching ? "Analyzing..." : "Check Match"}
                </button>
              )}
            </div>

            {isMatching && <LoadingSpinner message="AI is analyzing your match..." />}
            {matchResult && <MatchCard match={matchResult} />}
          </div>

          {/* Apply Section */}
          {!applicationResult ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary-600" />
                    Apply for this Job
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submit your application — AI will automatically score your match
                  </p>
                </div>
                {!showApplyForm && (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Apply Now
                  </button>
                )}
              </div>

              {showApplyForm && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the company why you're a great fit for this role..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* CV Upload */}
                  <CvUpload
                    onFileSelect={(file) => setCvFile(file)}
                    label="Attach Your CV"
                    compact
                  />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isApplying ? "Submitting..." : "Submit Application"}
                    </button>
                    <button
                      onClick={() => setShowApplyForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-green-800">Application Submitted!</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{applicationResult.status}</p>
                </div>
                {applicationResult.matchScore !== null && (
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Match Score</p>
                    <p className={`text-2xl font-bold ${
                      applicationResult.matchScore >= 70 ? "text-green-600" :
                      applicationResult.matchScore >= 40 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {applicationResult.matchScore}/100
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Applied</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(applicationResult.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {applicationResult.matchReason && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Analysis</p>
                  <p className="text-sm text-gray-700">{applicationResult.matchReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Shared Error */}
          {errorMessage && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
