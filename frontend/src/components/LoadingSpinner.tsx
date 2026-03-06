import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="mt-4 text-gray-500 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
