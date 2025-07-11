import { Plus, X } from "lucide-react";
import { useState } from "react";
import { predefinedCategories } from "./predefinedcategories";
import type { ContentElementsProps } from "@/types";


export const ContentElements = ({
  formData,
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
    <div className="space-y-6 md:space-y-8">
      {/* Highlights and Inclusions section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h4>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-0">
              <input
                type="text"
                value={newItem.highlight}
                onChange={(e) => setNewItem({ ...newItem, highlight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-t-md sm:rounded-l-md sm:rounded-t-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a highlight"
                onKeyPress={(e) => e.key === 'Enter' && addItem('highlights', newItem.highlight)}
              />
              <button
                type="button"
                onClick={() => addItem('highlights', newItem.highlight)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-b-md sm:rounded-r-md sm:rounded-b-md hover:bg-[#e8823d] transition-colors flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.highlights || []).map((highlight: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm break-words flex-1 mr-2">{highlight}</span>
                    <button
                      onClick={() => removeItem('highlights', index)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.highlights || formData.highlights.length === 0) && (
                  <li className="p-3 text-gray-500 text-center text-sm">No highlights added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Updated Inclusions section */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
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
                    {predefinedCategories[selectedCategory as keyof typeof predefinedCategories]?.items?.map((item: string) => (
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
                      placeholder="e.g., Transportation, Food & Drinks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="e.g., Airport pickup, Welcome drink"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                      placeholder="Additional details about this inclusion"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:space-x-0">
                <button
                  type="button"
                  onClick={() => {
                    let itemToAdd = '';
                    if (showCustomForm && customTitle) {
                      itemToAdd = customDescription ? 
                        `${customTitle} - ${customDescription}` : 
                        customTitle;
                    } else if (selectedSubcategory) {
                      const description = getDescription(selectedCategory, selectedSubcategory);
                      itemToAdd = description ? 
                        `${selectedSubcategory} - ${description}` : 
                        selectedSubcategory;
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
                  disabled={
                    showCustomForm ? !customTitle : !selectedSubcategory
                  }
                  className="w-full px-4 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inclusion
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.inclusions || []).map((inclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm break-words flex-1 mr-2">{inclusion}</span>
                    <button
                      onClick={() => removeItem('inclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.inclusions || formData.inclusions.length === 0) && (
                  <li className="p-3 text-gray-500 text-center text-sm">No inclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusions and Tags section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h4>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-0">
              <input
                type="text"
                value={newItem.exclusion}
                onChange={(e) => setNewItem({ ...newItem, exclusion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-t-md sm:rounded-l-md sm:rounded-t-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add an exclusion"
                onKeyPress={(e) => e.key === 'Enter' && addItem('exclusions', newItem.exclusion)}
              />
              <button
                type="button"
                onClick={() => addItem('exclusions', newItem.exclusion)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-b-md sm:rounded-r-md sm:rounded-b-md hover:bg-[#e8823d] transition-colors flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.exclusions || []).map((exclusion: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm break-words flex-1 mr-2">{exclusion}</span>
                    <button
                      onClick={() => removeItem('exclusions', index)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.exclusions || formData.exclusions.length === 0) && (
                  <li className="p-3 text-gray-500 text-center text-sm">No exclusions added</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-0">
              <input
                type="text"
                value={newItem.tag}
                onChange={(e) => setNewItem({ ...newItem, tag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-t-md sm:rounded-l-md sm:rounded-t-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && addItem('tags', newItem.tag)}
              />
              <button
                type="button"
                onClick={() => addItem('tags', newItem.tag)}
                className="px-3 py-2 bg-[#ff914d] text-white rounded-b-md sm:rounded-r-md sm:rounded-b-md hover:bg-[#e8823d] transition-colors flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {(formData.tags || []).map((tag: string, index: number) => (
                  <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span className="text-gray-700 text-sm break-words flex-1 mr-2">{tag}</span>
                    <button
                      onClick={() => removeItem('tags', index)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {(!formData.tags || formData.tags.length === 0) && (
                  <li className="p-3 text-gray-500 text-center text-sm">No tags added</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}