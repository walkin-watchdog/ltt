import type { AvailabilityTabProps } from '@/types';
import React, { useState, useEffect } from 'react';

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  formData,
  updateFormData,
}) => {
  const { availabilityStartDate, availabilityEndDate, blockedDates = [] } = formData;

  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlockDate('');
    setBlockReason('');
    setError(null);
  }, [availabilityStartDate, availabilityEndDate]);

  const isWithinWindow = (d: string) => {
    if (!availabilityStartDate) return false;
    const dt = new Date(d);
    const start = new Date(availabilityStartDate);
    if (dt < start) return false;
    if (availabilityEndDate) {
      const end = new Date(availabilityEndDate);
      return dt <= end;
    }
    return true;
  };

  const addBlocked = () => {
    if (!blockDate) {
      setError('Please pick a date to block');
      return;
    }
    if (!isWithinWindow(blockDate)) {
      setError('Date must be within your availability window');
      return;
    }
    if (blockedDates.find(b => b.date === blockDate)) {
      setError('This date is already blocked');
      return;
    }
    const updated = [...blockedDates, { date: blockDate, reason: blockReason || undefined }];
    updateFormData({ blockedDates: updated });
    setBlockDate('');
    setBlockReason('');
    setError(null);
  };

  const removeBlocked = (date: string) => {
    updateFormData({
      blockedDates: blockedDates.filter(b => b.date !== date)
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Availability window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            value={availabilityStartDate}
            onChange={e => updateFormData({ availabilityStartDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-[#ff914d]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (optional)
          </label>
          <input
            type="date"
            // defaultValue=""
            min={availabilityStartDate || undefined}
            value={availabilityEndDate || ''}
            onChange={e => updateFormData({ availabilityEndDate: e.target.value || undefined })}
            className="w-full px-3 py-2 border rounded-md focus:ring-[#ff914d]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for “forever” availability
          </p>
        </div>
      </div>

      {/* 2. Block specific dates */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Block Specific Dates</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Choose a Date to Block</label>
            <input
              type="date"
              // defaultValue=""
              value={blockDate || ''}
              min={availabilityStartDate || undefined}
              max={availabilityEndDate || undefined}
              onChange={e => setBlockDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-[#ff914d]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              placeholder="e.g., Maintenance"
              className="w-full px-3 py-2 border rounded-md focus:ring-[#ff914d]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addBlocked}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Block Date(s)
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        {blockedDates.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">Currently blocked dates:</p>
            <div className="flex flex-wrap gap-2">
              {blockedDates.map(b => (
                <span
                  key={b.date}
                  className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                >
                  {new Date(b.date).toLocaleDateString('en-IN')}
                  {b.reason && ` (${b.reason})`}
                  <button
                    onClick={() => removeBlocked(b.date)}
                    className="ml-1 text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};