import { useState, useEffect } from "react";
import { jobsApi } from "../services/api";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter } from "lucide-react";
import type { Job } from "../types";

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsList = await jobsApi.getAllJobs();
        setJobs(jobsList);
        setFilteredJobs(jobsList);
      } catch {
        setErrorMessage("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let results = jobs;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.description.toLowerCase().includes(lowerQuery) ||
          job.requiredSkills.some((skill) =>
            skill.toLowerCase().includes(lowerQuery)
          ) ||
          job.company.name.toLowerCase().includes(lowerQuery)
      );
    }

    if (remoteOnly) {
      results = results.filter((job) => job.isRemote);
    }

    setFilteredJobs(results);
  }, [searchQuery, remoteOnly, jobs]);

  if (isLoading) return <LoadingSpinner message="Loading jobs..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">
          Discover global opportunities tailored for African engineers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs, skills, companies..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
            remoteOnly
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Remote Only
        </button>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {/* Results */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <div className="text-center mt-8 text-sm text-gray-400">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
    </div>
  );
};

export default JobsPage;
