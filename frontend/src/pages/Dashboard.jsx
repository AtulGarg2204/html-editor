import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useDebounce from '../hooks/useDebounced';
import { SketchPicker } from 'react-color';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  
  // Right Click States 
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editableStyles, setEditableStyles] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const debouncedHtmlContent = useDebounce(htmlContent, 300);

  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const navigate = useNavigate();
  const idPrefix = "darwin-id-";
  const savedScrollTop = useRef(0);

  // Tags that need unique IDs for selection
  const tagsNeedingId = [
    'div', 'span', 'p', 'a', 'button', 'input', 'label', 'text',
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
    const iframeDoc = previewRef.current?.contentDocument;
    if (iframeDoc) {
      savedScrollTop.current = iframeDoc.documentElement.scrollTop;
      console.log("savedScrollTop on change (after layout): ", savedScrollTop.current);
    }
    setHtmlContent(e.target.value);
  };

  const scrollToCodeByElementId = (elementId) => {
    if (!textareaRef.current) return;
  
    const tagRegex = new RegExp(`<[^>]*id="${elementId}"[^>]*>`, "i");
    const match = htmlContent.match(tagRegex);
  
    if (match && match.index !== undefined) {
      const startIdx = match.index;
  
      // Focus textarea and set selection
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(startIdx, startIdx + match[0].length);
  
      // Scroll to make it visible (align to center)
      const beforeText = htmlContent.substring(0, startIdx);
      const lineCountBefore = (beforeText.match(/\n/g) || []).length;
  
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
      const scrollTop = Math.max((lineCountBefore - 5) * lineHeight, 0);
      textareaRef.current.scrollTop = scrollTop;
  
      console.log(`Scrolled code to tag with ID: ${elementId}`);
    } else {
      console.warn(`Tag with id="${elementId}" not found in HTML content.`);
    }
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
      textareaRef.current.focus()

      scrollToCodeByElementId(id)
    }
  };
  
  const handleRightClick = (e) => {
    e.preventDefault(); // stop default context menu
  
    let target = e.target;
    
    // Only target elements with our injected ID
    if (!target.id || !target.id.startsWith(idPrefix)) return;
  
    const computed = window.getComputedStyle(target);
    

    // List all styles
    // const stylesObj = {};
    // for (let i = 0; i < computed.length; i++) {
    //   const prop = computed[i];
    //   stylesObj[prop] = computed.getPropertyValue(prop);
    // }


    // Selectively pick only needed styles
    const stylesToShow = {
      color: computed.color,
      fontSize: computed.fontSize,
      backgroundColor: computed.backgroundColor,
      margin: computed.margin,
      padding: computed.padding,
      // add more if you want
    };
  
    setSelectedElement(target);      // Save clicked element
    setEditableStyles(stylesToShow); // Save its styles
    setShowStyleEditor(true);         // Show dialog/modal
  };
  
  const handleIframeLoad = () => {
    if (!previewRef.current) return;
    const iframeDocument = previewRef.current.contentDocument;
    if (!iframeDocument) return;
  
    iframeDocument.addEventListener('click', handleRenderedClick);
    iframeDocument.addEventListener('contextmenu', handleRightClick);

      iframeDocument.documentElement.scrollTop = savedScrollTop.current;
      console.log("Restored scrollTop to in iframe: ", savedScrollTop.current);

  };
  
  const applyEditedStyles = () => {
    if (selectedElement) {
      Object.entries(editableStyles).forEach(([prop, value]) => {
        selectedElement.style[prop] = value;
      });
  
      // After applying styles, update htmlContent with the iframe's current content
      const iframeDoc = previewRef.current?.contentDocument;
      if (iframeDoc) {
        savedScrollTop.current = iframeDoc.documentElement.scrollTop;
        const updatedHtml = iframeDoc.documentElement.outerHTML;
        setHtmlContent(updatedHtml);
      }
    }
    setShowStyleEditor(false);
  };
  
  // Handles live style changes 
  const handleEditableStyleChange = (property, value) => {
    setEditableStyles((prev) => ({
      ...prev,
      [property]: value,
    }));
  };
  
  // function ensureHex(color) {
  //   if (color.startsWith("#")) return color;

  //   const result = color.match(/\d+/g);
  //   if (!result) return "#000000";
  //   return (
  //     "#" +
  //     result
  //       .map((x) => {
  //         const hex = parseInt(x).toString(16);
  //         return hex.length === 1 ? "0" + hex : hex;
  //       })
  //       .join("")
  //   );
  // }

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
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap"
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
                  srcDoc={debouncedHtmlContent}
                  title="HTML Preview"
                  // sandbox="allow-same-origin"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={handleIframeLoad}
                />
              )}
            </div>

            {/* Right Click Context Menu */}
            {showStyleEditor && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-[400px] max-w-[90vw] animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Style Editor</h2>
                    <button 
                      onClick={() => setShowStyleEditor(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Typography Group */}
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Typography</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Font Size</label>
                          <select
                            value={editableStyles.fontSize}
                            onChange={(e) => handleEditableStyleChange('fontSize', e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px">16px</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px</option>
                            <option value="24px">24px</option>
                            <option value="32px">32px</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Font Weight</label>
                          <select
                            value={editableStyles.fontWeight}
                            onChange={(e) => handleEditableStyleChange('fontWeight', e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="bolder">Bolder</option>
                            <option value="100">100</option>
                            <option value="400">400</option>
                            <option value="700">700</option>
                            <option value="900">900</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Text Align</label>
                        <div className="flex bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                          {['left', 'center', 'right', 'justify'].map((align) => (
                            <button
                              key={align}
                              onClick={() => handleEditableStyleChange('textAlign', align)}
                              className={`flex-1 py-2 px-3 text-sm capitalize transition-colors ${
                                editableStyles.textAlign === align 
                                  ? 'bg-blue-500 text-white' 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Colors Group */}
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Colors</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Text Color</label>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600" 
                              style={{ backgroundColor: editableStyles.color }}
                            ></div>
                            {/* <input
                              type="color"
                              value={ensureHex(editableStyles.color)}
                              onChange={(e) => handleEditableStyleChange('color', e.target.value)}
                              className="w-full h-9 cursor-pointer rounded-md border border-gray-200 dark:border-gray-600"
                            /> */}
                            <SketchPicker
                              color={editableStyles.color}
                              onChange={(color) => handleEditableStyleChange('color', color.hex || `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`)}
                              
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Background</label>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600" 
                              style={{ backgroundColor: editableStyles.backgroundColor }}
                            ></div>
                            {/* <input
                              type="color"
                              value={ensureHex(editableStyles.backgroundColor)}
                              onChange={(e) => handleEditableStyleChange('backgroundColor', e.target.value)}
                              className="w-full h-9 cursor-pointer rounded-md border border-gray-200 dark:border-gray-600"
                            /> */}
                            <SketchPicker
                              color={editableStyles.backgroundColor}
                              onChange={(color) => handleEditableStyleChange('backgroundColor', color.hex || `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`)}
                              
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Opacity</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editableStyles.opacity}
                            onChange={(e) => handleEditableStyleChange('opacity', e.target.value)}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <span className="text-sm w-8 text-center">{editableStyles.opacity}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Spacing & Layout Group */}
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Spacing & Layout</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Margin</label>
                          <select
                            value={editableStyles.margin}
                            onChange={(e) => handleEditableStyleChange('margin', e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="0px">0px</option>
                            <option value="4px">4px</option>
                            <option value="8px">8px</option>
                            <option value="12px">12px</option>
                            <option value="16px">16px</option>
                            <option value="24px">24px</option>
                            <option value="32px">32px</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Padding</label>
                          <select
                            value={editableStyles.padding}
                            onChange={(e) => handleEditableStyleChange('padding', e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="0px">0px</option>
                            <option value="4px">4px</option>
                            <option value="8px">8px</option>
                            <option value="12px">12px</option>
                            <option value="16px">16px</option>
                            <option value="24px">24px</option>
                            <option value="32px">32px</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Border Radius</label>
                        <input
                          type="text"
                          value={editableStyles.borderRadius}
                          onChange={(e) => handleEditableStyleChange('borderRadius', e.target.value)}
                          className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Box Shadow</label>
                        <select
                          value={editableStyles.boxShadow}
                          onChange={(e) => handleEditableStyleChange('boxShadow', e.target.value)}
                          className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                          <option value="none">None</option>
                          <option value="0 1px 3px rgba(0,0,0,0.1)">Small</option>
                          <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                          <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                          <option value="0 20px 25px rgba(0,0,0,0.1)">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowStyleEditor(false)}
                      className="px-5 py-2.5 rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyEditedStyles}
                      className="px-5 py-2.5 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;