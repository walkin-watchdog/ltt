import { EndPointMap } from "../ui/EndPointMap";
import { MeetingPointMap } from "../ui/MeetingPointMap";
import { PickupLocationMap } from "../ui/PickupLocationMap";

interface PickupOptionsTabProps {
    formData: any;
    updateFormData: (updates: any) => void;
    handleSaveAndContinue: () => void;
    pickupOption: string;
    setPickupOption: (option: string) => void;
}

export const PickupOptionsTab = ({ 
    formData, 
    updateFormData, 
    handleSaveAndContinue,
    pickupOption,
    setPickupOption,
}: PickupOptionsTabProps) => {
return (
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Pickup Configuration</h4>
                    <p className="text-sm text-gray-600 mb-6">Configure how travelers will meet or be picked up</p>
                </div>
        
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Option *
                    </label>
                    <select
                        value={pickupOption}
                        onChange={e => {
                            setPickupOption(e.target.value);
                            updateFormData({ pickupOption: e.target.value });
                            if (e.target.value === 'We pick up all travelers') {
                                updateFormData({ meetingPoint: '', meetingPoints: [] });
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                        required
                    >
                        <option value="">Select pickup option</option>
                        <option value="We pick up all travelers">We pick up all travelers</option>
                        <option value="We can pick up travelers or meet them at a meeting point">
                            We can pick up travelers or meet them at a meeting point
                        </option>
                        <option value="No, we meet all travelers at a meeting point">
                            No, we meet all travelers at a meeting point
                        </option>
                    </select>
                </div>
        
                {(pickupOption === 'We pick up all travelers' ||
                    pickupOption === 'We can pick up travelers or meet them at a meeting point') && (
                        <>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allow travelers to choose their pickup point?
                                </label>
                                <select
                                    value={formData.allowTravelersPickupPoint ? 'yes' : 'no'}
                                    onChange={e => updateFormData({ allowTravelersPickupPoint: e.target.value === 'yes' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How long before departure should travelers be at the pickup point?
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={formData.pickupStartTimeValue || ''}
                                        onChange={e => updateFormData({ pickupStartTimeValue: Number(e.target.value) })}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., 15"
                                    />
                                    <select
                                        value={formData.pickupStartTimeUnit || 'minutes'}
                                        onChange={e => updateFormData({ pickupStartTimeUnit: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="minutes">minutes</option>
                                        <option value="hours">hours</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Pickup Details
                                </label>
                                <textarea
                                    value={formData.additionalPickupDetails || ''}
                                    onChange={e => updateFormData({ additionalPickupDetails: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Any extra info for travelers"
                                />
                            </div>
                            <div className="mt-4">
                                <PickupLocationMap
                                    locations={formData.pickupLocationDetails || []}
                                    onLocationsChange={locs => updateFormData({ pickupLocationDetails: locs })}
                                />
                            </div>
                        </>
                    )}
        
                {(pickupOption === 'We can pick up travelers or meet them at a meeting point' ||
                    pickupOption === 'No, we meet all travelers at a meeting point') && (
                        <>
                            <div className="mt-4">
                                <MeetingPointMap
                                    meetingPoints={formData.meetingPoints || []}
                                    onMeetingPointsChange={points => updateFormData({ meetingPoints: points })}
                                />
                            </div>
        
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Does this tour end back at the meeting point(s)?
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="doesTourEndAtMeetingPoint"
                                            value="true"
                                            checked={formData.doesTourEndAtMeetingPoint === true}
                                            onChange={() => {
                                                updateFormData({ doesTourEndAtMeetingPoint: true });
                                                updateFormData({ endPoints: [] });
                                            }}
                                            className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">Yes - Tour ends back at meeting point(s)</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="doesTourEndAtMeetingPoint"
                                            value="false"
                                            checked={formData.doesTourEndAtMeetingPoint === false}
                                            onChange={() => updateFormData({ doesTourEndAtMeetingPoint: false })}
                                            className="h-4 w-4 text-[#ff914d] focus:ring-[#ff914d] border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">No - Tour ends at a different location</span>
                                    </label>
                                </div>
                            </div>
        
                            {/* End Points Section - Show when tour doesn't end at meeting point */}
                            {formData.doesTourEndAtMeetingPoint === false && (
                                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <EndPointMap
                                        endPoints={formData.endPoints || []}
                                        onEndPointsChange={endPoints => updateFormData({ endPoints })}
                                    />
                                </div>
                            )}
                        </>
                    )}
        
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