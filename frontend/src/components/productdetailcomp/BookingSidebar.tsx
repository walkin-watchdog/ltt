import { formatDate, parse } from "date-fns";
import { AvailabilityBar } from "../common/AvailabilityBar";
import { PriceDisplay } from "../common/PriceDisplay";
import { Link } from "react-router-dom";
import { Share2, X,} from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

interface BookingSidebarProps {
    cheapestPackage: any;
    currentProduct: any;
    selectedDateStr: string;
    adultsCount: number;
    childrenCount: number;
    isMobile: boolean;
    setShowAvail: (show: boolean) => void;
    setCheckingAvail: (checking: boolean) => void;
    setIsDateOk: (ok: boolean) => void;
    setAvailablePackages: (pkgs: any[]) => void;
    setSelectedSlotId: (id: string | null) => void;
    setSelectedTimeSlot: (time: string | null) => void;
    calculateEffectivePrice: (basePrice: number, discountType?: string, discountValue?: number) => number;
    handleBarChange: (params: { date: string; adults: number; children: number }) => void;
    selectedPackage: any;
    checkingAvail: boolean;
    isDateOk: boolean | null;
    availablePackages: any[];
    slotsLoading: boolean;
    slotsForPackage: any[];
    selectedSlot: any;
    selectedSlotId: string | null;
    selectedTimeSlot: string | null;
    handlePackageSelect: (pkgId: string) => void;
    setSelectedSlot: (slot: any) => void;
    isSlotBookable: (date: string, time: string, cutoffTime: number) => { isBookable: boolean; reason?: string };
}

