import type { JobMatchResponse } from "../types";

interface MatchCardProps {
  match: JobMatchResponse;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Low Match";
};

const MatchCard = ({ match }: MatchCardProps) => {
  const scoreColorClasses = getScoreColor(match.matchScore);

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{match.jobTitle}</h3>
          <p className="text-sm text-gray-500">{match.companyName}</p>
        </div>
        <div
          className={`flex flex-col items-center px-4 py-2 rounded-lg border ${scoreColorClasses}`}
        >
          <span className="text-2xl font-bold">{match.matchScore}</span>
          <span className="text-xs font-medium">{getScoreLabel(match.matchScore)}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-3">
        <p className="text-sm text-gray-700 font-medium mb-1">AI Analysis</p>
        <p className="text-sm text-gray-600 leading-relaxed">{match.matchReason}</p>
      </div>
    </div>
  );
};

export default MatchCard;
