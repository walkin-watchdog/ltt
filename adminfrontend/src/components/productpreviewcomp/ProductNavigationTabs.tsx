
export const ProductNavigationTabs = ({ 
  activeTab, 
  handleTabClick 
}:
{
activeTab: 'overview' | 'itinerary' | 'inclusions' | 'policies';
  handleTabClick: (tab: 'overview' | 'itinerary' | 'inclusions' | 'policies') => void;
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'inclusions', label: "What's Included" },
    { id: 'policies', label: 'Policies' },
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm top-6 z-10">
      <nav className="border-b flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-[#ff914d] text-[#ff914d]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};