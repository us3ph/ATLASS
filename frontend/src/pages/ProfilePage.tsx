import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  User,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Save,
  X,
  Plus,
} from "lucide-react";
import type { DeveloperProfile, UpdateProfilePayload } from "../types";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<UpdateProfilePayload>({});
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const profileData = await profileApi.getProfile(user.id);
        setProfile(profileData);
        setFormData({
          bio: profileData.bio,
          skills: profileData.skills,
          experienceYears: profileData.experienceYears,
          githubUrl: profileData.githubUrl || "",
          linkedinUrl: profileData.linkedinUrl || "",
          portfolioUrl: profileData.portfolioUrl || "",
          location: profileData.location,
          availableForRemote: profileData.availableForRemote,
        });
      } catch {
        setErrorMessage("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedProfile = await profileApi.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosError.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((previous) => ({
        ...previous,
        skills: [...(previous.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((previous) => ({
      ...previous,
      skills: previous.skills?.filter((skill) => skill !== skillToRemove) || [],
    }));
  };

  if (isLoading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your developer profile</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.user.fullName || user?.fullName}
            </h2>
            <p className="text-gray-500">{profile?.user.email || user?.email}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={formData.bio || ""}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, bio: event.target.value }))
              }
              className="input-field h-32 resize-none"
              placeholder="Tell companies about yourself..."
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">
              {profile?.bio || "No bio yet. Edit your profile to add one."}
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(isEditing ? formData.skills : profile?.skills)?.map((skill) => (
              <span key={skill} className="badge-skill flex items-center gap-1">
                {skill}
                {isEditing && (
                  <button onClick={() => removeSkill(skill)}>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {(!isEditing && (!profile?.skills || profile.skills.length === 0)) && (
              <span className="text-gray-400 text-sm">No skills added yet.</span>
            )}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addSkill())}
                className="input-field max-w-xs"
                placeholder="Add a skill..."
              />
              <button onClick={addSkill} className="btn-secondary flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Experience & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Years of Experience
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears || 0}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    experienceYears: parseInt(event.target.value, 10) || 0,
                  }))
                }
                className="input-field"
              />
            ) : (
              <p className="text-gray-600">{profile?.experienceYears || 0} years</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location || ""}
                onChange={(event) =>
                  setFormData((previous) => ({ ...previous, location: event.target.value }))
                }
                className="input-field"
                placeholder="e.g. Casablanca, Morocco"
              />
            ) : (
              <p className="text-gray-600">{profile?.location || "Not specified"}</p>
            )}
          </div>
        </div>

        {/* Remote Availability */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isEditing ? formData.availableForRemote : profile?.availableForRemote}
              onChange={(event) =>
                isEditing &&
                setFormData((previous) => ({
                  ...previous,
                  availableForRemote: event.target.checked,
                }))
              }
              disabled={!isEditing}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Available for remote work
            </span>
          </label>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Links</h3>
          {[
            { key: "githubUrl" as const, icon: Github, label: "GitHub" },
            { key: "linkedinUrl" as const, icon: Linkedin, label: "LinkedIn" },
            { key: "portfolioUrl" as const, icon: Globe, label: "Portfolio" },
          ].map(({ key, icon: Icon, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="url"
                  value={(formData[key] as string) || ""}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, [key]: event.target.value }))
                  }
                  className="input-field"
                  placeholder={`${label} URL`}
                />
              ) : (
                <span className="text-gray-600">
                  {(profile?.[key] as string) ? (
                    <a
                      href={profile![key] as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {profile![key] as string}
                    </a>
                  ) : (
                    `No ${label} URL`
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
