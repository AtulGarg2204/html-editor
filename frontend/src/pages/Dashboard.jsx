// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import useDebounce from '../hooks/useDebounced';

// import { marked } from 'marked';
// import RightClickMenu2 from '../components/RightClick'

// const Dashboard = () => {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [htmlContent, setHtmlContent] = useState('');
//   const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
//   const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
//   const [fileLoaded, setFileLoaded] = useState(false);
//   const [fileType, setFileType] = useState(null); // 'html' or 'markdown'
//   const [markdownContent, setMarkdownContent] = useState("");
  
//   const markdownTextareaRef = useRef(null); // Ref for Markdown editor
//   const markdownPreviewRef = useRef(null); // Ref for Markdown preview iframe
//   const isSyncingScroll = useRef(false); // Flag to prevent scroll loops
//   const syncTimeoutRef = useRef(null); // Ref for timeout management
//   const restoreScrollPending = useRef(false);

//   // Right Click States 
//   const [showStyleEditor, setShowStyleEditor] = useState(false);
//   const [editableStyles, setEditableStyles] = useState({});
//   const [selectedElement, setSelectedElement] = useState(null);
//   const debouncedHtmlContent = useDebounce(htmlContent, 50);
//   const debouncedMarkdownContent = useDebounce(markdownContent,200);
//   const textareaRef = useRef(null);
//   const previewRef = useRef(null);
//   const navigate = useNavigate();
//   const idPrefix = "darwin-id-";
//   const savedScrollTop = useRef(0);
//   const [hoveredElement, setHoveredElement] = useState(null); //new
//   // Tags that need unique IDs for selection
//   const tagsNeedingId = [
//     'div', 'span', 'p', 'a', 'button', 'input', 'label', 'text', 'rect', 'line', 'path',
//     'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
//     'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
//     'section', 'article', 'nav', 'aside', 'main',
//     'header', 'footer', 'form', 'img', 'figure', 'figcaption'
//   ];

//   // #region General Functions

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           navigate('/login');
//           return;
//         }

//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         };

//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, config);
//         setUserData(response.data);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//    // Handle file upload
//    const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const content = event.target.result;
  
//       if (file.name.endsWith(".html")) {
//         const injectedHtml = injectDummyIds(content);
//         setHtmlContent(injectedHtml);
//         setFileType("html"); // new state
//       } else if (file.name.endsWith(".md")) {
//         setMarkdownContent(content);
//         setFileType("markdown");
//       } else {
//         alert("Unsupported file type. Please upload an .html or .md file.");
//       }
//     };
//     reader.readAsText(file);
//     setFileLoaded(true)
//   };

//   // Export clean HTML Or Markdown
//   const handleExport = () => {
//     if(fileType === "html"){
//       const cleanedHtml = removeDummyIds(htmlContent);
      
//       // Create file for download
//       const blob = new Blob([cleanedHtml], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'darwin-export.html';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     }
//     if(fileType === "markdown"){
//       const blob = new Blob([markdownContent], { type: 'text/markdown'});
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'darwin-export.md';
//       document.body.appendChild(a);
//       a.click()
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//       console.log("Exporting fileType:", fileType);
//     }
//   };

//   // #endregion





//   // #region HTML

//   // Function Related to HTML Files
//   // Inject unique IDs into HTML elements for selection
//   const injectDummyIds = (html) => {
//     let idCounter = 1;
//     const tagsRegex = new RegExp(`<(${tagsNeedingId.join('|')})(\\s|>)`, 'gi');
//     return html.replace(tagsRegex, (match, tagName, after) => {
//       return `<${tagName} id="${idPrefix}${idCounter++}"${after}`;
//     });
//   };

//   // Remove injected IDs before exporting
//   const removeDummyIds = (html) => {
//     return html.replace(new RegExp(`\\s+id="${idPrefix}\\d+"`, 'g'), '');
//   };

//   // Update HTML content when editing
//   const handleHtmlChange = (e) => {
//     try {
//       const iframeDoc = previewRef.current?.contentDocument;
  
//       if (iframeDoc && iframeDoc.documentElement) {
//         savedScrollTop.current = iframeDoc.documentElement.scrollTop;
//         console.log("savedScrollTop on change (after layout):", savedScrollTop.current);
//       } else {
//         console.warn("iframeDoc or iframeDoc.documentElement is not available.");
//       }
//     } catch (error) {
//       console.error("Error accessing iframe scrollTop:", error);
//     }
  
//     setHtmlContent(e.target.value);
//   };

//   // const scrollToCodeByElementId = (elementId) => {
//   //   if (!textareaRef.current) return;
  
//   //   const tagRegex = new RegExp(`<[^>]*id="${elementId}"[^>]*>`, "i");
//   //   const match = htmlContent.match(tagRegex);
  
//   //   if (match && match.index !== undefined) {
//   //     const startIdx = match.index;
  
//   //     // Focus textarea and set selection
//   //     textareaRef.current.focus();
//   //     textareaRef.current.setSelectionRange(startIdx, startIdx + match[0].length);
  
//   //     // Scroll to make it visible (align to center)
//   //     const beforeText = htmlContent.substring(0, startIdx);
//   //     const lineCountBefore = (beforeText.match(/\n/g) || []).length;
  
      
//   //     // Scroll vertically
//   //     const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
//   //     const scrollTop = Math.max((lineCountBefore - 5) * lineHeight, 0);
//   //     textareaRef.current.scrollTop = scrollTop;
      
//   //     // Scroll horizontally
//   //     const lineStartIdx = htmlContent.lastIndexOf('\n', startIdx) + 1;
//   //     const charOffsetInLine = startIdx - lineStartIdx;
//   //     textareaRef.current.scrollLeft = charOffsetInLine * 8;
//   //     console.log(`Scrolled code to tag with ID: ${elementId}`);
//   //   } else {
//   //     console.warn(`Tag with id="${elementId}" not found in HTML content.`);
//   //   }
//   // };
  
//   // Handle click on rendered HTML element to highlight corresponding code
  
