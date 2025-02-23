import React, { useEffect, useMemo } from 'react';
import { ChevronLeft, HelpCircle, ChevronRight, Shuffle, EyeOff, Edit2, Save, X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { updateQuestion } from '../utils/db';
import { useReviewStore } from '../store/review';
import toast from 'react-hot-toast';
import { marked } from '../modules/marked';
import clsx from 'clsx';

export const MarkedAnswer = ({ answer }: { answer: string }) => {
  const content = useMemo(() => marked.parse(answer || ''), [answer]);
  const [isFullScreen, setFullScreen] = React.useState(false);

  return (
    <div
      onDoubleClick={() => {
        setFullScreen(!isFullScreen);
      }}
      className={clsx('bg-gray-50 p-4 rounded-md markdown cursor-pointer', {
        'max-h-[150px] overflow-y-auto': !isFullScreen,
        'h-screen w-screen overflow-auto': isFullScreen,
        'fixed top-0 left-0 right-0 bottom-0 z-50': isFullScreen,
        //
      })}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
export const ShowAnswerHelp = () => {
  const [show, setShow] = React.useState(false);
  return (
    <div className=' flex gap-2 h-full items-center' onClick={() => setShow(!show)}>
      <HelpCircle />
      <div className={clsx({ hidden: !show })}>(Double click content to fullscreen)</div>
    </div>
  );
};
export const Review: React.FC = () => {
  const {
    questions,
    currentIndex,
    showAnswer,
    isComplete,
    isRandom,
    isEditing,
    editedQuestion,
    loadQuestions,
    setCurrentIndex,
    toggleAnswer,
    setComplete,
    toggleRandom,
    hideQuestion,
    setEditing,
    setEditedQuestion,
    resetProgress,
  } = useReviewStore();

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      toggleAnswer(false);
    } else {
      setComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      toggleAnswer(false);
    }
  };

  const toggleMode = () => {
    toggleRandom();
    resetProgress();
    loadQuestions();
  };

  const toggleShowInReview = async () => {
    const currentQuestion = questions[currentIndex];

    // Add to hidden questions list
    hideQuestion(currentQuestion.id);

    // Update the question in the database
    const updatedQuestion = { ...currentQuestion, showInReview: false };
    await updateQuestion(updatedQuestion);

    // Move to next question if available
    if (currentIndex < questions.length - 1) {
      handleNext();
    }

    toast.success('Question hidden from review mode');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedQuestion(questions[currentIndex]);
    setEditing(true);
  };

  const handleSave = async () => {
    if (editedQuestion) {
      await updateQuestion(editedQuestion);
      await loadQuestions(currentIndex);
      setEditing(false);
      setEditedQuestion(null);
    }
  };

  const handleQuestionClick = () => {
    if (!isEditing) {
      toggleAnswer();
    }
  };

  const handleResetProgress = () => {
    resetProgress();
    loadQuestions();
    toast.success('Progress reset');
  };

  const restart = () => {
    handleResetProgress();
  };

  if (questions.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-xl text-gray-600'>No questions available. Add some questions first!</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className='flex flex-col items-center justify-center h-full bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Congratulations! 🎉</h2>
          <p className='text-xl text-gray-600 mb-8'>You've completed all the questions!</p>
          <button
            onClick={restart}
            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
            Start Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='bg-white shadow-sm sticky top-0'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0'>
            <h1 className='text-3xl font-bold text-gray-900'>Review Questions</h1>
            <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
              <button
                onClick={handleResetProgress}
                className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                title='Reset progress'>
                <RotateCcw className='w-4 h-4 mr-2' />
                Reset Progress
              </button>
              <button
                onClick={toggleShowInReview}
                className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                <EyeOff className='w-4 h-4 mr-2' />
                Hide from Review
              </button>
              <button
                onClick={toggleMode}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isRandom ? 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}>
                <Shuffle className='w-4 h-4 mr-2' />
                {isRandom ? 'Random Mode' : 'Sequential Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-8'>
        <div className='container mx-auto max-w-3xl h-full'>
          <div className='relative h-full flex flex-col md:flex-row items-center gap-4'>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`hidden md:inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white ${
                currentIndex === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}>
              <ChevronLeft className='w-6 h-6' />
            </button>

            <div className='flex-1 w-full bg-white rounded-lg shadow-lg p-4 sm:p-8'>
              <div className='mb-4 text-sm text-gray-600'>
                Question {currentIndex + 1} of {questions.length}
              </div>
              <div className='mb-8'>
                {isEditing && editedQuestion ? (
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Question</label>
                      <textarea
                        className='w-full p-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-y'
                        value={editedQuestion.question}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Answer</label>
                      <textarea
                        className='w-full p-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-y'
                        value={editedQuestion.answer}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
                      />
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditedQuestion(null);
                        }}
                        className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                        <X className='w-4 h-4 mr-2' />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className='flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
                        <Save className='w-4 h-4 mr-2' />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='bg-gray-50 p-4 rounded-md mb-4 cursor-pointer hover:bg-gray-100 transition-colors' onClick={handleQuestionClick}>
                      <div className='flex justify-between items-start mb-2'>
                        <h2 className='text-xl font-medium text-gray-900'>Question:</h2>
                        <button onClick={handleEdit} className='inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-indigo-600'>
                          <Edit2 className='w-4 h-4' />
                        </button>
                      </div>
                      <div className='max-h-[150px] overflow-y-auto whitespace-pre-wrap text-gray-700'>{questions[currentIndex].question}</div>
                    </div>
                    {showAnswer ? (
                      <div className='bg-gray-50 p-4 rounded-md'>
                        <div className='flex justify-between items-start mb-2'>
                          <h2 className='text-xl font-medium text-gray-900 flex gap-2 items-center relative'>
                            Answer:
                            <ShowAnswerHelp />
                          </h2>
                          <button
                            onClick={() => toggleAnswer(false)}
                            className='inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-indigo-600'
                            title='Hide Answer'>
                            <ChevronUp className='w-4 h-4' />
                          </button>
                        </div>
                        <div className='max-h-[150px] overflow-y-auto whitespace-pre-wrap text-gray-700 cursor-pointer'>
                          {/* {questions[currentIndex].answer} */}
                          <MarkedAnswer answer={questions[currentIndex].answer} />
                        </div>
                      </div>
                    ) : (
                      <div className='flex justify-center'>
                        <button
                          onClick={() => toggleAnswer(true)}
                          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
                          <ChevronDown className='w-4 h-4 mr-2' />
                          Show Answer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!isEditing && (
                <div className='flex md:hidden gap-2'>
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      currentIndex === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}>
                    <ChevronLeft className='w-4 h-4 mr-2' />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className='flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700'>
                    Next
                    <ChevronRight className='w-4 h-4 ml-2' />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className='hidden md:inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700'>
              <ChevronRight className='w-6 h-6' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
