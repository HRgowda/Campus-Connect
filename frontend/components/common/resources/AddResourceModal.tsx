"use client"

import { useState } from 'react';
import { useAtom } from 'jotai';
import { BookOpen, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resourceAtom, selectedSubjectAtom } from '@/app/atoms/atoms';
import axiosInstance from "@/lib/axios";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const semesters = [
  { value: "P", name: "Physics Cycle" },
  { value: "C", name: "Chemistry Cycle" },
  { value: "3", name: "3rd Semester" },
  { value: "4", name: "4th Semester" },
  { value: "5", name: "5th Semester" },
  { value: "6", name: "6th Semester" },
  { value: "7", name: "7th Semester" },
  { value: "8", name: "8th Semester" },
];

export default function AddResourceModal({ isOpen, onClose }: AddResourceModalProps) {
  const [resourceName, setResourceName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [resource] = useAtom(resourceAtom);
  const [selectedSubject] = useAtom(selectedSubjectAtom);

  // Map the selected semester value to its name for display
  const selectedSemester = semesters.find((sem) => sem.value === resource?.semester)?.name || 'Not selected';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resource?.semester || !selectedSubject?.subjectCode || !file) return; // Prevent submission if required fields are missing

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceName', resourceName);
      formData.append('subjectId', selectedSubject.id);

      await axiosInstance.post("/professor/upload_resource", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccessToast("Resource added successfully!");

      setResourceName('');
      setFile(null);
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || "Error while adding resource. Please try again.";
      showErrorToast(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-700 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <BookOpen size={20} className="text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Add New Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Semester Display */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Semester</label>
            <p className="text-white px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg">
              {selectedSemester}
            </p>
          </div>

          {/* Resource Name Field */}
          <div className="space-y-2">
            <label htmlFor="resourceName" className="block text-sm font-medium text-gray-300">
              Resource Name
            </label>
            <Input
              id="resourceName"
              type="text"
              value={resourceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResourceName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter resource name"
              required
            />
          </div>

          {/* File Upload Field */}
          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-gray-300">
              Upload File
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-0 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Cancel</span>
              <X size={16} />
            </Button>
            <Button
              type="submit"
              disabled={!resource?.semester || !selectedSubject?.subjectCode || !file}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Submit</span>
              <Check size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}