//   const scrollToCodeByElementId = (elementId) => {
//     if (!textareaRef.current) return;
  
//     // Match the opening tag with the given ID
//     const tagMatch = htmlContent.match(new RegExp(`<([a-zA-Z0-9]+)[^>]*id=["']${elementId}["'][^>]*>`, "i"));
//     if (!tagMatch || tagMatch.index === undefined) {
//       console.warn(`Tag with id="${elementId}" not found.`);
//       return;
//     }
  
//     const tagName = tagMatch[1];
//     const startIdx = tagMatch.index;
//     const openTag = tagMatch[0];
//     let endIdx;
  
//     const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
//     if (selfClosingTags.includes(tagName)) {
//       // Self-closing tag
//       endIdx = startIdx + openTag.length;
//     } else {
//       // Find the closing tag
//       const closingTag = `</${tagName}>`;
//       endIdx = htmlContent.indexOf(closingTag, startIdx);
//       if (endIdx !== -1) {
//         endIdx += closingTag.length;
//       } else {
//         endIdx = startIdx + openTag.length; // fallback to just opening tag
//       }
//     }
  
//     // Focus and select
//     textareaRef.current.focus();
//     textareaRef.current.setSelectionRange(startIdx, endIdx);
  
//     // Vertical scroll
//     const textBefore = htmlContent.substring(0, startIdx);
//     const lineCountBefore = (textBefore.match(/\n/g) || []).length;
//     const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
//     const scrollTop = Math.max((lineCountBefore - 5) * lineHeight, 0);
//     textareaRef.current.scrollTop = scrollTop;
  
//     // Horizontal scroll
//     const lineStartIdx = htmlContent.lastIndexOf('\n', startIdx) + 1;
//     const charOffsetInLine = startIdx - lineStartIdx;
//     const charWidth = 12; // adjust if needed for your font
//     textareaRef.current.scrollLeft = charOffsetInLine * charWidth;
//     console.log(`Scrolled to tag with ID: ${elementId}`);
//     console.log(`Left: ${charOffsetInLine * charWidth}`)
//   };
  
  
//   const handleRenderedClick = (e) => {
//     e.stopPropagation();
    
//     // Find closest element with our ID prefix
//     let target = e.target;
//     while (target && (!target.id || !target.id.startsWith(idPrefix))) {
//       if (target === previewRef.current) return; // Reached the container, no matching element
//       target = target.parentElement;
//     }
    
//     if (!target || !target.id || !target.id.startsWith(idPrefix)) return;

//     // Remove any previous highlights
//     const previousHighlighted = previewRef.current.querySelector('.darwin-element-highlight');
//     if (previousHighlighted) {
//       previousHighlighted.classList.remove('darwin-element-highlight');
//     }
    
//     // Add highlight to the clicked element
//     target.classList.add('darwin-element-highlight');

//     const id = target.id;
//     const tagName = target.tagName.toLowerCase();
//     const elementId = target.id;

//     // Find this element in the HTML content
//     const rawText = htmlContent;
    
//     // First, try to find the exact tag with ID
//     const searchStartString = `<${tagName} id="${elementId}"`;
//     let searchEndString = `</${tagName}>`;
    
//     // Some tags might not have closing tags
//     const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
//     if (selfClosingTags.includes(tagName)) {
//       searchEndString = '>';
//     }

//     let startIdx = rawText.indexOf(searchStartString);
    
//     // If we can't find the exact tag, try a more general approach
//     if (startIdx === -1) {
//       startIdx = rawText.indexOf(`id="${elementId}"`);
//       if (startIdx === -1) return;
      
//       // Find the beginning of the tag
//       let tempIdx = startIdx;
//       while (tempIdx >= 0 && rawText[tempIdx] !== '<') {
//         tempIdx--;
//       }
//       if (tempIdx < 0) return;
//       startIdx = tempIdx;
//     }
    
//     // Find the end of the tag
//     let endIdx;
    
//     if (!selfClosingTags.includes(tagName)) {
//       // For normal tags with closing tags
//       let searchStartPos = startIdx + searchStartString.length;
      
//       // Simple search for the closing tag
//       endIdx = rawText.indexOf(searchEndString, searchStartPos);
//       if (endIdx === -1) {
//         // If we can't find a closing tag, just select until the end of the opening tag
//         endIdx = rawText.indexOf('>', startIdx) + 1;
//       } else {
//         endIdx += searchEndString.length;
//       }
//     } else {
//       // For self-closing tags
//       endIdx = rawText.indexOf('>', startIdx) + 1;
//     }

//     // Expand left panel if collapsed
//     if (leftPanelCollapsed) {
//       setLeftPanelCollapsed(false);
//     }
    
//     // Focus and select the text in the textarea
//     if (startIdx !== -1 && endIdx !== -1 && textareaRef.current) {
//       textareaRef.current.focus()

//       scrollToCodeByElementId(id)
//     }
//   };
  
//   // const handleRightClick = (e) => {
//   //   e.preventDefault(); // stop default context menu
  
//   //   let target = e.target;
    
//   //   // Only target elements with our injected ID
//   //   if (!target.id || !target.id.startsWith(idPrefix)) return;
  
//   //   const computed = window.getComputedStyle(target);

//   //   // List all styles
//   //   // const stylesObj = {};
//   //   // for (let i = 0; i < computed.length; i++) {
//   //   //   const prop = computed[i];
//   //   //   stylesObj[prop] = computed.getPropertyValue(prop);
//   //   // }

//   //   // Selectively pick only needed styles
//   //   // console.log("computed: ",computed)
//   //   const svgAttributes = {};

//   //   if (target.hasAttribute('x')) svgAttributes.x = target.getAttribute('x');
//   //   if (target.hasAttribute('y')) svgAttributes.y = target.getAttribute('y');
//   //   if (target.hasAttribute('width')) svgAttributes.width = target.getAttribute('width');
//   //   if (target.hasAttribute('height')) svgAttributes.height = target.getAttribute('height');
//   //   if (target.hasAttribute('fill')) svgAttributes.fill = target.getAttribute('fill');

