import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiStar, FiLogOut, FiCamera, FiX } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
const Profile = ({ isOpen, onClose }) => {
  const {
    user,
    setProfileOpen,
    userDetails,
    setUserDetails,
    isLoading,
    setIsLoading,
    logout,
    emergencyContacts,
    setEmergencyContacts,
  } = useAppContext();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const token = user?.token || localStorage.getItem("token");

  // load emergency contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, [setEmergencyContacts]);

  // load user details + avatar from localStorage
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const localAvatar = localStorage.getItem("avatarUrl");
        setUserDetails({
          ...decoded,
          avatarUrl: localAvatar || decoded.avatarUrl || "",
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
        toast.error("Session is invalid. Please log in again.");
      }
    }
  }, [token, setUserDetails]);

  // save emergency contacts on change
  useEffect(() => {
    localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.warn("Please select a valid image");
    }
  };

  const handleImageUpload = async () => {
    if (!image) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("avatar", image);

      const { data } = await axios.post(
        "https://voyeger2026-backend.onrender.com/api/users/avater",
        formData,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setUserDetails((prev) => ({
        ...prev,
        avatarUrl: data.user.avatarUrl,
      }));
      localStorage.setItem("avatarUrl", data.user.avatarUrl);

      toast.success("Profile picture updated!");
      setImage(null);
      setPreview("");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-6 right-6 bottom-6 z-50 flex w-[min(92vw,34rem)] flex-col overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        >
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 transition rounded-full hover:text-red-500"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* profile picture */}
          <div className="flex flex-col items-center mb-6">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full shadow-sm sm:h-28 sm:w-28">
                {preview ? (
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                ) : userDetails?.avatarUrl ? (
                  <img src={userDetails?.avatarUrl} alt="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
                    <FiUser size={32} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full">
                <FiCamera size={14} />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {image && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleImageUpload}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-white rounded bg-cyan-500 hover:bg-cyan-600 disabled:opacity-70"
                >
                  {isLoading ? "Uploading..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                  className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* user info */}
          <div className="flex-1 mb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-gray-50">
              <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700">
                <FiUser className="text-cyan-500" /> Personal Information
              </h3>
              <div className="pl-2 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{userDetails?.name || "..."}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{userDetails?.email || "..."}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{userDetails?.phone || "..."}</p>
                </div>
              </div>
            </div>

            {/* emergency contacts */}
            <div className="p-4 rounded-2xl bg-gray-50">
              <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700">
                🧑‍🤝‍🧑 Emergency Contacts
              </h3>
              <div className="pl-2 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Mom's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.mom}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        mom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dad's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.dad}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        dad: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best Friend's Number</p>
                  <input
                    type="text"
                    value={emergencyContacts.friend}
                    onChange={(e) =>
                      setEmergencyContacts({
                        ...emergencyContacts,
                        friend: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));
                    toast.success("Emergency contacts saved!");
                  }}
                  className="w-full py-2 mt-2 text-white rounded bg-cyan-500 hover:bg-cyan-600"
                >
                  Save Emergency Contacts
                </button>
              </div>
            </div>

            {/* rewards */}
            <div className="p-4 rounded-2xl bg-gray-50">
              <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700">
                <FiStar className="text-amber-400" /> Rewards
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="font-bold text-amber-500">120 pts</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                  Silver Tier
                </span>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="pb-1 space-y-3">
            <button
              onClick={() => toast.success("Thanks for your feedback! +10 points")}
              className="flex items-center justify-center w-full gap-2 py-2 font-medium rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              <FiStar /> Give Feedback
            </button>
            <button
              onClick={() => {
                logout();
                setProfileOpen(false);
              }}
              disabled={isLoading}
              className="flex items-center justify-center w-full gap-2 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-70"
            >
              <FiLogOut /> {isLoading ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
