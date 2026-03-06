import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">WAZZAL</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting Moroccan and African software engineers with global
              tech companies, remote jobs, and open-source projects using AI.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Create Account</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <p className="text-sm leading-relaxed">
              WAZZAL uses AI-powered matching to connect African talent with
              the best global opportunities. Built with passion from Morocco.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} WAZZAL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