//   //   const stylesToShow = {
//   //     color: computed.color,
//   //     fontSize: computed.fontSize,
//   //     backgroundColor: computed.backgroundColor,
//   //     margin: computed.margin,
//   //     padding: computed.padding,
//   //     fontWeight: computed.fontWeight,
//   //     opacity: computed.opacity,
//   //     boxShadow: computed.boxShadow,
//   //     borderRadius: computed.borderRadius,
//   //     // add more if you want
//   //     svgAttributes: {
//   //       ...svgAttributes
//   //     }
//   //   };
//   //   setSelectedElement(target);      // Save clicked element
//   //   setEditableStyles(stylesToShow); // Save its styles
//   //   setShowStyleEditor(true);         // Show dialog/modal
//   // };
  
//   // const handleIframeLoad = () => {
//   //   if (!previewRef.current) return;
//   //   const iframeDocument = previewRef.current.contentDocument;
//   //   if (!iframeDocument) return;
  
//   //   iframeDocument.addEventListener('click', handleRenderedClick);
//   //   iframeDocument.addEventListener('contextmenu', handleRightClick);

//   //     iframeDocument.documentElement.scrollTop = savedScrollTop.current;
//   //     console.log("Restored scrollTop to in iframe: ", savedScrollTop.current);
//   // };
  
//   const handleRightClick = (e) => {
//     e.preventDefault(); // stop default context menu
  
//     let target = e.target;
    
//     // Only target elements with our injected ID
//     if (!target.id || !target.id.startsWith(idPrefix)) return;
  
//     const computed = window.getComputedStyle(target);
  
//     const svgAttributes = {};
  
//     if (target.hasAttribute('x')) svgAttributes.x = target.getAttribute('x');
//     if (target.hasAttribute('y')) svgAttributes.y = target.getAttribute('y');
//     if (target.hasAttribute('width')) svgAttributes.width = target.getAttribute('width');
//     if (target.hasAttribute('height')) svgAttributes.height = target.getAttribute('height');
//     if (target.hasAttribute('fill')) svgAttributes.fill = target.getAttribute('fill');
  
//     const stylesToShow = {
//       color: computed.color,
//       fontSize: computed.fontSize,
//       backgroundColor: computed.backgroundColor,
//       margin: computed.margin,
//       padding: computed.padding,
//       fontWeight: computed.fontWeight,
//       opacity: computed.opacity,
//       boxShadow: computed.boxShadow,
//       borderRadius: computed.borderRadius,
//       textAlign: computed.textAlign,
//       fontStyle: computed.fontStyle,
//       textDecoration: computed.textDecoration,
//       // add more if you want
//       svgAttributes: {
//         ...svgAttributes
//       }
//     };
//     setSelectedElement(target);      // Save clicked element
//     setEditableStyles(stylesToShow); // Save its styles
//     setShowStyleEditor(true);         // Show dialog/modal
//   };
  
//   const handleIframeLoad = () => {
//     if (!previewRef.current) return;
//     const iframeDocument = previewRef.current.contentDocument;
//     if (!iframeDocument) return;
  
//     iframeDocument.addEventListener('click', handleRenderedClick);
//     iframeDocument.addEventListener('contextmenu', handleRightClick);
//     iframeDocument.addEventListener('mouseover', handleElementHover);
//     iframeDocument.addEventListener('mouseout', handleElementMouseOut);
  
//     iframeDocument.documentElement.scrollTop = savedScrollTop.current;
//     console.log("Restored scrollTop to in iframe: ", savedScrollTop.current);
//   };

//   const handleElementHover = (e) => {
//     // Find the closest element with our ID prefix
//     let target = e.target;
//     while (target && (!target.id || !target.id.startsWith(idPrefix))) {
//       if (target === previewRef.current) return; // Reached the container, no matching element
//       target = target.parentElement;
//     }
    
//     if (!target || !target.id || !target.id.startsWith(idPrefix)) return;
    
//     // Add blue outline to the hovered element
//     if (hoveredElement && hoveredElement !== target) {
//       hoveredElement.style.outline = '';
//     }
    
//     target.style.outline = '2px solid #3B82F6';
//     setHoveredElement(target);
//   };
  
//   const handleElementMouseOut = (e) => {
//     if (hoveredElement) {
//       hoveredElement.style.outline = '';
//       setHoveredElement(null);
//     }
//   };

//   const applyEditedStyles = () => {
//     if (selectedElement) {
//       Object.entries(editableStyles).forEach(([prop, value]) => {
//         selectedElement.style[prop] = value;
//       });
  
//       // After applying styles, update htmlContent with the iframe's current content
//       const iframeDoc = previewRef.current?.contentDocument;
//       if (iframeDoc) {
//         savedScrollTop.current = iframeDoc.documentElement.scrollTop;
//         const updatedHtml = iframeDoc.documentElement.outerHTML;
//         setHtmlContent(updatedHtml);
//       }
//     }
//     setShowStyleEditor(false);
//   };
  
//   // Handles live style changes 
//   const handleEditableStyleChange = (property, value) => {
//     setEditableStyles((prev) => {
//       // If the property is inside svgAttributes
//       if (prev.svgAttributes && property in prev.svgAttributes) {
//         return {
//           ...prev,
//           svgAttributes: {
//             ...prev.svgAttributes,
//             [property]: value,
//           },
//         };
//       }
  
//       // Otherwise update top-level styles
//       return {
//         ...prev,
//         [property]: value,
//       };
//     });
  
//     // Also update the actual element
//     if (selectedElement) {
//       const svgAttrs = ['x', 'y', 'width', 'height', 'fill', 'stroke'];
//       if (svgAttrs.includes(property)) {
//         selectedElement.setAttribute(property, value);
//       } else {
//         selectedElement.style[property] = value;
//       }
//     }
//   };
  
//   // #endregion
  




//   // #region MD

