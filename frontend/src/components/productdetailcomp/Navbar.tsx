import { useState } from "react";


interface NavbarProps {    overviewRef: React.RefObject<HTMLDivElement | null>;
    itineraryRef: React.RefObject<HTMLDivElement | null>;
    inclusionsRef: React.RefObject<HTMLDivElement | null>;
    policiesRef: React.RefObject<HTMLDivElement | null>;
}
export const Navbar = ({
    overviewRef,
    itineraryRef,
    inclusionsRef,
    policiesRef,
}: NavbarProps) =>{
     const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions' | 'policies'>('overview');
        const handleTabClick = (tab: 'overview' | 'itinerary' | 'inclusions' | 'policies') => {
        setActiveTab(tab);
        const refs = {
            overview: overviewRef,
            itinerary: itineraryRef,
            inclusions: inclusionsRef,
            policies: policiesRef,
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
<div className="bg-white rounded-lg shadow-sm mb-8">
                        <nav className="border-b flex space-x-8 px-6">
                            {(['overview', 'itinerary', 'inclusions', 'policies'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleTabClick(t)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === t
                                        ? 'border-[#ff914d] text-[#ff914d]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {{
                                        overview: 'Overview',
                                        itinerary: 'Itinerary',
                                        inclusions: "What's Included",
                                        policies: 'Policies',
                                    }[t]}
                                </button>
                            ))}
                        </nav>
                    </div>
)
}