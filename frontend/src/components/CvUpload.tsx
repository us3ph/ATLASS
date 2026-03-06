import { useRef, useState } from "react";
import { FileText, Upload, X, CheckCircle2 } from "lucide-react";

interface CvUploadProps {
  onFileSelect: (file: File | null) => void;
  existingCvUrl?: string | null;
  label?: string;
  compact?: boolean;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const CvUpload = ({
  onFileSelect,
  existingCvUrl,
  label = "Upload CV",
  compact = false,
}: CvUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Only PDF and Word documents (.pdf, .doc, .docx) are accepted.");
      event.target.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File must be smaller than ${MAX_SIZE_MB}MB.`);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (compact) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedFile ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm flex-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-green-700 truncate">{selectedFile.name}</span>
              <span className="text-green-500 text-xs flex-shrink-0">
                ({formatFileSize(selectedFile.size)})
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="ml-auto text-green-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {existingCvUrl ? "Replace CV" : "Choose File"}
            </button>
          )}
          {existingCvUrl && !selectedFile && (
            <a
              href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${existingCvUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
            >
              <FileText className="w-4 h-4" />
              View Current CV
            </a>
          )}
        </div>
        {errorMessage && (
          <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">PDF or Word, max {MAX_SIZE_MB}MB</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 truncate">{selectedFile.name}</p>
            <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-400 hover:text-red-500 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
              {existingCvUrl ? "Upload New CV" : "Upload Your CV"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PDF or Word, max {MAX_SIZE_MB}MB</p>
          </div>
        </button>
      )}

      {existingCvUrl && !selectedFile && (
        <a
          href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${existingCvUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mt-2"
        >
          <FileText className="w-4 h-4" />
          View Currently Uploaded CV
        </a>
      )}

      {errorMessage && (
        <p className="text-red-600 text-xs mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default CvUpload;