//   // Function Related to Markdown Files

//   // Update Markdown content when editing
//   const handleMarkDownChange = (e) => {
//     const iframeDoc = markdownPreviewRef.current?.contentDocument;
//     if (iframeDoc) {
//       savedScrollTop.current = iframeDoc.documentElement.scrollTop;
//       console.log("savedScrollTop on change (after layout): ", savedScrollTop.current);
//     }
//     console.log('setting changes')
//     restoreScrollPending.current = true;
//     setMarkdownContent(e.target.value);
//   };

//   const handleMarkdownPreviewLoad = () => {
//     if (!restoreScrollPending.current) return; // only restore if content just changed
//     const iframeDoc = markdownPreviewRef.current?.contentDocument;
//     if (!iframeDoc) return;
  
//     requestAnimationFrame(() => {
//       iframeDoc.documentElement.scrollTop = savedScrollTop.current || 0;
//       console.log("Restored scrollTop after markdown content change:", savedScrollTop.current);
  
//       restoreScrollPending.current = false; // reset
//     });
//   };
  
//   // Debounced scroll handler
//   const handleScrollSync = useCallback((source) => {
//     if (isSyncingScroll.current) return; // Prevent loops
//     if (fileType !== 'markdown') return;
    
//     const editor = markdownTextareaRef.current;
//     const previewIframe = markdownPreviewRef.current;
//     const previewDoc = previewIframe?.contentWindow?.document.documentElement;
    
//     if (!editor || !previewDoc) return;
    
//     isSyncingScroll.current = true; // Set flag
    
//     let scrollPercent = 0;
//     if (source === 'editor') {
//       // Ensure denominator is not zero
//       const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
//       if (editorScrollableHeight > 0) {
//         scrollPercent = editor.scrollTop / editorScrollableHeight;
//         previewDoc.scrollTop = scrollPercent * (previewDoc.scrollHeight - previewDoc.clientHeight);
//       }
//     } else if (source === 'preview') {
//       // Ensure denominator is not zero
//       const previewScrollableHeight = previewDoc.scrollHeight - previewDoc.clientHeight;
//       if (previewScrollableHeight > 0) {
//         scrollPercent = previewDoc.scrollTop / previewScrollableHeight;
//         editor.scrollTop = scrollPercent * (editor.scrollHeight - editor.clientHeight);
//       }
//     }
    
//     // Reset the flag after a short delay
//     clearTimeout(syncTimeoutRef.current);
//     syncTimeoutRef.current = setTimeout(() => {
//       isSyncingScroll.current = false;
//     }, 100); // Adjust delay as needed
    
//   }, [fileType]);


//   // Effect to add scroll listeners for Markdown
//   useEffect(() => {
//     if (fileType !== 'markdown') return;
//     console.log("inside")
//     const editor = markdownTextareaRef.current;
//     const previewIframe = markdownPreviewRef.current;
//     let previewWindow = null;
    
//     const handleEditorScroll = () => handleScrollSync('editor');
//     const handlePreviewScroll = () => handleScrollSync('preview');
    
//     const setupPreviewListener = () => {
//       previewWindow = previewIframe?.contentWindow;
//       if (previewWindow) {
//         previewWindow.addEventListener('scroll', handlePreviewScroll);
//       } else {
//         // Retry if iframe contentWindow isn't available immediately
//         setTimeout(setupPreviewListener, 100);
//       }
//     }
    
    
//     if (editor) {
//       editor.addEventListener('scroll', handleEditorScroll);
//     }
//     if (previewIframe) {
//       // Use onLoad for the iframe to ensure contentWindow is ready
//       previewIframe.onload = setupPreviewListener;
//       // Initial setup attempt in case it's already loaded
//       setupPreviewListener();
//     }
    
//     // Cleanup function
//     return () => {
//       if (editor) {
//         editor.removeEventListener('scroll', handleEditorScroll);
//       }
//       if (previewWindow) {
//         previewWindow.removeEventListener('scroll', handlePreviewScroll);
//       }
//       clearTimeout(syncTimeoutRef.current); // Clear timeout on cleanup
//     };
//   }, [fileType, handleScrollSync]); // Rerun if fileType or handler changes
  
//   // #endregion
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-dark-950 flex items-center justify-center">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="text-primary text-3xl font-serif mb-4">DARWIN</div>
//           <div className="text-gray-300">Loading your workspace...</div>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="min-h-screen flex flex-col bg-dark-950 overflow-clip">
//       {/* Top Navigation */}
//       <nav className="bg-dark-900 border-b border-dark-800 shadow-md">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="text-2xl font-serif text-primary font-bold tracking-wider">DARWIN</div>
//           <div className="flex items-center gap-4">
//             <div className="text-gray-300 hidden sm:block">
//               Welcome, <span className="text-white">{userData?.name}</span>
//             </div>
//             <button 
//               onClick={handleExport}
//               className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={!fileLoaded}
//               >
//               {fileType==="html" ? "Export Html" : "Export Markdown"}
//             </button>
//             <button 
//               onClick={handleLogout}
//               className="px-4 py-2 bg-dark-800 text-gray-200 rounded-lg hover:text-white hover:bg-dark-700 transition-colors"
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* File Upload Section */}
//       <div className="bg-dark-900 border-b border-dark-800 py-3 px-4">
//         <div className="flex flex-wrap items-center gap-4">
//           <label className="inline-flex items-center px-4 py-2 bg-dark-800 text-white rounded-lg cursor-pointer hover:bg-dark-700 transition-colors">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//             </svg>
//             Upload HTML File
//             <input type="file" accept=".html,.md" onChange={handleFileUpload} className="hidden" />
//           </label>
//           <div className={`text-sm ${fileLoaded ? 'text-green-500' : 'text-gray-400'}`}>
//             {fileLoaded ? "File loaded. Use the editor below to make changes." : "No file loaded. Upload an HTML file to begin editing."}
//           </div>
//         </div>
//       </div>