export const BookingSidebar = ({
    cheapestPackage,
    currentProduct,
    selectedDateStr,
    adultsCount,
    childrenCount,
    isMobile,
    setShowAvail,
    setCheckingAvail,
    setIsDateOk,
    setAvailablePackages,
    setSelectedSlotId,
    setSelectedTimeSlot,
    calculateEffectivePrice,
    handleBarChange,
    selectedPackage,
    checkingAvail,
    isDateOk,
    availablePackages,
    slotsLoading,
    slotsForPackage,
    selectedSlot,
    selectedSlotId,
    selectedTimeSlot,
    handlePackageSelect,
    setSelectedSlot,
    isSlotBookable,
}: BookingSidebarProps) => {
    const [showAvailabilityPopup, setShowAvailabilityPopup] = useState(false);
    const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);

    // Auto-select first available time slot when slots are loaded
    useEffect(() => {
        if (selectedPackage && slotsForPackage.length > 0 && !selectedSlotId && !slotsLoading) {
            const firstAvailableSlot = slotsForPackage
                .flatMap(slot =>
                    Array.isArray(slot.Time)
                        ? slot.Time.map((time: string) => ({ slotId: slot.id, time, slot }))
                        : []
                )
                .find(({ slot, time }) => {
                    const availableSeats = slot.available - (slot.booked || 0);
                    const cutoffTime = slot.cutoffTime || 24;
                    const { isBookable } = isSlotBookable(
                        formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd'),
                        time,
                        cutoffTime
                    );
                    return availableSeats >= (adultsCount + childrenCount) && isBookable;
                });

            if (firstAvailableSlot) {
                setSelectedSlotId(firstAvailableSlot.slotId);
                setSelectedTimeSlot(firstAvailableSlot.time);
                setSelectedSlot(firstAvailableSlot.slot);
            }
        }
    }, [selectedPackage, slotsForPackage, selectedSlotId, slotsLoading, adultsCount, childrenCount, selectedDateStr, isSlotBookable, setSelectedSlotId, setSelectedTimeSlot, setSelectedSlot]);

    return (

        <div className="order-first mt-8 lg:order-none lg:mt-0 lg:col-span-1 relative">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Price per {cheapestPackage?.isPerGroup ? 'group' : 'person'}</span>
                        {cheapestPackage && cheapestPackage.discountType !== 'none' && cheapestPackage.discountValue > 0 && (
                            <span className="bg-[#ff914d] text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                                {cheapestPackage.discountType === 'percentage' ? (
                                    `${cheapestPackage.discountValue}% OFF`
                                ) : (
                                    <>
                                        Save&nbsp;
                                        <PriceDisplay
                                            amount={cheapestPackage.discountValue}
                                            currency={cheapestPackage.currency}
                                            className="inline"
                                        />
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline">
                        {cheapestPackage ? (
                            <PriceDisplay
                                amount={calculateEffectivePrice(
                                    cheapestPackage.basePrice,
                                    cheapestPackage.discountType,
                                    cheapestPackage.discountValue
                                )}
                                originalAmount={
                                    cheapestPackage.discountType !== 'none' && cheapestPackage.discountValue > 0
                                        ? cheapestPackage.basePrice
                                        : undefined
                                }
                                currency={cheapestPackage.currency}
                                showDisclaimer
                                className="text-3xl font-bold"
                            />
                        ) : (
                            <span className="text-3xl font-bold text-[#ff914d]">Contact for pricing</span>
                        )}
                        <span className="text-sm text-gray-500 ml-2">
                            per {cheapestPackage?.isPerGroup ? 'group' : 'person'}
                            {cheapestPackage?.isPerGroup && cheapestPackage.maxPeople && ` (up to ${cheapestPackage.maxPeople})`}
                        </span>
                    </div>
                    {cheapestPackage && cheapestPackage.discountType === 'percentage' && cheapestPackage.discountValue > 0 && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block mt-2">
                            {cheapestPackage.discountValue}% OFF
                        </span>
                    )}
                </div>

                {/* check-availability */}
                <AvailabilityBar
                    selectedDate={selectedDateStr}
                    adults={adultsCount}
                    children={childrenCount}
                    onChange={handleBarChange}
                    onCheck={() => {
                        if (isMobile) { setShowAvail(true); return; }

                        const iso = formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd');
                        (async () => {
                            setCheckingAvail(true);
                            try {
                                const base = import.meta.env.VITE_API_URL || '';
                                const res = await fetch(
                                    `${base}/availability/product/${currentProduct.id}?startDate=${iso}&endDate=${iso}`,
                                );
                                const json = await res.json();
                                const slot = json.availability?.find(
                                    (a: any) =>
                                        new Date(a.startDate) <= new Date(iso) &&
                                        (!a.endDate || new Date(a.endDate) >= new Date(iso))
                                );

                                if (!slot) {
                                    console.error('No availability found for the selected date');
                                    setIsDateOk(false);
                                    setAvailablePackages([]);
                                    return;
                                }

                                if (slot.status !== 'AVAILABLE') {
                                    setIsDateOk(false);
                                    setAvailablePackages([]);
                                } else {
                                    // If product is available, show all packages regardless of capacity
                                    setIsDateOk(true);
                                    setAvailablePackages(currentProduct.packages ?? []);
                                    
                                    // Auto-select the first available package
                                    const firstPackage = currentProduct.packages?.[0];
                                    if (firstPackage) {
                                        handlePackageSelect(firstPackage.id);
                                    }
                                    
                                    setShowAvailabilityPopup(true);
                                }
                            } catch (error) {
                                console.error('Error checking availability:', error);
                                setIsDateOk(false);
                                setAvailablePackages([]);
                            } finally {
                                setCheckingAvail(false);
                            }
                        })();
                    }}
                    selectedPackage={selectedPackage} // Pass selected package
                />

                {/* Booking Button */}
                {!isMobile && checkingAvail && (
                    <p className="text-center text-gray-500 my-4">Checking availability…</p>
                )}

                {!isMobile && isDateOk === false && !checkingAvail && !slotsLoading && (
                    <p className="text-center text-red-600 my-4">
                        No time slots available for this date.
                        <br />
                        <span className="text-sm text-gray-500">Please try selecting another date.</span>
                    </p>
                )}

           

                {/* Share Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(url);
                            toast.success('Link copied to clipboard!');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-[#ff914d] transition-colors"
                    >
                        <Share2 className="h-4 w-4" />
                        Share this experience
                    </button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600 mb-2">Need help? Contact us:</p>
                    <a href="tel:+1234567890" className="text-[#ff914d] font-medium block mb-1">
                        +1 (234) 567-890
                    </a>
                    <a href="mailto:info@luxetimetravel.com" className="text-[#ff914d] font-medium">
                        info@luxetimetravel.com
                    </a>
                </div>
            </div>

            {/* Availability Popup Modal */}
            {showAvailabilityPopup && availablePackages.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className={`bg-white rounded-lg w-full max-h-[90vh] overflow-hidden flex flex-col ${showAllTimeSlots ? 'max-w-6xl' : 'max-w-4xl'} transition-all duration-300`}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="text-right">
                                <button
                                    onClick={() => setShowAvailabilityPopup(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Package Options */}
                            <div className="mb-6">
                                <div className="space-y-4">
                                    {availablePackages.map(pkg => (
                                        <div
                                            key={pkg.id}
                                            onClick={() => handlePackageSelect(pkg.id)}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPackage?.id === pkg.id
                                                ? 'border-[#ff914d] bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                                    {currentProduct?.reserveNowPayLater !== false && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                                                            Reserve Now, Pay Later eligible
                                                        </span>
                                                    )}
                                                    
                                                    {/* Time Slots for this package */}
                                                    {selectedPackage?.id === pkg.id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <h5 className="text-sm font-medium text-gray-900 mb-3">Available Time Slots</h5>
                                                            {slotsLoading ? (
                                                                <div className="flex justify-center py-4">
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ff914d]"></div>
                                                                </div>
                                                            ) : slotsForPackage.length === 0 ? (
                                                                <div className="text-center text-red-600 py-2 text-sm">
                                                                    No time slots available for the selected date.
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className={`grid grid-cols-4 gap-2 ${showAllTimeSlots ? 'max-h-40 overflow-y-auto pr-2' : ''}`}>
                                                                        {slotsForPackage
                                                                            .flatMap(slot =>
                                                                                Array.isArray(slot.Time)
                                                                                    ? slot.Time.map((time: string) => ({ slotId: slot.id, time, slot }))
                                                                                    : []
                                                                            )
                                                                            .slice(0, showAllTimeSlots ? undefined : 4)
                                                                            .map(({ slotId, time, slot }, index) => {
                                                                                const availableSeats = slot.available - (slot.booked || 0);
                                                                                const cutoffTime = slot.cutoffTime || 24;
                                                                                const { isBookable } = isSlotBookable(
                                                                                    formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd'),
                                                                                    time,
                                                                                    cutoffTime
                                                                                );

                                                                                const isDisabled = availableSeats < (adultsCount + childrenCount) || !isBookable;
                                                                                const isSelected = selectedSlotId === slotId && selectedTimeSlot === time;

                                                                                return (
                                                                                    <button
                                                                                        key={`${slotId}-${time}`}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            if (!isDisabled) {
                                                                                                setSelectedSlotId(slotId);
                                                                                                setSelectedTimeSlot(time);
                                                                                                setSelectedSlot(slot);
                                                                                            }
                                                                                        }}
                                                                                        disabled={isDisabled}
                                                                                        className={`border rounded-lg px-2 py-1 text-xs font-medium transition-all ${isSelected
                                                                                            ? 'border-[#ff914d] bg-[#ff914d] text-white'
                                                                                            : 'border-gray-300 hover:border-[#ff914d] hover:text-[#ff914d]'
                                                                                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                                    >
                                                                                        {time}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                    </div>

                                                                    {/* Show "See more" / "Show less" button */}
                                                                    {slotsForPackage.flatMap(slot =>
                                                                        Array.isArray(slot.Time) ? slot.Time : []
                                                                    ).length > 4 && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setShowAllTimeSlots(!showAllTimeSlots);
                                                                                }}
                                                                                className="mt-2 text-[#ff914d] hover:text-[#e8823d] text-sm font-medium"
                                                                            >
                                                                                {showAllTimeSlots ? 'Show less' : 'See more'}
                                                                            </button>
                                                                        )}
                                                                </>
                                                            )}
                                                            
                                                            {/* Tiered Pricing breakdown - only show when slot is selected */}
                                                            {selectedSlot && selectedPackage?.id === pkg.id && (
                                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm text-gray-700">Adults:</span>
                                                                        <div className="text-sm font-medium">
                                                                            {adultsCount} ×
                                                                            {selectedSlot?.adultTiers && selectedSlot.adultTiers.length > 0 ? (
                                                                                <span>
                                                                                    {/* Show original price with strikethrough if discount exists */}
                                                                                    {pkg.discountType !== 'none' && pkg.discountValue > 0 && (
                                                                                        <span className="line-through text-gray-400 mr-2">
                                                                                            <PriceDisplay amount={selectedSlot.adultTiers[0].price} currency={pkg.currency} />
                                                                                        </span>
                                                                                    )}
                                                                                    <span className={pkg.discountType !== 'none' && pkg.discountValue > 0 ? "text-[#ff914d] font-bold" : ""}>
                                                                                        <PriceDisplay
                                                                                            amount={calculateEffectivePrice(
                                                                                                selectedSlot.adultTiers[0].price,
                                                                                                pkg.discountType,
                                                                                                pkg.discountValue
                                                                                            )}
                                                                                            currency={pkg.currency}
                                                                                        />
                                                                                    </span>
                                                                                </span>
                                                                            ) : (
                                                                                <PriceDisplay
                                                                                    amount={calculateEffectivePrice(
                                                                                        pkg.basePrice,
                                                                                        pkg.discountType,
                                                                                        pkg.discountValue
                                                                                    )}
                                                                                    currency={pkg.currency}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Children Pricing or Not Allowed Message */}
                                                                    {pkg.ageGroups?.child?.enabled !== false ? (
                                                                        childrenCount > 0 && (
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-sm text-gray-700">Children:</span>
                                                                                <div className="text-sm font-medium">
                                                                                    {childrenCount} ×
                                                                                    {selectedSlot?.childTiers && selectedSlot.childTiers.length > 0 ? (
                                                                                        <span>
                                                                                            {/* Show original price with strikethrough if discount exists */}
                                                                                            {pkg.discountType !== 'none' && pkg.discountValue > 0 && (
                                                                                                <span className="line-through text-gray-400 mr-2">
                                                                                                    <PriceDisplay amount={selectedSlot.childTiers[0].price} currency={pkg.currency} />
                                                                                                </span>
                                                                                            )}
                                                                                            <span className={pkg.discountType !== 'none' && pkg.discountValue > 0 ? "text-[#ff914d] font-bold" : ""}>
                                                                                                <PriceDisplay
                                                                                                    amount={calculateEffectivePrice(
                                                                                                        selectedSlot.childTiers[0].price,
                                                                                                        pkg.discountType,
                                                                                                        pkg.discountValue
                                                                                                    )}
                                                                                                    currency={pkg.currency}
                                                                                                />
                                                                                            </span>
                                                                                        </span>
                                                                                    ) : (
                                                                                        <PriceDisplay
                                                                                            amount={calculateEffectivePrice(
                                                                                                pkg.basePrice,
                                                                                                pkg.discountType,
                                                                                                pkg.discountValue
                                                                                            ) * 0.5}
                                                                                            currency={pkg.currency}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm text-gray-700">Children:</span>
                                                                            <span className="text-sm font-medium text-red-500">
                                                                                Children are not allowed in this tour
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                                                                        <span className="font-medium">Total:</span>
                                                                        <span className="font-bold text-[#ff914d]">
                                                                            <PriceDisplay
                                                                                amount={adultsCount * (selectedSlot?.adultTiers?.[0]?.price
                                                                                    ? calculateEffectivePrice(
                                                                                        selectedSlot.adultTiers[0].price,
                                                                                        pkg.discountType,
                                                                                        pkg.discountValue
                                                                                    )
                                                                                    : calculateEffectivePrice(
                                                                                        pkg.basePrice,
                                                                                        pkg.discountType,
                                                                                        pkg.discountValue
                                                                                    )) +
                                                                                    (pkg.ageGroups?.child?.enabled !== false
                                                                                        ? childrenCount * (selectedSlot?.childTiers?.[0]?.price
                                                                                            ? calculateEffectivePrice(
                                                                                                selectedSlot.childTiers[0].price,
                                                                                                pkg.discountType,
                                                                                                pkg.discountValue
                                                                                            )
                                                                                            : (calculateEffectivePrice(
                                                                                                pkg.basePrice,
                                                                                                pkg.discountType,
                                                                                                pkg.discountValue
                                                                                            ) * 0.5))
                                                                                        : 0
                                                                                    )}
                                                                                currency={pkg.currency}
                                                                            />
                                                                        </span>
                                                                    </div>

                                                                    {pkg.isPerGroup && (
                                                                        <div className="mt-2 text-xs text-gray-500 text-center">
                                                                            This is a group package (up to {pkg.maxPeople || currentProduct.capacity} people)
                                                                        </div>
                                                                    )}
                                                                    
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage?.id === pkg.id
                                                        ? 'border-[#ff914d] bg-[#ff914d]'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {selectedPackage?.id === pkg.id && (
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons - Fixed at bottom */}
                        <div className="flex gap-3 items-center p-6 border-t border-gray-200 flex-shrink-0">

                            <div className="flex-1"></div>
                            {!isMobile && selectedPackage && selectedSlot && selectedTimeSlot && (
                                <Link
                                    to={`/book/${currentProduct.id}?date=${selectedDateStr}&adults=${adultsCount}&children=${childrenCount}&package=${selectedPackage.id}&slot=${selectedSlotId}&time=${selectedTimeSlot}`}
                                    className="bg-[#22c55e] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#16a34a] transition-colors"
                                    onClick={() => setShowAvailabilityPopup(false)}
                                >
                                    Reserve Now
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}