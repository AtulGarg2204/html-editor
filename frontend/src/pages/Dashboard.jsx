import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const navigate = useNavigate();
  const idPrefix = "darwin-id-";

  // Tags that need unique IDs for selection
  const tagsNeedingId = [
    'div', 'span', 'p', 'a', 'button', 'input', 'label',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
    'section', 'article', 'nav', 'aside', 'main',
    'header', 'footer', 'form', 'img', 'figure', 'figcaption'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, config);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Inject unique IDs into HTML elements for selection
  const injectDummyIds = (html) => {
    let idCounter = 1;
    const tagsRegex = new RegExp(`<(${tagsNeedingId.join('|')})(\\s|>)`, 'gi');
    return html.replace(tagsRegex, (match, tagName, after) => {
      return `<${tagName} id="${idPrefix}${idCounter++}"${after}`;
    });
  };

  // Remove injected IDs before exporting
  const removeDummyIds = (html) => {
    return html.replace(new RegExp(`\\s+id="${idPrefix}\\d+"`, 'g'), '');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const injectedHtml = injectDummyIds(event.target.result);
          setHtmlContent(injectedHtml);
          setFileLoaded(true);
        } catch (error) {
          console.error("Error processing HTML file:", error);
          alert("Error processing the HTML file. Please try another file.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid HTML file.");
    }
  };

  // Update HTML content when editing
  const handleHtmlChange = (e) => {
    setHtmlContent(e.target.value);
  };

  // Handle click on rendered HTML element to highlight corresponding code
  const handleRenderedClick = (e) => {
    e.stopPropagation();
    
    // Find closest element with our ID prefix
    let target = e.target;
    while (target && (!target.id || !target.id.startsWith(idPrefix))) {
      if (target === previewRef.current) return; // Reached the container, no matching element
      target = target.parentElement;
    }
    
    if (!target || !target.id || !target.id.startsWith(idPrefix)) return;

    // Remove any previous highlights
    const previousHighlighted = previewRef.current.querySelector('.darwin-element-highlight');
    if (previousHighlighted) {
      previousHighlighted.classList.remove('darwin-element-highlight');
    }
    
    // Add highlight to the clicked element
    target.classList.add('darwin-element-highlight');

    const id = target.id;
    const tagName = target.tagName.toLowerCase();
    const elementId = target.id;

    // Find this element in the HTML content
    const rawText = htmlContent;
    
    // First, try to find the exact tag with ID
    const searchStartString = `<${tagName} id="${elementId}"`;
    let searchEndString = `</${tagName}>`;
    
    // Some tags might not have closing tags
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
    if (selfClosingTags.includes(tagName)) {
      searchEndString = '>';
    }

    let startIdx = rawText.indexOf(searchStartString);
    
    // If we can't find the exact tag, try a more general approach
    if (startIdx === -1) {
      startIdx = rawText.indexOf(`id="${elementId}"`);
      if (startIdx === -1) return;
      
      // Find the beginning of the tag
      let tempIdx = startIdx;
      while (tempIdx >= 0 && rawText[tempIdx] !== '<') {
        tempIdx--;
      }
      if (tempIdx < 0) return;
      startIdx = tempIdx;
    }
    
    // Find the end of the tag
    let endIdx;
    
    if (!selfClosingTags.includes(tagName)) {
      // For normal tags with closing tags
      let searchStartPos = startIdx + searchStartString.length;
      
      // Simple search for the closing tag
      endIdx = rawText.indexOf(searchEndString, searchStartPos);
      if (endIdx === -1) {
        // If we can't find a closing tag, just select until the end of the opening tag
        endIdx = rawText.indexOf('>', startIdx) + 1;
      } else {
        endIdx += searchEndString.length;
      }
    } else {
      // For self-closing tags
      endIdx = rawText.indexOf('>', startIdx) + 1;
    }

    // Expand left panel if collapsed
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
    }
    
    // Focus and select the text in the textarea
    if (startIdx !== -1 && endIdx !== -1 && textareaRef.current) {
      textareaRef.current.focus();
      
      // Scroll the textarea to bring the selection into view
      // First calculate approximately where the text is in the textarea
      const textBefore = rawText.substring(0, startIdx);
      const lines = textBefore.split('\n').length;
      const approximateLineHeight = 21; // Adjust based on your font size
      
      // Set selection
      setTimeout(() => {
        textareaRef.current.setSelectionRange(startIdx, endIdx);
        
        // Calculate scroll position (approximate)
        const scrollPosition = (lines - 5) * approximateLineHeight; // 5 lines buffer
        textareaRef.current.scrollTop = scrollPosition > 0 ? scrollPosition : 0;
      }, 0);
    }
  };

  // Export clean HTML
  const handleExport = () => {
    const cleanedHtml = removeDummyIds(htmlContent);
    
    // Create file for download
    const blob = new Blob([cleanedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'darwin-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-primary text-3xl font-serif mb-4">DARWIN</div>
          <div className="text-gray-300">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      {/* Top Navigation */}
      <nav className="bg-dark-900 border-b border-dark-800 shadow-md">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-serif text-primary font-bold tracking-wider">DARWIN</div>
          <div className="flex items-center gap-4">
            <div className="text-gray-300 hidden sm:block">
              Welcome, <span className="text-white">{userData?.name}</span>
            </div>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!fileLoaded}
            >
              Export HTML
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-dark-800 text-gray-200 rounded-lg hover:text-white hover:bg-dark-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* File Upload Section */}
      <div className="bg-dark-900 border-b border-dark-800 py-3 px-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center px-4 py-2 bg-dark-800 text-white rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload HTML File
            <input type="file" accept=".html" onChange={handleFileUpload} className="hidden" />
          </label>
          <div className={`text-sm ${fileLoaded ? 'text-green-500' : 'text-gray-400'}`}>
            {fileLoaded ? "File loaded. Use the editor below to make changes." : "No file loaded. Upload an HTML file to begin editing."}
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 flex">
        {/* Editor Panels Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Code Editor */}
          <div 
            className={`transition-all duration-300 flex flex-col bg-dark-950 ${
              leftPanelCollapsed 
                ? 'w-12' 
                : rightPanelCollapsed 
                  ? 'w-full' 
                  : 'w-1/2'
            }`}
          >
            <div className="bg-dark-900 p-2 flex justify-between items-center border-b border-dark-800">
              <h3 className={`font-medium text-gray-200 ${leftPanelCollapsed ? 'hidden' : 'block'}`}>HTML Editor</h3>
              <button 
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label={leftPanelCollapsed ? "Expand editor" : "Collapse editor"}
              >
                {leftPanelCollapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {!leftPanelCollapsed && (
                <textarea
                  ref={textareaRef}
                  value={htmlContent}
                  onChange={handleHtmlChange}
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor"
                  placeholder="HTML code will appear here after uploading a file..."
                  spellCheck="false"
                />
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div 
            className={`transition-all duration-300 flex flex-col ${
              rightPanelCollapsed 
                ? 'w-12' 
                : leftPanelCollapsed 
                  ? 'w-full' 
                  : 'w-1/2'
            }`}
          >
            <div className="bg-dark-900 p-2 flex justify-between items-center border-b border-dark-800">
              <h3 className={`font-medium text-gray-200 ${rightPanelCollapsed ? 'hidden' : 'block'}`}>Preview</h3>
              <button 
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label={rightPanelCollapsed ? "Expand preview" : "Collapse preview"}
              >
                {rightPanelCollapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-dark-950">
              {!rightPanelCollapsed && (
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-none"
                  srcDoc={htmlContent}
                  title="HTML Preview"
                  sandbox="allow-same-origin"
                  onClick={handleRenderedClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;