import { useState } from 'react';
import { TeamManagement } from './TeamManagement';
import { FAQManagement } from './FAQManagement';
import { JobManagement } from './JobManagement';
import { Users, HelpCircle, Briefcase } from 'lucide-react';

export const ContentIndex = () => {
  const [activeTab, setActiveTab] = useState('team');

  const tabs = [
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage website content for About, FAQs, and Careers pages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-[#ff914d] text-[#ff914d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'faqs' && <FAQManagement />}
          {activeTab === 'jobs' && <JobManagement />}
        </div>
      </div>
    </div>
  );
};