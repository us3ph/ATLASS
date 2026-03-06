import { MapPin, Building2, DollarSign, Globe2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency || "USD";
    const min = job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k` : "";
    const max = job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}k` : "";
    if (min && max) return `${currency} ${min} - ${max}`;
    if (min) return `${currency} ${min}+`;
    return `Up to ${currency} ${max}`;
  };

  const timeAgo = () => {
    const diffMs = Date.now() - new Date(job.createdAt).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="card group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <Link
            to={`/jobs/${job.id}`}
            className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>{job.company.name}</span>
          </div>
        </div>
        <span className="badge bg-green-100 text-green-700 capitalize">{job.status}</span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requiredSkills.slice(0, 5).map((skill) => (
          <span key={skill} className="badge-skill">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 5 && (
          <span className="badge bg-gray-100 text-gray-600">
            +{job.requiredSkills.length - 5}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {job.location}
        </span>
        {job.isRemote && (
          <span className="flex items-center gap-1 text-primary-600">
            <Globe2 className="w-3.5 h-3.5" />
            Remote
          </span>
        )}
        {formatSalary() && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {formatSalary()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo()}
        </span>
      </div>
    </div>
  );
};

export default JobCard;