//       {/* Editor Section */}
//       <div className="flex-1 flex">
//         {/* Editor Panels Container */}
//         <div className="flex-1 flex overflow-hidden">
//           {/* Left Panel - Code Editor */}
//           <div 
//             className={`transition-all duration-300 flex flex-col bg-dark-950 ${
//               leftPanelCollapsed 
//                 ? 'w-12' 
//                 : rightPanelCollapsed 
//                   ? 'w-full' 
//                   : 'w-1/2'
//             }`}
//           >
//             <div className="bg-dark-900 p-2 flex justify-between items-center border-b border-dark-800">
//               <h3 className={`font-medium text-gray-200 ${leftPanelCollapsed ? 'hidden' : 'block'}`}>HTML Editor</h3>
//               <button 
//                 onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
//                 className="p-1 text-gray-400 hover:text-white"
//                 aria-label={leftPanelCollapsed ? "Expand editor" : "Collapse editor"}
//               >
//                 {leftPanelCollapsed ? (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
//                   </svg>
//                 ) : (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-hidden"> {/* Ensure this container allows scrolling */}
//               {!leftPanelCollapsed && fileType === "markdown" ? (
//                 <textarea
//                   ref={markdownTextareaRef} // Assign ref here
//                   value={markdownContent}
//                   onChange={(e) => handleMarkDownChange(e)}
//                   className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap text-sm"
//                   spellCheck="false"
//                 />
//               ) : !leftPanelCollapsed && fileType === "html" ? ( // Handle HTML case
//                 <textarea
//                   ref={textareaRef} // Keep original ref for HTML
//                   value={htmlContent}
//                   onChange={handleHtmlChange}
//                   className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap"
//                   placeholder="HTML code will appear here..."
//                   spellCheck="false"
//                 />
//               ) : null /* Handle collapsed or no file */}
//             </div>
//           </div>

//           {/* Right Panel - Preview */}
//           <div 
//             className={`transition-all duration-300 flex flex-col ${
//               rightPanelCollapsed 
//                 ? 'w-12' 
//                 : leftPanelCollapsed 
//                   ? 'w-full' 
//                   : 'w-1/2'
//             }`}
//           >
//             <div className="bg-dark-900 p-2 flex justify-between items-center border-b border-dark-800">
//               <h3 className={`font-medium text-gray-200 ${rightPanelCollapsed ? 'hidden' : 'block'}`}>Preview</h3>
//               <button 
//                 onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
//                 className="p-1 text-gray-400 hover:text-white"
//                 aria-label={rightPanelCollapsed ? "Expand preview" : "Collapse preview"}
//               >
//                 {rightPanelCollapsed ? (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
//                   </svg>
//                 ) : (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             <div className="flex-1 overflow-hidden bg-white">
//               {!rightPanelCollapsed && fileType === "markdown" ? (
//                 <iframe
//                   ref={markdownPreviewRef} 
//                   className="w-full h-full border-none "
//                   srcDoc={marked.parse(debouncedMarkdownContent)}
//                   title="Markdown Preview"
//                   sandbox="allow-scripts allow-same-origin"
//                   onLoad={handleMarkdownPreviewLoad}
//                 />
//               ): !rightPanelCollapsed && fileType === "html" ? (
//                 <iframe
//                   ref={previewRef}
//                   className="w-full h-full border-none"
//                   srcDoc={debouncedHtmlContent}
//                   title="HTML Preview"
//                   sandbox="allow-scripts allow-same-origin"
//                   onLoad={handleIframeLoad}
//                 />
//               ) : null /* Handle collapsed or no file */}
//             </div>

//             {/* Right Click Context Menu */}
//             {/* {showStyleEditor && <RightClickMenu2
//               showStyleEditor={showStyleEditor}
//               handleEditableStyleChange={handleEditableStyleChange}
//               editableStyles={editableStyles}
//               setShowStyleEditor={setShowStyleEditor}
//               applyEditedStyles={applyEditedStyles}
//             />} */}
//             {showStyleEditor && <RightClickMenu2
//   showStyleEditor={showStyleEditor}
//   handleEditableStyleChange={handleEditableStyleChange}
//   editableStyles={editableStyles}
//   setShowStyleEditor={setShowStyleEditor}
//   applyEditedStyles={applyEditedStyles}
//   selectedElement={selectedElement}
// />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;











import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useDebounce from '../hooks/useDebounced';

