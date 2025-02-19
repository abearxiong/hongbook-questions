import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Question } from '../types/question';

interface QuestionCardProps {
  question: Question;
  onSave: (question: Question) => void;
  onDelete: (id: string) => void;
  showAnswer: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question: initialQuestion, 
  onSave, 
  onDelete,
  showAnswer 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(initialQuestion);
  const [localQuestion, setLocalQuestion] = useState(initialQuestion);

  const handleSave = () => {
    onSave(editedQuestion);
    setLocalQuestion(editedQuestion);
    setIsEditing(false);
  };

  const toggleShowInReview = async () => {
    const updatedQuestion = { 
      ...localQuestion, 
      showInReview: !localQuestion.showInReview 
    };
    setLocalQuestion(updatedQuestion);
    onSave(updatedQuestion);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-gray-900 flex items-center">
              <span className="text-xs text-gray-500 mr-2">Question {localQuestion.id}</span>
            </h3>
            <button
              onClick={toggleShowInReview}
              className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                localQuestion.showInReview
                  ? 'text-green-700 bg-green-50 hover:bg-green-100'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
              title={localQuestion.showInReview ? 'Shown in review' : 'Hidden in review'}
            >
              {localQuestion.showInReview ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-gray-600 line-clamp-5 overflow-y-auto max-h-[120px] whitespace-pre-wrap">
            {localQuestion.question}
          </p>
          {showAnswer && (
            <p className="mt-2 font-medium line-clamp-5 overflow-y-auto max-h-[120px] whitespace-pre-wrap">
              Answer: {localQuestion.answer}
            </p>
          )}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(localQuestion.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                <span className="text-xs text-gray-500">Question {localQuestion.id}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  className="mt-1 block w-full text-sm rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 min-h-[100px] resize-y"
                  value={editedQuestion.question}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full text-sm rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 resize-y"
                  value={editedQuestion.answer}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showInReview"
                  checked={editedQuestion.showInReview}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, showInReview: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showInReview" className="text-sm font-medium text-gray-700">
                  Show in Review Mode
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};