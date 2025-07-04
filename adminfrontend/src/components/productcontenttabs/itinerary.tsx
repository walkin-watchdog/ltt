import type { ItineraryDay } from "@/types.ts";
import { Calendar, Route } from "lucide-react";

interface ItineraryTabProps {
    formData: any;
    handleSaveAndContinue: () => void;
    createNewDay: () => void;
    editDay: (day: ItineraryDay) => void;
    removeDay: (dayNumber: number) => void;
    getAllowedDays: () => number;
}

export const ItineraryTab = ({
    formData,
    handleSaveAndContinue,
    createNewDay,
    editDay,
    removeDay,
    getAllowedDays,

}: ItineraryTabProps) => {
    return (
        <div className="space-y-6">
            {formData.type === 'TOUR' ? (
                <>
                    <div className="mb-4 text-red-600 text-sm">
                        {formData.itinerary?.length < (formData.duration && formData.duration !== 'Full Day' ?
                            parseInt(formData.duration.split(' ')[0]) || 2 : 2) &&
                            `You must add at least ${formData.duration && formData.duration !== 'Full Day' ?
                                parseInt(formData.duration.split(' ')[0]) || 2 : 2} days to the itinerary for a ${formData.duration && formData.duration !== 'Full Day' ?
                                    parseInt(formData.duration.split(' ')[0]) || 2 : 2}-day tour.`}
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-medium text-gray-900">Tour Itinerary</h4>
                            <p className="text-sm text-gray-600">Plan your tour day by day</p>
                        </div>
                        <button
                            type="button"
                            onClick={createNewDay}
                            className={`flex items-center px-4 py-2 rounded-md transition-colors text-white ${(formData.itinerary?.length || 0) >= getAllowedDays()
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#ff914d] hover:bg-[#e8823d]'
                                }`}
                            disabled={(formData.itinerary?.length || 0) >= getAllowedDays()}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Add Day
                        </button>
                    </div>

                    {formData.itinerary && formData.itinerary.length > 0 ? (
                        <div className="space-y-4">
                            {formData.itinerary.map((day: ItineraryDay) => (
                                <div key={day.day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">Day {day.day}: {day.title}</h4>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => editDay(day)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeDay(day.day)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                                    {day.activities.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-medium text-gray-700 mb-1">Activities:</p>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {day.activities.map((activity, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm text-gray-900">{activity.location}</div>
                                                            {activity.isStop && (
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    Stop • {activity.stopDuration || 0} minutes
                                                                </div>
                                                            )}
                                                            {activity.isAdmissionIncluded && (
                                                                <div className="text-xs text-emerald-600 mt-1">
                                                                    ✓ Admission included
                                                                </div>
                                                            )}
                                                            {(activity.inclusions && activity.inclusions.length > 0) && (
                                                                <div className="text-xs text-green-600 mt-1">
                                                                    Includes: {activity.inclusions.join(', ')}
                                                                </div>
                                                            )}
                                                            {(activity.exclusions && activity.exclusions.length > 0) && (
                                                                <div className="text-xs text-red-600 mt-1">
                                                                    Excludes: {activity.exclusions.join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {day.images.length > 0 && (
                                        <div className="flex space-x-2 mt-2">
                                            {day.images.slice(0, 3).map((img, idx) => (
                                                <img key={idx} src={img} alt="" className="w-12 h-12 object-cover rounded" />
                                            ))}
                                            {day.images.length > 3 && (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                                    +{day.images.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No itinerary days added yet</p>
                            <p className="text-sm text-gray-500">Click "Add Day" to start planning your tour</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Itinerary is only available for Tours</p>
                    <p className="text-sm text-gray-500">Switch to Tour type to add itinerary</p>
                </div>
            )}
            <div className="flex justify-end mt-8">
                <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    className="px-6 py-2 bg-[#ff914d] text-white rounded-md hover:bg-[#e8823d] font-semibold transition-colors"
                    disabled={
                        formData.type === 'TOUR' &&
                        (formData.itinerary?.length || 0) !== getAllowedDays()
                    }
                >
                    Save &amp; Continue
                </button>
            </div>
        </div>
    );
    }