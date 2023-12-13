/*
import { FaSun, FaMoon } from "react-icons/fa";

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="flex items-center">
      <div className="text-gray-500 dark:text-gray-400">
        {darkMode ? <FaSun /> : <FaMoon />}
      </div>
      <div className="ml-2">
        <button
          className="text-gray-500 dark:text-gray-400 focus:outline-none"
          onClick={toggleDarkMode}
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
};

export default DarkModeToggle;

*/

/*


import { useState } from 'react';

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  function toggleDarkMode() {
    setIsDarkMode(prevMode => !prevMode);
  }

  return (
    <div className="inline-flex gap-4">
      <button
        aria-label="Toggle Dark Mode"
        onClick={toggleDarkMode}
        className="text-font-100 w-4 h-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isDarkMode ? '#fff' : 'currentColor'}
          aria-hidden="true"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      </button>
    </div>
  );
}

export default DarkModeToggle;

  // DarkModeToggle组件  暗黑模式


*/


/*

import { useState } from 'react';

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  function toggleDarkMode() {
    setIsDarkMode(prevMode => !prevMode);
  }

  return (
    <div className="fixed right-4 top-4 flex items-center">
      <div className="inline-flex gap-4">
        <button
          aria-label="Toggle Dark Mode"
          onClick={toggleDarkMode}
          className="text-font-100 w-4 h-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isDarkMode ? '#fff' : 'currentColor'}
            aria-hidden="true"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DarkModeToggle;



*/





import { useState } from 'react';

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  function toggleDarkMode() {
    setIsDarkMode(prevMode => !prevMode);
  }

  // 根据 isDarkMode 来判断是否添加类名 dark
  const containerClassName = isDarkMode ? 'dark' : '';

  return (
    <div className={`fixed top-4 right-4 ${containerClassName}`}>
      <div className="inline-flex gap-4">
        <button
          aria-label="Toggle Dark Mode"
          onClick={toggleDarkMode}
          className="text-font-100 w-4 h-4"
        >
         
        </button>
      </div>
    </div>
  );
}

export default DarkModeToggle;







