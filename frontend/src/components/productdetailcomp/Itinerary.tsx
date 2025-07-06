import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

 export const Itinerary = ({ itineraryRef }: {itineraryRef: React.RefObject<HTMLDivElement | null> }) => {
    const { currentProduct } = useSelector((state: RootState) => state.products);
    return (
        
        <div>

 {currentProduct &&
    currentProduct.type === 'TOUR' &&
    currentProduct.itineraries &&
    currentProduct.itineraries.length > 0 && (
        <div ref={itineraryRef} className="bg-white rounded-lg shadow-sm p-6 mb-8 scroll-mt-20">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Itinerary</h2>
                                    <div className="space-y-8">
                                        {currentProduct.itineraries.map((day: any) => (
                                            <section
                                            key={day.day}
                                            className="border-l-4 border-[#ff914d] pl-4 space-y-4"
                                            >
                                                {/* Day header */}
                                                <header>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Day&nbsp;{day.day}: {day.title}
                                                    </h3>
                                                    <p className="text-gray-700 mt-1">{day.description}</p>
                                                </header>

                                                {/* Activities */}
                                                {day.activities && day.activities.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                                                            Activities
                                                        </h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                            {day.activities.map((act: any, idx: number) => (
                                                                <li key={idx}>
                                                                    <span className="font-semibold">{act.location}</span>
                                                                    {act.isStop && (
                                                                        <span className="ml-2 text-blue-600">
                                                                            (Stop{act.stopDuration ? ` - ${act.stopDuration} min` : ''})
                                                                        </span>
                                                                    )}
                                                                    {/* Optionally show inclusions/exclusions */}
                                                                    {act.inclusions && act.inclusions.length > 0 && (
                                                                        <span className="ml-2 text-green-600">
                                                                            Includes: {act.inclusions.join(', ')}
                                                                        </span>
                                                                    )}
                                                                    {act.exclusions && act.exclusions.length > 0 && (
                                                                        <span className="ml-2 text-red-600">
                                                                            Excludes: {act.exclusions.join(', ')}
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Images */}
                                                {day.images && day.images.length > 0 && (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {day.images.map((img: string, idx: number) => (
                                                            <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Day ${day.day} ${idx + 1}`}
                                                            className="w-full h-32 object-cover rounded"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        ))}
                                    </div>
                                </div>
                            )}
                            </div>

                        )}