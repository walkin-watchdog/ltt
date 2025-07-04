import { Plus, X } from "lucide-react";
import { useState } from "react";
import { predefinedCategories } from "./predefinedcategories";
import type { newItem } from "@/types.ts";

interface ContentElementsProps {
  formData: any
  handleSaveAndContinue: () => void;
  newItem: newItem,
  setNewItem: (item: newItem) => void;
  addItem: (type: string, item: string) => void;
  removeItem: (type: string, index: number) => void;
  getDescription: (category: string, item: string) => string;
}
export const ContentElements = ({
  formData,
  handleSaveAndContinue,
  newItem,
  setNewItem,
  addItem,
  removeItem,
  getDescription
}:ContentElementsProps) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [customDescription, setCustomDescription] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);
return (
    <div className="space-y-8">
      {/* Highlights section remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h4>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.highlight}
                onChange={(e) => setNewItem({ ...newItem, highlight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a highlight"
                onKeyPress={(e) => e.key === 'Enter' && addItem('highlights', newItem.highlight)}
              />
              <button
                type="button"
                onClick={() => addItem('highlights', newItem.highlight)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.highlights || []).map((highlight: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700">{highlight}</span>
                    <button
                      onClick={() => removeItem('highlights', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.highlights || formData.highlights.length === 0) && (
                  <li className="p-3 text-gray-500 text-center">No highlights added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Updated Inclusions section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Inclusions</h4>
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                    setShowCustomForm(e.target.value === 'Custom');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  {Object.keys(predefinedCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {selectedCategory && selectedCategory !== 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Select item...</option>
                    {predefinedCategories[selectedCategory as keyof typeof predefinedCategories].items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  {selectedSubcategory && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getDescription(selectedCategory, selectedSubcategory)}
                    </p>
                  )}
                </div>
              )}

              {showCustomForm && (
                <div className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter custom category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter custom title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter description (optional)"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  let itemToAdd = '';
                  if (showCustomForm && customTitle) {
                    itemToAdd = customDescription ? `${customTitle} - ${customDescription}` : customTitle;
                  } else if (selectedSubcategory) {
                    const description = getDescription(selectedCategory, selectedSubcategory);
                    itemToAdd = description ? `${selectedSubcategory} - ${description}` : selectedSubcategory;
                  }
                  
                  if (itemToAdd) {
                    addItem('inclusions', itemToAdd);
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setCustomTitle('');
                    setCustomCategory('');
                    setCustomDescription('');
                    setShowCustomForm(false);
                  }
                }}
                disabled={(!selectedSubcategory && !customTitle)}
                className="w-full px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:bg-gray-300"
              >
                Add Inclusion
              </button>
            </div>

            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.inclusions || []).map((inclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm">{inclusion}</span>
                    <button
                      onClick={() => removeItem('inclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.inclusions || formData.inclusions.length === 0) && (
                  <li className="p-3 text-gray-500 text-center">No inclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Updated Exclusions section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h4>
          <div className="space-y-4">
            {/* Category Selection for Exclusions */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newItem.exclusion}
                  onChange={(e) => {
                    setNewItem({ ...newItem, exclusion: e.target.value });
                    setShowCustomForm(e.target.value === 'Custom');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  {Object.keys(predefinedCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {newItem.exclusion && newItem.exclusion !== 'Custom' && newItem.exclusion !== '' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                  <select
                    value={newItem.exclusionText || ''}
                    onChange={(e) => setNewItem({ ...newItem, exclusionText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  >
                    <option value="">Select item...</option>
                    {predefinedCategories[newItem.exclusion as keyof typeof predefinedCategories].items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  {newItem.exclusionText && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getDescription(newItem.exclusion, newItem.exclusionText)}
                    </p>
                  )}
                </div>
              )}

              {newItem.exclusion === 'Custom' && (
                <div className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter custom category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Title</label>
                    <input
                      type="text"
                      value={newItem.exclusionText || ''}
                      onChange={(e) => setNewItem({ ...newItem, exclusionText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter custom title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Enter description (optional)"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  let itemToAdd = '';
                  if (newItem.exclusion === 'Custom' && newItem.exclusionText) {
                    itemToAdd = customDescription ? `${newItem.exclusionText} - ${customDescription}` : newItem.exclusionText;
                  } else if (newItem.exclusionText && newItem.exclusion) {
                    const description = getDescription(newItem.exclusion, newItem.exclusionText);
                    itemToAdd = description ? `${newItem.exclusionText} - ${description}` : newItem.exclusionText;
                  }
                  
                  if (itemToAdd) {
                    addItem('exclusions', itemToAdd);
                    setNewItem({ ...newItem, exclusion: '', exclusionText: '' });
                    setCustomCategory('');
                    setCustomDescription('');
                    setShowCustomForm(false);
                  }
                }}
                disabled={!newItem.exclusionText}
                className="w-full px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:bg-gray-300"
              >
                Add Exclusion
              </button>
            </div>

            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.exclusions || []).map((exclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm">{exclusion}</span>
                    <button
                      onClick={() => removeItem('exclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.exclusions || formData.exclusions.length === 0) && (
                  <li className="p-3 text-gray-500 text-center">No exclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Tags section remains the same */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newItem.tag}
                onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && addItem('tags', newItem.tag)}
              />
              <button
                type="button"
                onClick={() => addItem('tags', newItem.tag)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-r-md hover:bg-[#e8823d] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto p-3">
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeItem('tags', index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(!formData.tags || formData.tags.length === 0) && (
                  <span className="text-gray-500 text-sm">No tags added</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSaveAndContinue}
          className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}