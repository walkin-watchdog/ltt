import { formatDate, parse } from "date-fns";
import { AvailabilityBar } from "../common/AvailabilityBar";
import { PriceDisplay } from "../common/PriceDisplay";
import { Link } from "react-router-dom";
import { Calendar, Share2 } from "lucide-react";
import toast from "react-hot-toast";

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

                {/* Package Selection */}
                {!isMobile && isDateOk && availablePackages.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Package</h3>
                        <div className="space-y-3">
                            {availablePackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    onClick={() => handlePackageSelect(pkg.id)}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPackage?.id === pkg.id
                                        ? 'border-[#ff914d] bg-orange-50'
                                        : 'border-gray-200 hover:border-[#ff914d]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                                        {selectedPackage?.id === pkg.id && (
                                            <div className="bg-[#ff914d] text-white rounded-full h-5 w-5 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{pkg.description}</p>

                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {pkg.inclusions?.slice(0, 3).map((inc: string, idx: number) => (
                                            <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                {inc}
                                            </span>
                                        ))}
                                        {pkg.inclusions?.length > 3 && (
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                +{pkg.inclusions.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex justify-between items-center">
                                        <div className="font-bold text-[#ff914d]">
                                            <PriceDisplay
                                                amount={calculateEffectivePrice(
                                                    pkg.basePrice,
                                                    pkg.discountType,
                                                    pkg.discountValue
                                                )}
                                                currency={pkg.currency}
                                            />
                                            <span className="text-sm text-gray-500 font-normal"> per person</span>
                                        </div>
                                        <button
                                            className="text-[#104c57] font-medium text-sm hover:text-[#ff914d]"
                                            onClick={() => handlePackageSelect(pkg.id)}
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Time Slot Selection */}
                {!isMobile && isDateOk && availablePackages.length > 0 && selectedPackage && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Time</h3>
                        {slotsLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ff914d]"></div>
                            </div>
                        ) : slotsForPackage.length === 0 ? (
                            <p className="text-center text-red-600 py-2">
                                No time slots available for the selected date.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {slotsForPackage
                                    .flatMap(slot =>
                                        Array.isArray(slot.Time)
                                            ? slot.Time.map((time: string) => ({ slotId: slot.id, time, slot }))
                                            : []
                                    )
                                    .map(({ slotId, time, slot }) => {
                                        const availableSeats = slot.available - (slot.booked || 0);
                                        const cutoffTime = slot.cutoffTime || 24;
                                        const { isBookable, reason } = isSlotBookable(
                                            formatDate(parse(selectedDateStr, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd'),
                                            time,
                                            cutoffTime
                                        );

                                        const isDisabled = availableSeats < (adultsCount + childrenCount) || !isBookable;
                                        const isSelected = selectedSlotId === slotId && selectedTimeSlot === time;

                                        return (
                                            <div key={`${slotId}-${time}`} className="relative">
                                                <button
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            setSelectedSlotId(slotId);
                                                            setSelectedTimeSlot(time);
                                                            setSelectedSlot(slot);
                                                        }
                                                    }}
                                                    disabled={isDisabled}
                                                    className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${isSelected
                                                        ? 'border-[#ff914d] bg-orange-50'
                                                        : 'border-gray-200 hover:border-[#ff914d]'
                                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {time}
                                                </button>

                                                {!isBookable && reason && (
                                                    <div className="mt-1 text-xs text-red-600 px-1">
                                                        {reason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* Pricing info for selected package/slot */}
                {!isMobile && selectedPackage && selectedSlot && selectedTimeSlot && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">Adults:</span>
                            <div className="text-sm font-medium">
                                {adultsCount} ×
                                {selectedSlot.adultTiers && selectedSlot.adultTiers.length > 0 ? (
                                    <span>
                                        {/* Show original price with strikethrough if discount exists */}
                                        {selectedPackage.discountType !== 'none' && selectedPackage.discountValue > 0 && (
                                            <span className="line-through text-gray-400 mr-2">
                                                <PriceDisplay amount={selectedSlot.adultTiers[0].price} currency={selectedPackage.currency} />
                                            </span>
                                        )}
                                        <span className={selectedPackage.discountType !== 'none' && selectedPackage.discountValue > 0 ? "text-[#ff914d] font-bold" : ""}>
                                            <PriceDisplay
                                                amount={calculateEffectivePrice(
                                                    selectedSlot.adultTiers[0].price,
                                                    selectedPackage.discountType,
                                                    selectedPackage.discountValue
                                                )}
                                                currency={selectedPackage.currency}
                                            />
                                        </span>
                                    </span>) : (
                                    <PriceDisplay
                                        amount={calculateEffectivePrice(
                                            selectedPackage.basePrice,
                                            selectedPackage.discountType,
                                            selectedPackage.discountValue
                                        )}
                                        currency={selectedPackage.currency}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Children Pricing or Not Allowed Message */}
                        {selectedPackage.ageGroups?.child?.enabled !== false ? (
                            childrenCount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Children:</span>
                                    <div className="text-sm font-medium">
                                        {childrenCount} ×
                                        {selectedSlot.childTiers && selectedSlot.childTiers.length > 0 ? (
                                            <span>
                                                {/* Show original price with strikethrough if discount exists */}
                                                {selectedPackage.discountType !== 'none' && selectedPackage.discountValue > 0 && (
                                                    <span className="line-through text-gray-400 mr-2">
                                                        <PriceDisplay amount={selectedSlot.childTiers[0].price} currency={selectedPackage.currency} />
                                                    </span>
                                                )}
                                                <span className={selectedPackage.discountType !== 'none' && selectedPackage.discountValue > 0 ? "text-[#ff914d] font-bold" : ""}>
                                                    <PriceDisplay
                                                        amount={calculateEffectivePrice(
                                                            selectedSlot.childTiers[0].price,
                                                            selectedPackage.discountType,
                                                            selectedPackage.discountValue
                                                        )}
                                                        currency={selectedPackage.currency}
                                                    />
                                                </span>
                                            </span>
                                        ) : (
                                            <PriceDisplay
                                                amount={calculateEffectivePrice(
                                                    selectedPackage.basePrice,
                                                    selectedPackage.discountType,
                                                    selectedPackage.discountValue
                                                ) * 0.5}
                                                currency={selectedPackage.currency}
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
                                    amount={adultsCount * (selectedSlot.adultTiers?.[0]?.price
                                        ? calculateEffectivePrice(
                                            selectedSlot.adultTiers[0].price,
                                            selectedPackage.discountType,
                                            selectedPackage.discountValue
                                        )
                                        : calculateEffectivePrice(
                                            selectedPackage.basePrice,
                                            selectedPackage.discountType,
                                            selectedPackage.discountValue
                                        )) +
                                        (selectedPackage.ageGroups?.child?.enabled !== false
                                            ? childrenCount * (selectedSlot.childTiers?.[0]?.price
                                                ? calculateEffectivePrice(
                                                    selectedSlot.childTiers[0].price,
                                                    selectedPackage.discountType,
                                                    selectedPackage.discountValue
                                                )
                                                : (calculateEffectivePrice(
                                                    selectedPackage.basePrice,
                                                    selectedPackage.discountType,
                                                    selectedPackage.discountValue
                                                ) * 0.5))
                                            : 0
                                        )}
                                    currency={selectedPackage.currency}
                                />
                            </span>
                        </div>

                        {selectedPackage.isPerGroup && (
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                This is a group package (up to {selectedPackage.maxPeople || currentProduct.capacity} people)
                            </div>
                        )}
                    </div>
                )}

                {/* Book Now Button */}
                {selectedPackage && isDateOk && selectedSlot && (
                    <Link
                        to={
                            `/book/${currentProduct.id}` +
                            `?package=${selectedPackage.id}` +
                            `&slot=${selectedSlot.id}` +
                            `&time=${encodeURIComponent(selectedTimeSlot ?? '')}` +
                            `&date=${encodeURIComponent(selectedDateStr)}` +
                            `&adults=${adultsCount}` +
                            `&children=${childrenCount}`
                        }
                        className="w-full py-4 px-4 rounded-lg font-semibold transition-colors text-center block bg-[#ff914d] text-white hover:bg-[#e8823d] mb-4"
                    >
                        <span className="flex items-center justify-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Reserve Now
                        </span>
                    </Link>
                )}

                {/* share dropdown */}
                <div className="relative mt-4">
                    <button
                        onClick={() => {
                            navigator.clipboard
                                .writeText(window.location.href)
                                .then(() => toast.success('Link copied!'));
                        }}
                        className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Link
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Free cancellation up to 24 hours before
                    </p>
                </div>

                {/* Contact */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-600">Call us at:</p>
                        <a href="tel:+919876543210" className="text-[#ff914d] font-medium">
                            +91 98765 43210
                        </a>
                        <p className="text-gray-600">Email us at:</p>
                        <a href="mailto:info@luxetimetravel.com" className="text-[#ff914d] font-medium">
                            info@luxetimetravel.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}