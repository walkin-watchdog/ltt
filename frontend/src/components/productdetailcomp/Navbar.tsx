import { useState } from "react";

interface NavbarProps {
    overviewRef: React.RefObject<HTMLDivElement | null>;
    itineraryRef: React.RefObject<HTMLDivElement | null>;
    detailsRef: React.RefObject<HTMLDivElement | null>;
    reviewsRef: React.RefObject<HTMLDivElement | null>;
}

export const Navbar = ({
    overviewRef,
    itineraryRef,
    detailsRef,
    reviewsRef,
}: NavbarProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'itinerary' | 'reviews'>('overview');
    
    const handleTabClick = (tab: 'overview' | 'details' | 'itinerary' | 'reviews') => {
        setActiveTab(tab);
        const refs = {
            overview: overviewRef,
            details: detailsRef,
            itinerary: itineraryRef,
            reviews: reviewsRef,
        };
        const targetRef = refs[tab];
        if (targetRef.current) {
            targetRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm mb-8 sticky top-0 z-10">
            <nav className="border-b flex space-x-8 px-6">
                {(['overview', 'details', 'itinerary', 'reviews'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => handleTabClick(t)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === t
                                ? 'border-[#ff914d] text-[#ff914d]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {{
                            overview: 'Overview',
                            details: 'Details',
                            itinerary: 'Itinerary',
                            reviews: 'Reviews',
                        }[t]}
                    </button>
                ))}
            </nav>
        </div>
    );
};