import { marked } from 'marked';
import RightClickMenu2 from '../components/RightClick' // Updated import path if needed

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
  const [hoveredElement, setHoveredElement] = useState(null); // Keep this state
    
  // --- Refs for Timed Hover Outline ---
  const hoverOutlineStyle = '2px solid #3B82F6'; // Blue outline
  const hoverTimeoutRef = useRef(null);         // To store the timeout ID
  const outlinedElementRef = useRef(null);      // To store the currently outlined element
  const HOVER_OUTLINE_DURATION = 1000; // Duration in milliseconds (1 second)
  // --- End Refs ---

  // Tags that need unique IDs for selection
  const tagsNeedingId = [
    'div', 'span', 'p', 'a', 'button', 'input', 'label', 'text', 'rect', 'line', 'path',
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
      // --- Get the current state from the iframe to ensure styles are exported ---
      let finalHtml = htmlContent;
      const iframeDoc = previewRef.current?.contentDocument;
      if (iframeDoc) {
        // Temporarily remove hover/highlight styles before cloning
        const highlightedElement = iframeDoc.querySelector('.darwin-element-highlight');
        if(highlightedElement) highlightedElement.classList.remove('darwin-element-highlight');
        if(hoveredElement) hoveredElement.style.outline = ''; // Ensure hover outline is removed too

        finalHtml = iframeDoc.documentElement.outerHTML;

        // Restore styles if needed (though they will be reapplied on next render/hover)
        if(highlightedElement) highlightedElement.classList.add('darwin-element-highlight');
        if(hoveredElement) hoveredElement.style.outline = hoverOutlineStyle;
      }
      const cleanedHtml = removeDummyIds(finalHtml);
      // --- End of iframe state capture ---


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
    // Add ID only if one doesn't already exist
     return html.replace(tagsRegex, (match, tagName, after) => {
        // Check if the tag already has an id attribute
        const existingIdMatch = match.match(/\s+id\s*=\s*["'][^"']*["']/i);
        if (existingIdMatch) {
          // If an ID exists, return the original match
          return match;
        }
        // If no ID exists, add the new one
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
        // console.log("savedScrollTop on change (after layout):", savedScrollTop.current);
      } else {
        // console.warn("iframeDoc or iframeDoc.documentElement is not available.");
      }
    } catch (error) {
      console.error("Error accessing iframe scrollTop:", error);
    }

    setHtmlContent(e.target.value);
  };


  const scrollToCodeByElementId = (elementId) => {
    if (!textareaRef.current) return;

    // Match the opening tag with the given ID
    // Make regex more robust to handle attributes before id
    const tagMatch = htmlContent.match(new RegExp(`<([a-zA-Z0-9]+)[^>]*\\sid=["']${elementId}["'][^>]*>`, "i"));
    if (!tagMatch || tagMatch.index === undefined) {
      console.warn(`Tag with id="${elementId}" not found.`);
      return;
    }

    const tagName = tagMatch[1];
    const startIdx = tagMatch.index;
    const openTag = tagMatch[0];
    let endIdx;

    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
    if (selfClosingTags.includes(tagName.toLowerCase())) { // Check lower case
      // Self-closing tag
      endIdx = startIdx + openTag.length;
    } else {
      // Find the corresponding closing tag - be careful with nested tags of the same type
      const closingTag = `</${tagName}>`;
      let balance = 1; // Start with 1 for the opening tag found
      let searchStart = startIdx + openTag.length;
      let tempEndIdx = -1;

      while(balance > 0) {
          const nextOpen = htmlContent.indexOf(`<${tagName}`, searchStart);
          const nextClose = htmlContent.indexOf(closingTag, searchStart);

          if (nextClose === -1) { // No more closing tags found
              tempEndIdx = -1;
              break;
          }

          if (nextOpen !== -1 && nextOpen < nextClose) {
              // Found another opening tag before the closing one
              balance++;
              searchStart = nextOpen + 1;
          } else {
              // Found the closing tag
              balance--;
              tempEndIdx = nextClose;
              searchStart = nextClose + closingTag.length;
          }
      }


      if (tempEndIdx !== -1) {
        endIdx = tempEndIdx + closingTag.length;
      } else {
        // Fallback if closing tag isn't found correctly (e.g., malformed HTML)
        console.warn(`Could not reliably find closing tag for ${tagName} with id ${elementId}. Selecting opening tag only.`);
        endIdx = startIdx + openTag.length;
      }
    }

    // Focus and select
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(startIdx, endIdx);

    // Vertical scroll (improved)
    const textBefore = htmlContent.substring(0, startIdx);
    const lineCountBefore = (textBefore.match(/\n/g) || []).length;
    const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight) || 20; // Use parseFloat
    const textareaHeight = textareaRef.current.clientHeight;
    // Try to center the selection vertically
    const targetScrollTop = Math.max(0, lineCountBefore * lineHeight - (textareaHeight / 2) + (lineHeight / 2));
    textareaRef.current.scrollTop = targetScrollTop;

    // Horizontal scroll (estimate)
    const lineStartIdx = htmlContent.lastIndexOf('\n', startIdx) + 1;
    const charOffsetInLine = startIdx - lineStartIdx;
    // Estimate character width (adjust as needed, maybe measure dynamically if possible)
    const charWidth = textareaRef.current.clientWidth / (textareaRef.current.cols || 80); // Rough estimate
    textareaRef.current.scrollLeft = Math.max(0, charOffsetInLine * charWidth - (textareaRef.current.clientWidth / 4)); // Scroll to make it visible
    // console.log(`Scrolled to tag with ID: ${elementId}`);
  };


  const handleRenderedClick = (e) => {
    e.stopPropagation();

    // Find closest element with our ID prefix
    let target = e.target;
    while (target && (!target.id || !target.id.startsWith(idPrefix))) {
      if (target === previewRef.current?.contentDocument?.documentElement || !target.parentElement) return; // Reached the container or top
      target = target.parentElement;
    }

    if (!target || !target.id || !target.id.startsWith(idPrefix)) return;


    const previousHighlighted = previewRef.current.contentDocument?.querySelector('.darwin-element-highlight');
    if (previousHighlighted && previousHighlighted !== target) { // Avoid removing from the same element
      previousHighlighted.classList.remove('darwin-element-highlight');
    }

    // Add highlight to the clicked element
    target.classList.add('darwin-element-highlight');

    const id = target.id;

    // Expand left panel if collapsed
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false);
      // Give panel time to expand before scrolling
       setTimeout(() => scrollToCodeByElementId(id), 350);
    } else {
       scrollToCodeByElementId(id);
    }
  };


  const handleRightClick = (e) => {
    e.preventDefault();

    let target = e.target;
    while (target && (!target.id || !target.id.startsWith(idPrefix))) {
      if (target === previewRef.current?.contentDocument?.documentElement || !target.parentElement) return;
      target = target.parentElement;
    }

    if (!target || !target.id || !target.id.startsWith(idPrefix)) return;

    // --- Clear any active hover outline when right-clicking ---
    clearTimeout(hoverTimeoutRef.current); // Clear pending timeout
    if (outlinedElementRef.current) {
        try { // Add try-catch for safety if element becomes invalid
           outlinedElementRef.current.style.outline = '';
        } catch (err) { console.warn("Error removing outline on right click:", err); }
        outlinedElementRef.current = null;
    }
    // --- End clear hover outline ---


    const computed = window.getComputedStyle(target);
    // ... (rest of handleRightClick logic as before)
      const svgAttributes = {};
    if (target.hasAttribute('x')) svgAttributes.x = target.getAttribute('x');
    if (target.hasAttribute('y')) svgAttributes.y = target.getAttribute('y');
    if (target.hasAttribute('width')) svgAttributes.width = target.getAttribute('width');
    if (target.hasAttribute('height')) svgAttributes.height = target.getAttribute('height');
    if (target.hasAttribute('fill')) svgAttributes.fill = target.getAttribute('fill');
    if (target.hasAttribute('stroke')) svgAttributes.stroke = target.getAttribute('stroke');

    const stylesToShow = {
      color: computed.color,
      fontSize: computed.fontSize,
      backgroundColor: computed.backgroundColor,
      margin: computed.margin,
      padding: computed.padding,
      fontWeight: computed.fontWeight,
      fontStyle: computed.fontStyle,
      textDecoration: computed.textDecoration,
      textAlign: computed.textAlign,
      opacity: computed.opacity,
      boxShadow: computed.boxShadow,
      borderRadius: computed.borderRadius,
      border: computed.border,
      svgAttributes: { ...svgAttributes }
    };

    setSelectedElement(target);
    setEditableStyles(stylesToShow);
    setShowStyleEditor(true);
  };

  const handleIframeLoad = () => {
    if (!previewRef.current) return;
    const iframeDocument = previewRef.current.contentDocument;
    if (!iframeDocument || !iframeDocument.body) {
      console.error("Iframe document or body not ready.");
      return;
    }

    // Clear previous listeners
    iframeDocument.removeEventListener('click', handleRenderedClick);
    iframeDocument.removeEventListener('contextmenu', handleRightClick);
    iframeDocument.removeEventListener('mouseover', handleElementHover);
    // No need for mouseout listener anymore
    // iframeDocument.removeEventListener('mouseout', handleElementMouseOut);

    // Add new listeners
    iframeDocument.addEventListener('click', handleRenderedClick);
    iframeDocument.addEventListener('contextmenu', handleRightClick);
    iframeDocument.addEventListener('mouseover', handleElementHover); // Add hover listener

    try {
      iframeDocument.documentElement.scrollTop = savedScrollTop.current;
    } catch (e) {
      console.error("Error restoring scroll position:", e);
    }
  };


  // --- Improved Hover Logic ---
  const handleElementHover = (e) => {
    let target = e.target;
    // Traverse up to find the element with the ID
    while (target && (!target.id || !target.id.startsWith(idPrefix))) {
        if (target === previewRef.current?.contentDocument?.documentElement || !target.parentElement) return;
        target = target.parentElement;
    }

    // Ignore if not a targetable element or if hovering over the already outlined element
    if (!target || !target.id || !target.id.startsWith(idPrefix) || target === outlinedElementRef.current) {
       return;
    }

    // --- Clear previous timeout and remove old outline ---
    clearTimeout(hoverTimeoutRef.current);
    if (outlinedElementRef.current) {
        try {
             outlinedElementRef.current.style.outline = '';
        } catch (err) { console.warn("Error removing previous outline:", err); }
    }
    // --- End clearing ---

    // --- Apply new outline ---
    try {
      target.style.outline = hoverOutlineStyle;
      outlinedElementRef.current = target; // Store the element that now has the outline
    } catch (err) {
      console.warn("Error applying outline:", err);
      outlinedElementRef.current = null; // Reset if error applying
      return; // Don't set timeout if outline failed
    }
    // --- End applying ---


    // --- Set timeout to remove the outline ---
    hoverTimeoutRef.current = setTimeout(() => {
        // Check if the element that triggered this timeout is STILL the one with the outline
        if (outlinedElementRef.current === target) {
             try {
                  target.style.outline = '';
                  outlinedElementRef.current = null; // Clear the ref as outline is removed
             } catch (err) {
                  console.warn("Error removing outline in timeout:", err);
                  outlinedElementRef.current = null; // Ensure ref is cleared even on error
             }
        }
         // No need to clear hoverTimeoutRef.current here, it's cleared on next hover
    }, HOVER_OUTLINE_DURATION);
    // --- End timeout ---
  };


  const applyEditedStyles = () => {
    if (selectedElement) {
        // --- Important: Update the element directly first ---
        Object.entries(editableStyles).forEach(([prop, value]) => {
             // Handle SVG attributes separately
            const svgAttrs = ['x', 'y', 'width', 'height', 'fill', 'stroke'];
            if (prop === 'svgAttributes') {
                Object.entries(value).forEach(([svgProp, svgValue]) => {
                     if (svgAttrs.includes(svgProp)) {
                        selectedElement.setAttribute(svgProp, svgValue);
                    }
                });
            } else if (!svgAttrs.includes(prop)) { // Apply regular CSS styles
                // Convert camelCase to kebab-case for style properties if needed,
                // though direct assignment usually works. Be explicit for clarity:
                 const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                 // Handle specific properties that might need units or special handling
                 if (prop === 'fontSize' && !isNaN(parseFloat(value)) && !value.endsWith('px') && !value.endsWith('em') && !value.endsWith('rem')) {
                     value = `${value}px`; // Add px unit if missing and looks like a number
                 }
                 selectedElement.style.setProperty(kebabProp, value);
            }
        });
        // --- End of direct element update ---


        // --- Update the htmlContent state based on the modified iframe ---
        const iframeDoc = previewRef.current?.contentDocument;
        if (iframeDoc) {
            // Save scroll position *before* getting outerHTML
            savedScrollTop.current = iframeDoc.documentElement.scrollTop;

            // Get the updated HTML *after* direct DOM manipulation
            const updatedHtml = iframeDoc.documentElement.outerHTML;
            setHtmlContent(updatedHtml); // Update the state which will cause a re-render
        } else {
             console.error("Could not get iframe document to update HTML content state.");
        }
    }
    setShowStyleEditor(false);
};


  // Handles live style changes
  const handleEditableStyleChange = (property, value) => {
    // Live update the actual element in the iframe
    if (selectedElement) {
        const svgAttrs = ['x', 'y', 'width', 'height', 'fill', 'stroke'];
        if (svgAttrs.includes(property)) {
            selectedElement.setAttribute(property, value);
             // Also update the svgAttributes part of the state
             setEditableStyles((prev) => ({
                ...prev,
                svgAttributes: {
                    ...prev.svgAttributes,
                    [property]: value,
                },
            }));
        } else {
             // Handle potential unit addition for live updates too
             let liveValue = value;
             if (property === 'fontSize' && !isNaN(parseFloat(value)) && !value.endsWith('px') && !value.endsWith('em') && !value.endsWith('rem')) {
                 liveValue = `${value}px`;
             }
            selectedElement.style[property] = liveValue;
             // Update the main part of the state
             setEditableStyles((prev) => ({
                ...prev,
                [property]: value, // Store the original value in state
            }));
        }
    } else {
         // Fallback: Just update state if selectedElement is somehow null
         setEditableStyles((prev) => {
            if (prev.svgAttributes && property in prev.svgAttributes) {
                return {
                    ...prev,
                    svgAttributes: { ...prev.svgAttributes, [property]: value }
                };
            }
            return { ...prev, [property]: value };
        });
    }
};


  // #endregion




  // #region MD

  // Function Related to Markdown Files

  // Update Markdown content when editing
  const handleMarkDownChange = (e) => {
    const iframeDoc = markdownPreviewRef.current?.contentDocument;
    if (iframeDoc) {
      savedScrollTop.current = iframeDoc.documentElement.scrollTop;
      // console.log("savedScrollTop on change (after layout): ", savedScrollTop.current);
    }
    // console.log('setting changes')
    restoreScrollPending.current = true;
    setMarkdownContent(e.target.value);
  };

  const handleMarkdownPreviewLoad = () => {
    if (!restoreScrollPending.current) return; // only restore if content just changed
    const iframeDoc = markdownPreviewRef.current?.contentDocument;
    if (!iframeDoc) return;

    requestAnimationFrame(() => {
      iframeDoc.documentElement.scrollTop = savedScrollTop.current || 0;
      // console.log("Restored scrollTop after markdown content change:", savedScrollTop.current);

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


  // Effect to add scroll listeners for Markdown
  useEffect(() => {
    if (fileType !== 'markdown') return;
    // console.log("inside")
    const editor = markdownTextareaRef.current;
    const previewIframe = markdownPreviewRef.current;
    let previewWindow = null;

    const handleEditorScroll = () => handleScrollSync('editor');
    const handlePreviewScroll = () => handleScrollSync('preview');

    const setupPreviewListener = () => {
      previewWindow = previewIframe?.contentWindow;
      if (previewWindow) {
         // Remove previous listener before adding new one
        previewWindow.removeEventListener('scroll', handlePreviewScroll);
        previewWindow.addEventListener('scroll', handlePreviewScroll);
      } else {
        // Retry if iframe contentWindow isn't available immediately
        setTimeout(setupPreviewListener, 100);
      }
    }


    if (editor) {
       // Remove previous listener before adding new one
      editor.removeEventListener('scroll', handleEditorScroll);
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
              {fileType==="html" ? "Export Html" : fileType === "markdown" ? "Export Markdown" : "Export"}
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
            Upload File (.html, .md)
            <input type="file" accept=".html,.md" onChange={handleFileUpload} className="hidden" />
          </label>
          <div className={`text-sm ${fileLoaded ? 'text-green-500' : 'text-gray-400'}`}>
            {fileLoaded ? `File loaded (${fileType}). Use the editor below.` : "No file loaded. Upload an HTML or Markdown file."}
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
              <h3 className={`font-medium text-gray-200 ${leftPanelCollapsed ? 'hidden' : 'block'}`}>
                {fileType === 'markdown' ? 'Markdown Editor' : 'HTML Editor'}
              </h3>
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
            <div className="flex-1 overflow-auto"> {/* Changed overflow-y-hidden to overflow-auto */}
              {!leftPanelCollapsed && fileType === "markdown" ? (
                <textarea
                  ref={markdownTextareaRef} // Assign ref here
                  value={markdownContent}
                  onChange={(e) => handleMarkDownChange(e)}
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap text-sm block" // Ensure it's block
                  spellCheck="false"
                />
              ) : !leftPanelCollapsed && fileType === "html" ? ( // Handle HTML case
                <textarea
                  ref={textareaRef} // Keep original ref for HTML
                  value={htmlContent}
                  onChange={handleHtmlChange}
                  className="w-full h-full p-4 bg-dark-950 text-gray-200 font-mono focus:outline-none resize-none code-editor text-nowrap block" // Ensure it's block
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

            <div className="flex-1 overflow-hidden bg-white relative"> {/* Added relative positioning */}
              {!rightPanelCollapsed && fileType === "markdown" ? (
                <iframe
                  ref={markdownPreviewRef}
                  className="w-full h-full border-none "
                  srcDoc={marked.parse(debouncedMarkdownContent)}
                  title="Markdown Preview"
                  sandbox="allow-scripts allow-same-origin" // Be cautious with allow-scripts if content isn't trusted
                  onLoad={handleMarkdownPreviewLoad}
                />
              ): !rightPanelCollapsed && fileType === "html" ? (
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-none"
                  srcDoc={debouncedHtmlContent}
                  title="HTML Preview"
                   // Consider security implications of sandbox='allow-scripts allow-same-origin'
                   // If the HTML can contain arbitrary scripts, it's a risk.
                   // 'allow-same-origin' is often needed for styles/interactions.
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={handleIframeLoad}
                />
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                      {rightPanelCollapsed ? '' : 'Preview Area'}
                  </div>
              ) }
            </div>

            {/* Right Click Context Menu */}
            {showStyleEditor && <RightClickMenu2
              showStyleEditor={showStyleEditor}
              handleEditableStyleChange={handleEditableStyleChange}
              editableStyles={editableStyles}
              setShowStyleEditor={setShowStyleEditor}
              applyEditedStyles={applyEditedStyles}
              selectedElement={selectedElement}
            />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;