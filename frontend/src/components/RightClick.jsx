import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Save } from 'lucide-react'; // Added Palette, Save

// Helper to check if a color is light or dark (for contrast)
const isColorLight = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string') return true; // Default to light background assumption
  const color = hexColor.startsWith('#') ? hexColor.substring(1, 7) : hexColor;
  if (color.length < 6) return true; // Handle shorthand hex
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  // Formula for perceived brightness (adjust threshold as needed)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150; // Threshold for considering it "light"
};


export default function RightClickMenu2({
  setShowStyleEditor,
  handleEditableStyleChange,
  editableStyles,
  applyEditedStyles,
  selectedElement
}) {
  // State for currently selected colors in the pickers/swatches
  const [selectedColor, setSelectedColor] = useState(editableStyles.color || '#000000');
  const [selectedBgColor, setSelectedBgColor] = useState(editableStyles.backgroundColor || 'transparent');

  // State for showing/hiding the native color pickers
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showCustomBgColorPicker, setShowCustomBgColorPicker] = useState(false);

  // State for the text content input
  const [elementText, setElementText] = useState(selectedElement?.textContent || '');

  // --- Custom Color Slots ---
  const [customTextColors, setCustomTextColors] = useState(['#ededed', '#a1a1a1', '#525252']); // Initial custom text colors
  const [customBgColors, setCustomBgColors] = useState(['#fca5a5', '#fdba74', '#bef264']); // Initial custom bg colors
  const [savingTextColorSlot, setSavingTextColorSlot] = useState(null); // Index (0, 1, 2) of slot being saved to
  const [savingBgColorSlot, setSavingBgColorSlot] = useState(null); // Index (0, 1, 2) of slot being saved to
  // --- End Custom Color Slots ---


  // Update local state if the editableStyles prop changes (e.g., selecting a different element)
   useEffect(() => {
    setSelectedColor(editableStyles.color || '#000000');
    setSelectedBgColor(editableStyles.backgroundColor || 'transparent');
    setElementText(selectedElement?.textContent || '');
    // Reset saving state when element changes
    setSavingTextColorSlot(null);
    setSavingBgColorSlot(null);
  }, [editableStyles, selectedElement]);


  // Predefined colors (can be customized)
  const predefinedTextColors = [
    '#000000', '#FFFFFF', '#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea', '#0891b2', '#ea580c', '#6b7280'
  ];
   const predefinedBgColors = [
    'transparent', '#FFFFFF', '#f87171', '#4ade80', '#60a5fa', '#facc15', '#c084fc', '#22d3ee', '#fb923c', '#e5e7eb'
  ];


  const toggleBold = () => {
    const currentWeight = editableStyles.fontWeight;
    // Toggle between 'normal' (usually 400) and 'bold' (usually 700)
    const newWeight = (currentWeight === '700' || currentWeight === 'bold') ? 'normal' : 'bold';
    handleEditableStyleChange('fontWeight', newWeight);
  };

  const toggleItalic = () => {
    const currentStyle = editableStyles.fontStyle || 'normal'; // Use editableStyles
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
    handleEditableStyleChange('fontStyle', newStyle);
  };

  const toggleUnderline = () => {
    const currentDecoration = editableStyles.textDecoration || 'none'; // Use editableStyles
    const newDecoration = currentDecoration.includes('underline') ? 'none' : 'underline';
    handleEditableStyleChange('textDecoration', newDecoration);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setElementText(newText);
    // Live update the text content of the element
    if (selectedElement) {
       // Only update if it's not an input/textarea itself to avoid conflicts
      if (selectedElement.tagName !== 'INPUT' && selectedElement.tagName !== 'TEXTAREA') {
        selectedElement.textContent = newText;
      } else {
         // For inputs/textareas, you might want to update the `value` attribute
         // This depends on how you want to handle editing form elements.
         // selectedElement.setAttribute('value', newText); // Example
      }
    }
  };


  // --- Color Handling ---
  const handleColorChange = (color) => {
    setSelectedColor(color); // Update the color picker's visual state
    handleEditableStyleChange('color', color); // Propagate change to Dashboard for live preview
    setShowCustomColorPicker(false); // Close native picker if open

    // If we are in "saving" mode for a text color slot
    if (savingTextColorSlot !== null) {
      const updatedColors = [...customTextColors];
      updatedColors[savingTextColorSlot] = color;
      setCustomTextColors(updatedColors);
      setSavingTextColorSlot(null); // Exit saving mode
    }
  };

  const handleBgColorChange = (color) => {
    setSelectedBgColor(color);
    handleEditableStyleChange('backgroundColor', color);
    setShowCustomBgColorPicker(false);

     // If we are in "saving" mode for a background color slot
    if (savingBgColorSlot !== null) {
      const updatedColors = [...customBgColors];
      updatedColors[savingBgColorSlot] = color;
      setCustomBgColors(updatedColors);
      setSavingBgColorSlot(null); // Exit saving mode
    }
  };

  // Function to initiate saving to a custom text color slot
  const startSavingTextColor = (index) => {
    setSavingTextColorSlot(index);
    // Optionally open the custom picker immediately
    // setShowCustomColorPicker(true);
     alert(`Click on any color (predefined or custom picker) to save it to slot ${index + 1}.`);
  };

  // Function to initiate saving to a custom background color slot
  const startSavingBgColor = (index) => {
    setSavingBgColorSlot(index);
    alert(`Select any custom color to save it to slot ${index + 1}.`);
    // setShowCustomBgColorPicker(true);
  };
  // --- End Color Handling ---


  const handleApplyChanges = () => {
     // Ensure final text content is set before calling applyEditedStyles
     if (selectedElement && elementText !== selectedElement.textContent) {
       // Check again if it's an input/textarea or regular element
       if (selectedElement.tagName !== 'INPUT' && selectedElement.tagName !== 'TEXTAREA') {
          selectedElement.textContent = elementText;
       } else {
          // Maybe update value attribute if needed for export? Depends on use case.
          // selectedElement.setAttribute('value', elementText);
       }
     }
    applyEditedStyles(); // This function in Dashboard now handles updating state from iframe
  };

  // Determine active states directly from editableStyles passed from Dashboard
  const isBold = editableStyles.fontWeight === '700' || editableStyles.fontWeight === 'bold';
  const isItalic = editableStyles.fontStyle === 'italic';
  const isUnderlined = editableStyles.textDecoration?.includes('underline');


  // Dynamic class for color swatches
  const getSwatchClasses = (color, type) => {
    const isSelected = type === 'text' ? selectedColor === color : selectedBgColor === color;
    let classes = `w-6 h-6 rounded-full border cursor-pointer transition-transform hover:scale-110 `;
    classes += isSelected ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800 ' : 'border-gray-300 dark:border-gray-600 ';
    if (color === 'transparent') {
      classes += ' transparent-swatch'; // Use CSS class for pattern
    }
    return classes;
  };

  // Dynamic class for custom color slots
   const getCustomSlotClasses = (color, index, type) => {
    const isSaving = type === 'text' ? savingTextColorSlot === index : savingBgColorSlot === index;
    let classes = `w-7 h-7 rounded border-2 cursor-pointer relative group flex items-center justify-center transition-all `;
    classes += isSaving ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-1 ' : 'border-gray-400 dark:border-gray-500 hover:border-blue-400 ';
     if (color === 'transparent') {
       classes += ' transparent-swatch';
     }
     return classes;
  };


  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black/50 flex items-center justify-start pl-44 z-50 p-4 animate-in fade-in duration-200"
         onClick={(e) => {
             if (e.target === e.currentTarget) { // Only close if clicking backdrop itself
                 setShowStyleEditor(false);
                 setSavingBgColorSlot(null); // Cancel saving if backdrop is clicked
                 setSavingTextColorSlot(null);
             }
         }}>
      {/* Editor Panel */}
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-5 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
             <Palette size={20} className="mr-2 text-blue-500"/> Style Editor
          </h2>
          <button
            onClick={() => setShowStyleEditor(false)}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close Style Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        {/* Text Content Editor (Only show if element is not an input/textarea) */}
        {selectedElement && selectedElement.tagName !== 'INPUT' && selectedElement.tagName !== 'TEXTAREA' && (
            <div className="mb-4">
            <label htmlFor="elementTextContent" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Text Content</label>
            <textarea
                id="elementTextContent"
                type="text"
                value={elementText}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none max-h-[200px] min-h-[80px]"
                placeholder="Enter text content..."
            />
            </div>
        )}


        {/* --- Improved Text Formatting --- */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Formatting</label>
          <div className="flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-md border border-gray-200 dark:border-gray-600">
            {/* Style Buttons */}
            <button onClick={toggleBold} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${isBold ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Bold (Ctrl+B)"> <Bold size={18} /> </button>
            <button onClick={toggleItalic} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${isItalic ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Italic (Ctrl+I)"> <Italic size={18} /> </button>
            <button onClick={toggleUnderline} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${isUnderlined ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Underline (Ctrl+U)"> <Underline size={18} /> </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

             {/* Alignment Buttons */}
            <button onClick={() => handleEditableStyleChange('textAlign', 'left')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editableStyles.textAlign === 'left' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Align Left"> <AlignLeft size={18} /> </button>
            <button onClick={() => handleEditableStyleChange('textAlign', 'center')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editableStyles.textAlign === 'center' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Align Center"> <AlignCenter size={18} /> </button>
            <button onClick={() => handleEditableStyleChange('textAlign', 'right')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editableStyles.textAlign === 'right' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Align Right"> <AlignRight size={18} /> </button>
            <button onClick={() => handleEditableStyleChange('textAlign', 'justify')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editableStyles.textAlign === 'justify' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`} title="Justify"> <AlignJustify size={18} /> </button>
           </div>
        </div>


        {/* --- Improved Color Selection --- */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">
          {/* Text Color Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Text Color</label>
            <div className="space-y-2">
                {/* Predefined Swatches */}
                <div className="flex flex-wrap gap-2 items-center">
                {predefinedTextColors.map((color) => (
                    <button
                    key={`text-${color}`}
                    onClick={() => handleColorChange(color)}
                    className={getSwatchClasses(color, 'text')}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Set text color to ${color}`}
                    />
                ))}
                {/* Native Color Picker Trigger */}
                <button
                    onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                    title="Choose custom text color"
                    aria-label="Choose custom text color"
                >
                    <Palette size={18} />
                </button>
                </div>
                 {/* Native Color Picker Input (conditionally rendered) */}
                 {showCustomColorPicker && (
                    <input
                        type="color"
                        value={selectedColor === 'transparent' ? '#000000' : selectedColor} // Avoid transparent in native picker
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-8 border-none cursor-pointer p-0"
                        aria-label="Custom text color picker"
                    />
                )}
                 {/* Custom Color Slots */}
                 <div className="flex flex-wrap gap-2 pt-1 items-center">
                     <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Saved:</span>
                    {customTextColors.map((color, index) => (
                        <button
                            key={`custom-text-${index}`}
                            onClick={() => handleColorChange(color)} // Click applies the saved color
                            className={getCustomSlotClasses(color, index, 'text')}
                            style={{ backgroundColor: color }}
                            title={`Apply saved color ${color}. Double-click the save icon to overwrite.`}
                            aria-label={`Apply saved text color ${color}`}
                         >
                             {/* Save Icon (appears on hover) - use double click to initiate save */}
                             <Save
                                 size={14}
                                 className={`absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isColorLight(color) ? 'text-gray-800' : 'text-white'}`}
                                 onDoubleClick={(e) => { e.stopPropagation(); startSavingTextColor(index); }} // Use double-click to save
                                 title={`Double click to save current color (${selectedColor}) here`}
                            />
                            {/* Indicator when this slot is the target for saving */}
                            {savingTextColorSlot === index && <div className="absolute inset-0 bg-black/30 animate-pulse rounded"></div>}
                        </button>
                    ))}
                 </div>
            </div>
          </div>

          {/* Background Color Section */}
          <div>
             <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Background Color</label>
              <div className="space-y-2">
                  {/* Predefined Swatches */}
                <div className="flex flex-wrap gap-2 items-center">
                {predefinedBgColors.map((color) => (
                    <button
                    key={`bg-${color}`}
                    onClick={() => handleBgColorChange(color)}
                    className={getSwatchClasses(color, 'bg')}
                    style={color === 'transparent' ? {} : { backgroundColor: color }} // Don't set bg for transparent
                    title={color === 'transparent' ? 'Transparent' : color}
                    aria-label={`Set background color to ${color}`}
                    />
                ))}
                {/* Native Color Picker Trigger */}
                 <button
                    onClick={() => setShowCustomBgColorPicker(!showCustomBgColorPicker)}
                     className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                    title="Choose custom background color"
                     aria-label="Choose custom background color"
                 >
                    <Palette size={18} />
                </button>
                </div>
                 {/* Native Color Picker Input */}
                {showCustomBgColorPicker && (
                    <input
                        type="color"
                        value={selectedBgColor === 'transparent' ? '#ffffff' : selectedBgColor}
                        onChange={(e) => handleBgColorChange(e.target.value)}
                        className="w-full h-8 border-none cursor-pointer p-0"
                         aria-label="Custom background color picker"
                    />
                )}
                 {/* Custom Color Slots */}
                <div className="flex flex-wrap gap-2 pt-1 items-center">
                     <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Custom Color:</span>
                     {customBgColors.map((color, index) => (
                        <button
                            key={`custom-bg-${index}`}
                            onClick={() => handleBgColorChange(color)} // Click applies the saved color
                            className={getCustomSlotClasses(color, index, 'bg')}
                             style={color === 'transparent' ? {} : { backgroundColor: color }}
                            title={`Apply saved color ${color}. Double-click the save icon to overwrite.`}
                            aria-label={`Apply saved background color ${color}`}
                         >
                             {/* Save Icon */}
                            <Save
                                size={14}
                                className={`absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isColorLight(color) ? 'text-gray-800' : 'text-white'}`}
                                onDoubleClick={(e) => { e.stopPropagation(); startSavingBgColor(index); }} // Use double-click to save
                                title={`Double click to save current color (${selectedBgColor}) here`}
                            />
                             {/* Indicator when this slot is the target for saving */}
                            {savingBgColorSlot === index && <div className="absolute inset-0 bg-black/30 animate-pulse rounded"></div>}
                        </button>
                    ))}
                </div>
              </div>
          </div>
        </div>


        {/* Font Size Selector */}
        <div className="mb-5">
            <label htmlFor="fontSizeSelect" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Font Size</label>
            <select
                id="fontSizeSelect"
                value={editableStyles.fontSize || '16px'} // Provide default
                onChange={(e) => handleEditableStyleChange('fontSize', e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
                 {/* Common font sizes */}
                 {[ '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'].map(size => (
                     <option key={size} value={size}>{size}</option>
                 ))}
                 {/* Add current value if not in the list */}
                {editableStyles.fontSize && ![ '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'].includes(editableStyles.fontSize) && (
                    <option value={editableStyles.fontSize}>{editableStyles.fontSize} (Current)</option>
                )}
            </select>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowStyleEditor(false)}
            className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {/* <button
            onClick={handleApplyChanges}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-gray-800"
          >
            Apply Changes
          </button> */}
        </div>
      </div>
    </div>
  );
}