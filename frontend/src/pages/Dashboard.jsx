import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useDebounce from '../hooks/useDebounced';

import { marked } from 'marked';
import RightClickMenu from '../components/RightClickMenu';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileType, setFileType] = useState(null); // 'html' or 'markdown'
  const [markdownContent, setMarkdownContent] = useState("");
  
  const markdownTextareaRef = useRef(null); // Ref for Markdown editor
  const markdownPreviewRef = useRef(null); // Ref for Markdown preview iframe
  const isSyncingScroll = useRef(false); // Flag to prevent scroll loops
  const syncTimeoutRef = useRef(null); // Ref for timeout management
  const restoreScrollPending = useRef(false);

  // Right Click States 
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editableStyles, setEditableStyles] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const debouncedHtmlContent = useDebounce(htmlContent, 50);
  const debouncedMarkdownContent = useDebounce(markdownContent,200);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const navigate = useNavigate();
  const idPrefix = "darwin-id-";
  const savedScrollTop = useRef(0);
  
  // Tags that need unique IDs for selection
  const tagsNeedingId = [
    'div', 'span', 'p', 'a', 'button', 'input', 'label', 'text', 'rect', 'line',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
    'section', 'article', 'nav', 'aside', 'main',
    'header', 'footer', 'form', 'img', 'figure', 'figcaption'
  ];

  // #region General Functions

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

   // Handle file upload
   const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
  
      if (file.name.endsWith(".html")) {
        const injectedHtml = injectDummyIds(content);
        setHtmlContent(injectedHtml);
        setFileType("html"); // new state
      } else if (file.name.endsWith(".md")) {
        setMarkdownContent(content);
        setFileType("markdown");
      } else {
        alert("Unsupported file type. Please upload an .html or .md file.");
      }
    };
    reader.readAsText(file);
    setFileLoaded(true)
  };

  // Export clean HTML Or Markdown
  const handleExport = () => {
    if(fileType === "html"){
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
    }
    if(fileType === "markdown"){
      const blob = new Blob([markdownContent], { type: 'text/markdown'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'darwin-export.md';
      document.body.appendChild(a);
      a.click()
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Exporting fileType:", fileType);
    }
  };

  // #endregion





  // #region HTML

  // Function Related to HTML Files
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

  // Update HTML content when editing
  const handleHtmlChange = (e) => {
    try {
      const iframeDoc = previewRef.current?.contentDocument;
  
      if (iframeDoc && iframeDoc.documentElement) {
        savedScrollTop.current = iframeDoc.documentElement.scrollTop;
        console.log("savedScrollTop on change (after layout):", savedScrollTop.current);
      } else {
        console.warn("iframeDoc or iframeDoc.documentElement is not available.");
      }
    } catch (error) {
      console.error("Error accessing iframe scrollTop:", error);
    }
  
    setHtmlContent(e.target.value);
  };

  // const scrollToCodeByElementId = (elementId) => {
  //   if (!textareaRef.current) return;
  
  //   const tagRegex = new RegExp(`<[^>]*id="${elementId}"[^>]*>`, "i");
  //   const match = htmlContent.match(tagRegex);
  
  //   if (match && match.index !== undefined) {
  //     const startIdx = match.index;
  
  //     // Focus textarea and set selection
  //     textareaRef.current.focus();
  //     textareaRef.current.setSelectionRange(startIdx, startIdx + match[0].length);
  
  //     // Scroll to make it visible (align to center)
  //     const beforeText = htmlContent.substring(0, startIdx);
  //     const lineCountBefore = (beforeText.match(/\n/g) || []).length;
  
      
  //     // Scroll vertically
  //     const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
  //     const scrollTop = Math.max((lineCountBefore - 5) * lineHeight, 0);
  //     textareaRef.current.scrollTop = scrollTop;
      
  //     // Scroll horizontally
  //     const lineStartIdx = htmlContent.lastIndexOf('\n', startIdx) + 1;
  //     const charOffsetInLine = startIdx - lineStartIdx;
  //     textareaRef.current.scrollLeft = charOffsetInLine * 8;
  //     console.log(`Scrolled code to tag with ID: ${elementId}`);
  //   } else {
  //     console.warn(`Tag with id="${elementId}" not found in HTML content.`);
  //   }
  // };
  
  // Handle click on rendered HTML element to highlight corresponding code
  
  const scrollToCodeByElementId = (elementId) => {
    if (!textareaRef.current) return;
  
    // Match the opening tag with the given ID
    const tagMatch = htmlContent.match(new RegExp(`<([a-zA-Z0-9]+)[^>]*id=["']${elementId}["'][^>]*>`, "i"));
    if (!tagMatch || tagMatch.index === undefined) {
      console.warn(`Tag with id="${elementId}" not found.`);
      return;
    }
  
    const tagName = tagMatch[1];
    const startIdx = tagMatch.index;
    const openTag = tagMatch[0];
    let endIdx;
  
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
    if (selfClosingTags.includes(tagName)) {
      // Self-closing tag
      endIdx = startIdx + openTag.length;
    } else {
      // Find the closing tag
      const closingTag = `</${tagName}>`;
      endIdx = htmlContent.indexOf(closingTag, startIdx);
      if (endIdx !== -1) {
        endIdx += closingTag.length;
      } else {
        endIdx = startIdx + openTag.length; // fallback to just opening tag
      }
    }
  
    // Focus and select
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(startIdx, endIdx);
  
    // Vertical scroll
    const textBefore = htmlContent.substring(0, startIdx);
    const lineCountBefore = (textBefore.match(/\n/g) || []).length;
    const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
    const scrollTop = Math.max((lineCountBefore - 5) * lineHeight, 0);
    textareaRef.current.scrollTop = scrollTop;
  
    // Horizontal scroll
    const lineStartIdx = htmlContent.lastIndexOf('\n', startIdx) + 1;
    const charOffsetInLine = startIdx - lineStartIdx;
    const charWidth = 12; // adjust if needed for your font
    textareaRef.current.scrollLeft = charOffsetInLine * charWidth;
    console.log(`Scrolled to tag with ID: ${elementId}`);
    console.log(`Left: ${charOffsetInLine * charWidth}`)
  };
  
  
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
    // console.log("computed: ",computed)
    const svgAttributes = {};

    if (target.hasAttribute('x')) svgAttributes.x = target.getAttribute('x');
    if (target.hasAttribute('y')) svgAttributes.y = target.getAttribute('y');
    if (target.hasAttribute('width')) svgAttributes.width = target.getAttribute('width');
    if (target.hasAttribute('height')) svgAttributes.height = target.getAttribute('height');
    if (target.hasAttribute('fill')) svgAttributes.fill = target.getAttribute('fill');

    const stylesToShow = {
      color: computed.color,
      fontSize: computed.fontSize,
      backgroundColor: computed.backgroundColor,
      margin: computed.margin,
      padding: computed.padding,
      fontWeight: computed.fontWeight,
      opacity: computed.opacity,
      boxShadow: computed.boxShadow,
      borderRadius: computed.borderRadius,
      // add more if you want
      svgAttributes: {
        ...svgAttributes
      }
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
    setEditableStyles((prev) => {
      // If the property is inside svgAttributes
      if (prev.svgAttributes && property in prev.svgAttributes) {
        return {
          ...prev,
          svgAttributes: {
            ...prev.svgAttributes,
            [property]: value,
          },
        };
      }
  
      // Otherwise update top-level styles
      return {
        ...prev,
        [property]: value,
      };
    });
  
    // Also update the actual element
    if (selectedElement) {
      const svgAttrs = ['x', 'y', 'width', 'height', 'fill', 'stroke'];
      if (svgAttrs.includes(property)) {
        selectedElement.setAttribute(property, value);
      } else {
        selectedElement.style[property] = value;
      }
    }
  };
  
  // #endregion
  




  // #region Markdown
  // Function Related to Markdown Files

  // Update Markdown content when editing
  const handleMarkDownChange = (e) => {
    const iframeDoc = markdownPreviewRef.current?.contentDocument;
    if (iframeDoc) {
      savedScrollTop.current = iframeDoc.documentElement.scrollTop;
      console.log("savedScrollTop on change (after layout): ", savedScrollTop.current);
    }
    console.log('setting changes')
    restoreScrollPending.current = true;
    setMarkdownContent(e.target.value);
  };

  const handleMarkdownPreviewLoad = () => {
    if (!restoreScrollPending.current) return; // only restore if content just changed
    const iframeDoc = markdownPreviewRef.current?.contentDocument;
    if (!iframeDoc) return;
  
    requestAnimationFrame(() => {
      iframeDoc.documentElement.scrollTop = savedScrollTop.current || 0;
      console.log("Restored scrollTop after markdown content change:", savedScrollTop.current);
  
      restoreScrollPending.current = false; // reset
    });
  };
  
  // Debounced scroll handler
  const handleScrollSync = useCallback((source) => {
    if (isSyncingScroll.current) return; // Prevent loops
    if (fileType !== 'markdown') return;
    
    const editor = markdownTextareaRef.current;
    const previewIframe = markdownPreviewRef.current;
    const previewDoc = previewIframe?.contentWindow?.document.documentElement;
    
    if (!editor || !previewDoc) return;
    
    isSyncingScroll.current = true; // Set flag
    
    let scrollPercent = 0;
    if (source === 'editor') {
      // Ensure denominator is not zero
      const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
      if (editorScrollableHeight > 0) {
        scrollPercent = editor.scrollTop / editorScrollableHeight;
        previewDoc.scrollTop = scrollPercent * (previewDoc.scrollHeight - previewDoc.clientHeight);
      }
    } else if (source === 'preview') {
      // Ensure denominator is not zero
      const previewScrollableHeight = previewDoc.scrollHeight - previewDoc.clientHeight;
      if (previewScrollableHeight > 0) {
        scrollPercent = previewDoc.scrollTop / previewScrollableHeight;
        editor.scrollTop = scrollPercent * (editor.scrollHeight - editor.clientHeight);
      }
    }
    
    // Reset the flag after a short delay
    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingScroll.current = false;
    }, 100); // Adjust delay as needed
    
  }, [fileType]);
  
  // useEffect(()=>{
  //   console.log('restore the scrol top')
  //   const previewIframe = markdownPreviewRef.current?.contentDocument;
  //   if(!previewIframe) return
  //   if(!savedScrollTop || !savedScrollTop.current) return
  //   setTimeout(()=>{
  //     console.log("previewIframe.scrollTop: ",previewIframe.documentElement.scrollTop)
  //     console.log("avedScrollTop.current: ",savedScrollTop.current)
  //     previewIframe.documentElement.scrollTop = savedScrollTop.current;
  //     console.log("Restored scrollTop to in iframe: ", previewIframe.documentElement.scrollTop);
  //   },200)
  // },[markdownContent])

  // Effect to add scroll listeners for Markdown
  useEffect(() => {
    if (fileType !== 'markdown') return;
    console.log("inside")
    const editor = markdownTextareaRef.current;
    const previewIframe = markdownPreviewRef.current;
    let previewWindow = null;
    
    const handleEditorScroll = () => handleScrollSync('editor');
    const handlePreviewScroll = () => handleScrollSync('preview');
    
    const setupPreviewListener = () => {
      previewWindow = previewIframe?.contentWindow;
      if (previewWindow) {
        previewWindow.addEventListener('scroll', handlePreviewScroll);
      } else {
        // Retry if iframe contentWindow isn't available immediately
        setTimeout(setupPreviewListener, 100);
      }
    }
    
    
    if (editor) {
      editor.addEventListener('scroll', handleEditorScroll);
    }
    if (previewIframe) {
      // Use onLoad for the iframe to ensure contentWindow is ready
      previewIframe.onload = setupPreviewListener;
      // Initial setup attempt in case it's already loaded
      setupPreviewListener();
    }
    
    // Cleanup function
    return () => {
      if (editor) {
        editor.removeEventListener('scroll', handleEditorScroll);
      }
      if (previewWindow) {
        previewWindow.removeEventListener('scroll', handlePreviewScroll);
      }
      clearTimeout(syncTimeoutRef.current); // Clear timeout on cleanup
    };
  }, [fileType, handleScrollSync]); // Rerun if fileType or handler changes
  
  // #endregion
  
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
    <div className="min-h-screen flex flex-col bg-dark-950 overflow-clip">
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
              {fileType==="html" ? "Export Html" : "Export Markdown"}
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
            <input type="file" accept=".html,.md" onChange={handleFileUpload} className="hidden" />
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
            <div className="flex-1 overflow-y-hidden"> {/* Ensure this container allows scrolling */}
              {!leftPanelCollapsed && fileType === "markdown" ? (
                <textarea
                  ref={markdownTextareaRef} // Assign ref here
                  value={markdownContent}
                  onChange={(e) => handleMarkDownChange(e)}
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap text-sm"
                  spellCheck="false"
                />
              ) : !leftPanelCollapsed && fileType === "html" ? ( // Handle HTML case
                <textarea
                  ref={textareaRef} // Keep original ref for HTML
                  value={htmlContent}
                  onChange={handleHtmlChange}
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap"
                  placeholder="HTML code will appear here..."
                  spellCheck="false"
                />
              ) : null /* Handle collapsed or no file */}
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

            <div className="flex-1 overflow-hidden bg-white">
              {!rightPanelCollapsed && fileType === "markdown" ? (
                <iframe
                  ref={markdownPreviewRef} 
                  className="w-full h-full border-none "
                  srcDoc={marked.parse(debouncedMarkdownContent)}
                  title="Markdown Preview"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={handleMarkdownPreviewLoad}
                />
              ): !rightPanelCollapsed && fileType === "html" ? (
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-none"
                  srcDoc={debouncedHtmlContent}
                  title="HTML Preview"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={handleIframeLoad}
                />
              ) : null /* Handle collapsed or no file */}
            </div>

            {/* Right Click Context Menu */}
            {showStyleEditor && <RightClickMenu
              showStyleEditor={showStyleEditor}
              handleEditableStyleChange={handleEditableStyleChange}
              editableStyles={editableStyles}
              setShowStyleEditor={setShowStyleEditor}
              applyEditedStyles={applyEditedStyles}
            />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;