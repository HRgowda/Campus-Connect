"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import axiosInstance from "@/lib/axios"
import { X, Lock, Globe } from "lucide-react";
import { useState } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";

interface FormData {
  name: string;
  description: string;
  isPrivate: boolean;
}

interface ModalProps {
  formData: FormData;
  setFormData: (field: keyof FormData, value: string | boolean) => void;
  onClose: () => void;
}

export default function Modal({ formData, setFormData, onClose }: ModalProps) {

  const [user] = useAtom(userAtom)
  const [loading, setLoading] = useState(false)
  
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try{
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        isPrivate: formData.isPrivate,
        created_by_id: user?.id,
        created_by_role: user?.role
      }

      await axiosInstance.post("/channel/create", payload)
      showSuccessToast("Channel created successfully.")
      onClose();

    } catch(error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create channel";
      showErrorToast(errorMsg);
    } finally{
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-700 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create Channel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCreateChannel} className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Channel Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData("name", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter channel name"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData("description", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe your channel..."
            />
          </div>

          {/* Privacy Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Channel Privacy</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setFormData("isPrivate", false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  !formData.isPrivate
                    ? "bg-green-600 border-green-500 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <Globe size={16} />
                <span className="text-sm font-medium">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData("isPrivate", true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  formData.isPrivate
                    ? "bg-orange-600 border-orange-500 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <Lock size={16} />
                <span className="text-sm font-medium">Private</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-0 py-3 rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Channel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
