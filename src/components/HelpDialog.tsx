import React, { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { stringify } from 'yaml';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_QUESTIONS = [
  {
    question: 'What is the capital of France?',
    answer: 'Paris',
    showInReview: true,
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    answer: 'William Shakespeare',
    showInReview: true,
  },
  {
    question: 'What is the chemical symbol for gold?',
    answer: 'Au',
    showInReview: true,
  },
];

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'prompt' | 'about'>('features');
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const yamlExample = stringify({ questions: EXAMPLE_QUESTIONS });
    const fullPrompt = `Convert the following questions and answers into YAML format(in <content>):

Example YAML format:
${yamlExample}


<content>
${promptText}
</content>

`;

    navigator.clipboard.writeText(fullPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadExample = () => {
    const jsonContent = JSON.stringify({ questions: EXAMPLE_QUESTIONS }, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example-questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col h-[90vh]'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold text-gray-900'>Help & Documentation</h2>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-500'>
              <X className='w-6 h-6' />
            </button>
          </div>

          <div className='mt-6'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'features' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                Features & Usage
              </button>
              <button
                onClick={() => setActiveTab('prompt')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'prompt' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                YAML Prompt Generator
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                About
              </button>
            </nav>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'features' ? (
            <div className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Question Bank Features</h3>
                <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                  <li>Create, edit, and manage your question bank</li>
                  <li>Toggle answer visibility for easy review</li>
                  <li>Search through questions and answers</li>
                  <li>Import and export in JSON or YAML format</li>
                  <li>Review mode with sequential or random order</li>
                </ul>
              </section>

              <section>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Review Mode</h3>
                <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                  <li>Choose between sequential or random question order</li>
                  <li>Show/hide answers for self-testing</li>
                  <li>Track progress through your question set</li>
                  <li>Hide questions from review mode if needed</li>
                </ul>
              </section>

              <section>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Import/Export</h3>
                <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                  <li>Export your questions in JSON or YAML format</li>
                  <li>Import questions from JSON or YAML files</li>
                  <li>Backup and share your question banks</li>
                  <li>Merge multiple question sets</li>
                </ul>
              </section>

              <section>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Tips</h3>
                <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                  <li>Use the search bar to quickly find specific questions</li>
                  <li>Toggle answer visibility to test yourself</li>
                  <li>Use the YAML prompt generator for consistent formatting</li>
                  <li>Regular backups are recommended</li>
                </ul>
              </section>
            </div>
          ) : activeTab === 'prompt' ? (
            <div className='space-y-6'>
              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>How to Use the YAML Generator</h3>
                <ol className='list-decimal pl-5 space-y-3 text-gray-600'>
                  <li>Copy and paste your questions and answers into the text area below</li>
                  <li>Click the "Copy Template" button to copy the formatted content</li>
                  <li>Paste the copied content into your AI chat dialog</li>
                  <li>The AI will respond with your questions formatted in YAML</li>
                </ol>
              </div>

              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <div className='mb-4'>
                  <h4 className='text-base font-medium text-gray-900 mb-2'>Input Format</h4>
                  <p className='text-sm text-gray-600'>Enter your questions and answers in any format. For example:</p>
                  <pre className='mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-600 whitespace-pre-wrap'>
                    1. What is photosynthesis? Answer: The process by which plants convert light energy into chemical energy 2. Who invented the telephone?
                    Answer: Alexander Graham Bell
                  </pre>
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>Your Questions and Answers</label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className='w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    placeholder='Enter your questions and answers here...'
                  />
                </div>
              </div>

              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='text-base font-medium text-gray-900'>Output Format</h4>
                  <button
                    onClick={handleDownloadExample}
                    className='inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    title='Download example questions as JSON'>
                    <Download className='w-4 h-4 mr-1.5' />
                    Download Example
                  </button>
                </div>
                <p className='text-sm text-gray-600 mb-3'>Your questions will be converted to this YAML structure:</p>
                <pre className='bg-gray-50 p-3 rounded-md text-sm text-gray-600 whitespace-pre-wrap'>{stringify({ questions: EXAMPLE_QUESTIONS })}</pre>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-gray-600'>Author:</span>
                    <span className='font-medium'>abearxiong</span>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-600'>Name:</span>
                      <span className='font-medium'>ai-front</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-600'>Version:</span>
                      <span className='font-medium'>1.0.0</span>
                    </div>
                  </div>
                  <div className='pt-4 border-t border-gray-200'>
                    <h3 className='text-lg font-medium text-gray-900 mb-3'>Description</h3>
                    <p className='text-gray-600'>
                      A modern web application for creating and managing question banks. Perfect for self-study, exam preparation, and knowledge testing.
                    </p>
                    {/* <a href="https://bilibil.com/bcs" target="_blank" className="text-indigo-600 hover:text-indigo-800">Watch Video</a> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'prompt' && (
          <div className='p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={handleCopy}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>
              {copied ? (
                <>
                  <Check className='w-4 h-4 mr-2' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='w-4 h-4 mr-2' />
                  Copy Template
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
