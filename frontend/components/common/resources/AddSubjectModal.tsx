import { useState } from 'react';
import { useAtom } from 'jotai';
import { BookOpen, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resourceAtom } from '@/app/atoms/atoms';
import axiosInstance from "@/lib/axios"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"

interface SubjectData {
  subjectName: string;
  subjectCode: string;
  semester: string;
}

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectData) => void;
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

export default function AddSubjectModal({ isOpen, onClose, onSubmit }: AddSubjectModalProps) {
  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [resource] = useAtom(resourceAtom);
  const semester = resource?.semester

  // Map the selected semester value to its name for display
  const selectedSemester = semesters.find((sem) => sem.value === resource?.semester)?.name || 'Not selected';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resource?.semester) return; // Prevent submission if no semester is selected
    
    try{
      await axiosInstance.post("/professor/add_subject", {
        subjectName, subjectCode, semester
      })

      showSuccessToast("Subject added successfully!")

      onClose();

    } catch(error: any) {

      const errorMessage =
        error?.response?.data?.detail || "Error while logging in. Please try again."
      showErrorToast(errorMessage)

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
            <h2 className="text-xl font-semibold text-white">Add New Subject</h2>
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

          {/* Subject Name Field */}
          <div className="space-y-2">
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-300">
              Subject Name
            </label>
            <Input
              id="subjectName"
              type="text"
              value={subjectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjectName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter subject name"
              required
            />
          </div>

          {/* Subject Code Field */}
          <div className="space-y-2">
            <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-300">
              Subject Code
            </label>
            <Input
              id="subjectCode"
              type="text"
              value={subjectCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjectCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter subject code"
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
              disabled={!resource?.semester}
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