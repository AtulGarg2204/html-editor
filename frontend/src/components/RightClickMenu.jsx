import { SketchPicker } from 'react-color';

export default function RightClickMenu({setShowStyleEditor,handleEditableStyleChange,editableStyles,applyEditedStyles}){

  console.log("Editable Styles: ",editableStyles)
  const boxShadowOptions = {
    none: 'none',
    small: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px',
    medium: 'rgba(0, 0, 0, 0.1) 0px 4px 6px 0px',
    large: 'rgba(0, 0, 0, 0.1) 0px 10px 15px 0px',
    extra: 'rgba(0, 0, 0, 0.1) 0px 20px 25px 0px',
  };
  const borderRadiusOptions = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '16px',
    full: '9999px',
  };
  const getBorderRadiusLabel = (value) => {
    for (const [label, css] of Object.entries(borderRadiusOptions)) {
      if (css === value) return label;
    }
    return 'custom'; // fallback if it's not a predefined option
  };
  const getBoxShadowLabel = (value) => {
    for (const [label, css] of Object.entries(boxShadowOptions)) {
      if (css.replace(/\s+/g, '') === value.replace(/\s+/g, '')) {
        return label;
      }
    }
    return 'none'; // default/fallback
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-[420px] max-w-[90vw] animate-in zoom-in-95 duration-150">
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
                  <option value="100">100</option>
                  <option value="100">200</option>
                  <option value="100">300</option>
                  <option value="400">400</option>
                  <option value="400">500</option>
                  <option value="700">600</option>
                  <option value="700">700</option>
                  <option value="700">800</option>
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
            
            {/* <div className="space-y-2">
              <label className="text-sm font-medium block">Border Radius</label>
              <input
                type="text"
                value={editableStyles.borderRadius}
                onChange={(e) => handleEditableStyleChange('borderRadius', e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div> */}

            <div className="space-y-2">
              <label className="text-sm font-medium block">Border Radius</label>
              <select
                value={getBorderRadiusLabel(editableStyles.borderRadius)}
                onChange={(e) =>
                  handleEditableStyleChange('borderRadius', borderRadiusOptions[e.target.value])
                }
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium block">Box Shadow</label>
              <select
                value={getBoxShadowLabel(editableStyles.boxShadow)}
                onChange={(e) =>
                  handleEditableStyleChange('boxShadow', boxShadowOptions[e.target.value])
                }
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra">Extra Large</option>
              </select>
            </div>
          </div>
              
        
          <div className='grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
            {editableStyles.svgAttributes && Object.entries(editableStyles.svgAttributes).map(([attr, value]) => (
              <div key={attr} className="space-y-2 col-span-1">
                <label className="text-sm font-medium block capitalize">{attr}</label>
                <input
                  value={value}
                  onChange={(e) => handleEditableStyleChange(attr, e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
              </div>
            ))}
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
  )
}