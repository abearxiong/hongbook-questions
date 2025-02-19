import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { Review } from './pages/Review';
import { BookOpen, List } from 'lucide-react';
import { basename } from './modules/basename';
function App() {
  return (
    <Router basename={basename}>
      <div className='bg-gray-100 flex flex-col h-full overflow-hidden'>
        <nav className='flex-shrink-0 bg-white shadow-sm sticky top-0 left-0 right-0 z-50 h-16'>
          <div className='container mx-auto px-4 h-full'>
            <div className='flex justify-between h-full items-center'>
              <div className='flex space-x-8'>
                <Link to='/' className='inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600'>
                  <List className='w-5 h-5 mr-2' />
                  Question Bank
                </Link>
                <Link to='/review' className='inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600'>
                  <BookOpen className='w-5 h-5 mr-2' />
                  Review Mode
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className='flex-grow overflow-hidden'>
          <main
            className='h-full'
            style={{
              overflow: 'scroll',
            }}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/review' element={<Review />} />
            </Routes>
          </main>
        </div>

        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
