import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Search, Trash2, Eye, EyeOff, HelpCircle, ToggleLeft, X, Save, ArrowUpDown } from 'lucide-react';
import { parse, stringify } from 'yaml';
import toast from 'react-hot-toast';
import { Question, filterQuestions } from '../types/question';
import { QuestionCard } from '../components/QuestionCard';
import { HelpDialog } from '../components/HelpDialog';
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion, clearAllQuestions } from '../utils/db';

const SHOW_ANSWERS_KEY = 'questionBank_showAnswers';
const EXPORT_FORMAT_KEY = 'questionBank_exportFormat';
const SORT_ORDER_KEY = 'questionBank_sortOrder';

type ExportFormat = 'json' | 'yaml';
type SortOrder = 'asc' | 'desc' | 'none';

export const Home: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAnswers, setShowAnswers] = useState(() => {
    return localStorage.getItem(SHOW_ANSWERS_KEY) !== 'false';
  });
  const [exportFormat, setExportFormat] = useState<ExportFormat>(() => {
    return (localStorage.getItem(EXPORT_FORMAT_KEY) as ExportFormat) || 'json';
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    return (localStorage.getItem(SORT_ORDER_KEY) as SortOrder) || 'none';
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    localStorage.setItem(SHOW_ANSWERS_KEY, showAnswers.toString());
  }, [showAnswers]);

  useEffect(() => {
    localStorage.setItem(EXPORT_FORMAT_KEY, exportFormat);
  }, [exportFormat]);

  useEffect(() => {
    localStorage.setItem(SORT_ORDER_KEY, sortOrder);
  }, [sortOrder]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const loadedQuestions = await getAllQuestions();
      setQuestions(loadedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
    setIsLoading(false);
  };

  const handleAddQuestion = async () => {
    const newQuestion = {
      id: 'temp-' + Date.now(),
      question: '',
      answer: '',
      showInReview: true,
    };
    setEditingQuestion(newQuestion);
  };

  const handleSaveQuestion = async (question: Question) => {
    try {
      let savedQuestion: Question;

      if (question.id.startsWith('temp-')) {
        // This is a new question
        const { id, ...newQuestion } = question;
        const newId = await addQuestion(newQuestion);
        savedQuestion = { ...question, id: newId };

        // Add the new question to the state
        setQuestions((prevQuestions) => [...prevQuestions, savedQuestion]);
      } else {
        // This is an existing question
        await updateQuestion(question);
        savedQuestion = question;

        // Update the existing question in the state
        setQuestions((prevQuestions) => prevQuestions.map((q) => (q.id === question.id ? question : q)));
      }

      setEditingQuestion(null);
      toast.success(question.id.startsWith('temp-') ? 'New question added' : 'Question updated');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
      toast.success('Question deleted');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleClearAll = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      await clearAllQuestions();
      setQuestions([]);
      toast.success('All questions cleared');
    } catch (error) {
      console.error('Error clearing questions:', error);
      toast.error('Failed to clear questions');
    } finally {
      setShowClearConfirm(false);
    }
  };

  const handleExport = () => {
    try {
      const data = exportFormat === 'json' ? JSON.stringify(questions, null, 2) : stringify(questions);

      const dataUri = `data:${exportFormat === 'json' ? 'application/json' : 'text/yaml'};charset=utf-8,${encodeURIComponent(data)}`;
      const exportFileName = `questions.${exportFormat}`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();

      toast.success(`Questions exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting questions:', error);
      toast.error('Failed to export questions');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importedQuestions = file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? parse(content) : JSON.parse(content);
          let questions: any[] = [];
          if (Array.isArray(importedQuestions)) {
            questions = importedQuestions;
          } else if (importedQuestions.questions && Array.isArray(importedQuestions.questions)) {
            questions = importedQuestions.questions;
          } else {
            toast.error('Invalid file format, no questions array.');
            throw new Error('Invalid file format');
          }
          console.log('questions:', questions);
          for (const question of questions) {
            await addQuestion(question);
          }
          await loadQuestions();
          toast.success('Questions imported successfully');
        } catch (error) {
          console.error('Error importing questions:', error);
          toast.error('Failed to import questions. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleAnswersVisibility = () => {
    setShowAnswers(!showAnswers);
    toast.success(showAnswers ? 'Answers hidden' : 'Answers shown');
  };

  const toggleExportFormat = () => {
    setExportFormat((current) => (current === 'json' ? 'yaml' : 'json'));
    toast.success(`Export format changed to ${exportFormat === 'json' ? 'YAML' : 'JSON'}`);
  };

  const toggleAllReviewStatus = async () => {
    try {
      const allHidden = questions.every((q) => !q.showInReview);
      const updatedQuestions = questions.map((q) => ({
        ...q,
        showInReview: allHidden,
      }));

      for (const question of updatedQuestions) {
        await updateQuestion(question);
      }

      setQuestions(updatedQuestions);
      toast.success(allHidden ? 'All questions shown in review' : 'All questions hidden from review');
    } catch (error) {
      console.error('Error toggling review status:', error);
      toast.error('Failed to update questions');
    }
  };

  const toggleSortOrder = () => {
    const newOrder: SortOrder = sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
    setSortOrder(newOrder);
    toast.success(`Sorting ${newOrder === 'none' ? 'disabled' : `${newOrder}ending`}`);
  };

  const getSortedQuestions = (questions: Question[]) => {
    if (sortOrder === 'none') return questions;

    return [...questions].sort((a, b) => {
      const aText = a.question.trim().toLowerCase();
      const bText = b.question.trim().toLowerCase();

      if (sortOrder === 'asc') {
        return aText.localeCompare(bText);
      } else {
        return bText.localeCompare(aText);
      }
    });
  };

  const filteredQuestions = getSortedQuestions(filterQuestions(questions, searchTerm));
  const allHidden = questions.length > 0 && questions.every((q) => !q.showInReview);

  return (
    <div className='h-full bg-gray-100'>
      <div className='bg-white shadow-sm'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col space-y-4 py-4'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0'>
              <div className='flex items-center space-x-4'>
                <h1 className='text-3xl font-bold text-gray-900'>Question Bank</h1>
                <button
                  onClick={() => setShowHelpDialog(true)}
                  className='inline-flex items-center p-2 text-gray-400 hover:text-gray-500'
                  title='Help & Documentation'>
                  <HelpCircle className='w-6 h-6' />
                </button>
              </div>
              <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
                <button
                  onClick={toggleAnswersVisibility}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    showAnswers
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}>
                  {showAnswers ? (
                    <>
                      <EyeOff className='w-4 h-4 mr-2' />
                      Hide Answers
                    </>
                  ) : (
                    <>
                      <Eye className='w-4 h-4 mr-2' />
                      Show Answers
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddQuestion}
                  className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Question
                </button>
                <div className='flex items-center gap-2 flex-1 sm:flex-none'>
                  <button
                    onClick={handleExport}
                    className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50'>
                    <Download className='w-4 h-4 mr-2' />
                    Export ({exportFormat.toUpperCase()})
                  </button>
                  <button
                    onClick={toggleExportFormat}
                    className='px-2 py-2 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50'
                    title={`Switch to ${exportFormat === 'json' ? 'YAML' : 'JSON'}`}>
                    {exportFormat === 'json' ? 'YAML' : 'JSON'}
                  </button>
                </div>
                <label className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'>
                  <Upload className='w-4 h-4 mr-2' />
                  Import
                  <input type='file' accept='.json,.yaml,.yml' onChange={handleImport} className='hidden' />
                </label>
                <button
                  onClick={handleClearAll}
                  className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50'>
                  <Trash2 className='w-4 h-4 mr-2' />
                  Clear All
                </button>
              </div>
            </div>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  placeholder='Search questions...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                />
              </div>
              <button
                onClick={toggleSortOrder}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  sortOrder !== 'none'
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
                title={sortOrder === 'none' ? 'Enable sorting' : `Sorting ${sortOrder}ending`}>
                <ArrowUpDown className='w-4 h-4 mr-2' />
                {sortOrder === 'none' ? 'Sort' : sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
              </button>
              <button
                onClick={toggleAllReviewStatus}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  allHidden ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50' : 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                }`}
                title={allHidden ? 'Show all in review' : 'Hide all from review'}>
                <ToggleLeft className='w-4 h-4 mr-2' />
                {allHidden ? 'Show All' : 'Hide All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} onSave={handleSaveQuestion} onDelete={handleDeleteQuestion} showAnswer={showAnswers} />
            ))}
          </div>
        )}
      </div>

      {editingQuestion && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-medium text-gray-900'>{editingQuestion.id.startsWith('temp-') ? 'Add New Question' : 'Edit Question'}</h3>
              <button onClick={() => setEditingQuestion(null)} className='text-gray-400 hover:text-gray-500'>
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Question</label>
                <textarea
                  className='mt-1 block w-full text-sm rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 min-h-[100px] resize-y'
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder='Enter your question here...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Answer</label>
                <textarea
                  rows={4}
                  className='mt-1 block w-full text-sm rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 resize-y'
                  value={editingQuestion.answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                  placeholder='Enter the answer here...'
                />
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='showInReview'
                  checked={editingQuestion.showInReview}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, showInReview: e.target.checked })}
                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                />
                <label htmlFor='showInReview' className='text-sm font-medium text-gray-700'>
                  Show in Review Mode
                </label>
              </div>
            </div>
            <div className='mt-6 flex justify-end space-x-3'>
              <button
                onClick={() => setEditingQuestion(null)}
                className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                Cancel
              </button>
              <button
                onClick={() => handleSaveQuestion(editingQuestion)}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
                <Save className='w-4 h-4 mr-2' />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-sm mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Clear All Questions?</h3>
            <p className='text-sm text-gray-500 mb-6'>This action cannot be undone. All questions will be permanently deleted.</p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50'>
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700'>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpDialog isOpen={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
    </div>
  );
};
