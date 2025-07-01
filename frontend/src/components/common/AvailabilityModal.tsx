import { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import { DayPicker } from 'react-day-picker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Sheet } from 'react-modal-sheet'; 
import clsx from 'clsx';
import { CheckCircle } from 'lucide-react';
import { formatDate } from 'date-fns';

interface Props {
  productId: string;
  packages: any[]; // Consider using a more specific type if possible
  open: boolean;
  onClose: () => void;
  // This prop's name might be misleading if it's used for slotId later
  // Consider renaming to onFinalSelection or having separate onPackageSelect and onSlotSelect
  onPackageSelect: (pkgOrSlotId: string) => void; 
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  selectedPackageFromProp?: { // Renamed to avoid confusion with internal state
    id: string;
    inclusions?: string[];
    timeSlots?: string[];
  };
}

export const AvailabilityModal = ({
  open,
  productId,
  onClose,
  initialDate,
  initialAdults,
  initialChildren,
  selectedPackageFromProp // Using the renamed prop
}: Props) => {
  const [date, setDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [adults, setAdults] = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDateOk, setIsDateOk]= useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [showTravellers, setShowTravellers] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  // Internal state for selected package ID
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null); 
  const [step, setStep] = useState<'package'|'slot'>(
    selectedPackageFromProp ? 'slot' : 'package'
  ); // Initialize step based on prop
  const [slotsLoading, setSlotsLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:1023px)');
  const datestr = date ? formatDate(date, 'MM/dd/yyyy') : '';

  useEffect(() => {
    setDate(initialDate ? new Date(initialDate) : null);
  }, [initialDate]);

  useEffect(() => {
    setAdults(initialAdults ?? 2);
  }, [initialAdults]);

  useEffect(() => {
    setChildren(initialChildren ?? 0);
  }, [initialChildren]);
  
  // Reset modal state when opened or when selectedPackageFromProp changes
  useEffect(() => {
    if (open) {
      if (selectedPackageFromProp && selectedPackageFromProp.id) {
        setSelectedPackageId(selectedPackageFromProp.id);
        setStep('slot');
      } else {
        setStep('package');
        setSelectedPackageId(null);
        setSelectedSlotId(null);
      }
    }
  }, [open, selectedPackageFromProp]);

  /* fetch whenever the filter changes */
  useEffect(() => {
    if (!open || !date) return;
    
    // Reset state when date or selectedPackageId changes
    // This ensures we always fetch fresh data for the current selection
    setSlots([]);
    setPackages([]);
    setIsDateOk(null); // Reset availability status
    setSelectedSlotId(null); // Clear selected slot when date or package changes
    if (step === 'slot') {
      setSlotsLoading(true);
    }

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const iso = formatDate(date, 'yyyy-MM-dd');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        if (!selectedPackageId || step === 'package') { // Fetch packages if none selected or if we're on package step
          console.log("Checking product availability for date:", iso);
          const url = `${base}/availability/product/${productId}?startDate=${iso}&endDate=${iso}`;
          
          const res = await fetch(url);
          
          if (res.ok) {
            const data = await res.json();
            const availableAvailabilities = data.availability?.filter((a: any) => a.status === 'AVAILABLE');
            
            if (!availableAvailabilities || availableAvailabilities.length === 0) {
              setIsDateOk(false);
              setPackages([]);
            } else {
              setIsDateOk(true);
               
              const uniquePackages = Array.from(
                new Map(availableAvailabilities
                  .filter((a: any) => a.package) // Ensure package exists
                  .map((a: any) => [a.package.id, {
                    id: a.package.id,
                    name: a.package.name,
                    maxPeople: a.package.maxPeople,
                    // Potentially add basePrice here if you need it for package display
                    basePrice: a.package.basePrice, 
                    currency: a.package.currency
                  }])
                ).values()
              );
              
              console.log("Found available packages:", uniquePackages);
              setPackages(uniquePackages);
              // If a package was selected from prop, and it's in the available list, set it
              if (selectedPackageFromProp && uniquePackages.some((p: any) => p.id === selectedPackageFromProp.id)) {
                  setSelectedPackageId(selectedPackageFromProp.id);
                  setStep('slot'); // Automatically move to slot selection if initial package is valid
              }
            }
          } else {
            console.error('Failed to fetch availability:', await res.text());
            setIsDateOk(false);
            setPackages([]);
          }
        } 
        
        if (selectedPackageId && step === 'slot') { // Fetch slots if a package is selected and we're on slot step
          setSlotsLoading(true);
          try {
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            const url = `${base}/availability/package/${selectedPackageId}/slots?date=${iso}`;
            console.log("Fetching slots from:", url);

            const res = await fetch(url);
            
            if (res.ok) {
              const data = await res.json();
              console.log("Received slots data:", data);
              
              if (data && data.slots && Array.isArray(data.slots)) {
                const filteredSlots = data.slots.filter((slot: { days: string | string[]; }) => 
                  Array.isArray(slot.days) && slot.days.includes(dayOfWeek)
                );
                setSlots(filteredSlots);
                setIsDateOk(filteredSlots.length > 0);
              } else {
                console.error('Invalid or empty slots data:', data);
                setSlots([]);
                setIsDateOk(false);
              }
            } else {
              console.error('Failed to fetch slots:', await res.text());
              setSlots([]);
              setIsDateOk(false);
            }
          } catch (e) {
            console.error("Error fetching slots:", e);
            setSlots([]);
            setIsDateOk(false);
          } finally {
            setSlotsLoading(false);
          } 
        }
      } catch (e) {
        console.error("General error in fetching availability/slots:", e);
        setIsDateOk(false);
        setPackages([]);
        setSlots([]);
      } finally {
        setLoading(false);
      } 
    };

    // Debounce or add a small delay if fetches are too frequent
    const timeoutId = setTimeout(fetchAvailability, 200);
    return () => clearTimeout(timeoutId); // Cleanup on unmount or re-render
  }, [open, date, adults, children, productId, selectedPackageId, step]); // Added selectedPackageId and step to dependency array


  if (!open || !isMobile) return null;
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50',
        isMobile ? 'bg-white' : 'flex items-start justify-center pt-12 bg-black/50'
      )}
    >
      <div
        className={clsx(
          'bg-white overflow-hidden',
          isMobile ? 'w-full h-full rounded-none' : 'w-full max-w-md rounded-lg'
        )}
      >
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 relative">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mr-4">
            <X className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-200" />
          </button>

          {/* date button */}
          <button
            onClick={() => setShowDatepicker((o) => !o)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 mr-3"
          >
            <CalendarIcon className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">
              {date
                ? date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
                : 'Choose date'}
            </span>
          </button>

          {/* travellers button */}
          <button
            onClick={() => setShowTravellers((o) => !o)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300"
          >
            <Users className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">
              {adults}A{children>0?`/${children}C`:''}
            </span>
          </button>

          {/* date-picker overlay */}
          {!isMobile && showDatepicker && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-xl shadow-lg p-4 z-20">
              <DayPicker
                mode="single"
                selected={date ?? undefined}
                fromDate={new Date()}
                onSelect={(d) => { if (d) { setDate(d); setShowDatepicker(false); } }}
                className="flex"
                classNames={{
                  caption: 'text-center font-semibold mb-4',
                  table: 'border-collapse',
                  head_row: 'text-gray-400',
                  day: 'w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#104c57] hover:ring-opacity-50',
                  day_selected: 'bg-[#ff914d] text-white font-semibold ring-2 ring-[#104c57] ring-opacity-50',
                  day_today: 'border border-[#ff914d]',
                }}
              />
            </div>
          )}
          {isMobile && (
            <Sheet
              isOpen={showDatepicker}
              onClose={() => setShowDatepicker(false)}
              snapPoints={[0.6]}
              initialSnap={0}
            >
              <Sheet.Backdrop onTap={() => setShowDatepicker(false)} />
              <Sheet.Container>
                <Sheet.Header className="flex justify-end p-4">
                  <button
                    onClick={() => setShowDatepicker(false)}
                    className="bg-gray-200 rounded-full p-2 h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </Sheet.Header>
                <Sheet.Content>
                  <DayPicker
                    mode="single"
                    fromDate={new Date()}
                    selected={date ?? undefined}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setShowDatepicker(false);
                      }
                    }}
                    classNames={{
                      month: "w-full",
                      nav: "flex w-full",
                      caption: 'text-center font-semibold mb-4',
                      table: 'border-collapse w-full',
                      head_row: 'text-gray-400',
                      day: 'w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#104c57] hover:ring-opacity-50',
                      day_selected: 'bg-[#104c57] text-white font-semibold ring-2 ring-[#104c57] ring-opacity-50',
                      day_today: 'border border-[#ff914d]',
                    }}
                  />
                </Sheet.Content>
              </Sheet.Container>
            </Sheet>
          )}

          {/* travellers overlay */}
          {!isMobile && showTravellers && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-gray-200 rounded-xl p-5 shadow-lg z-20 w-60">
              {[
                { label:'Adults',    key:'adults',    value: adults,   min:1 },
                { label:'Children',  key:'children',  value: children, min:0 },
              ].map(({ label,key,value,min }) => (
                <div key={key} className="flex items-center justify-between mb-4 last:mb-0">
                  <p className="font-semibold">{label}</p>
                  <div className="flex items-center space-x-4">
                    <button
                      disabled={value===min}
                      onClick={() => key==='adults' ? setAdults(value-1) : setChildren(value-1)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        value===min ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    ><Minus className="h-4 w-4"/></button>
                    <span className="w-4 text-center">{value}</span>
                    <button
                      onClick={() => key==='adults' ? setAdults(value+1) : setChildren(value+1)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-black text-white hover:bg-gray-800"
                    ><Plus className="h-4 w-4"/></button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowTravellers(false)}
                className="w-full mt-2 bg-[#ff914d] text-white font-semibold rounded-lg px-4 py-2"
              >
                Done
              </button>
            </div>
          )}
          {isMobile && (
            <Sheet
              isOpen={showTravellers}
              onClose={() => setShowTravellers(false)}
              snapPoints={[0.5]}
              initialSnap={0}
            >
              <Sheet.Backdrop onTap={() => setShowTravellers(false)} />
              <Sheet.Container>
                <Sheet.Header className="flex justify-end p-4">
                  <button
                    onClick={() => setShowTravellers(false)}
                    className="bg-gray-200 rounded-full p-2 h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </Sheet.Header>
                <Sheet.Content>
                  <div className="p-5">
                    {[
                      { label: 'Adults', key: 'adults', value: adults, min: 1 },
                      { label: 'Children', key: 'children', value: children, min: 0 },
                    ].map(({ label, key, value, min }) => (
                      <div key={key} className="flex items-center justify-between mb-4 last:mb-0">
                        <p className="font-semibold">{label}</p>
                        <div className="flex items-center space-x-6">
                          <CircleBtn
                            disabled={value === min}
                            onClick={() =>
                              key === 'adults' ? setAdults(value - 1) : setChildren(value - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </CircleBtn>
                          <span className="w-4 text-center">{value}</span>
                          <CircleBtn
                            onClick={() =>
                              key === 'adults' ? setAdults(value + 1) : setChildren(value + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </CircleBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                </Sheet.Content>
              </Sheet.Container>
            </Sheet>
          )}
        </div>

        {/* Time-slots grid + CTA */}
        <div className="p-6 h-full w-full">
          {loading && (
            <div className="flex justify-center items-center py-8 flex-col">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d] mr-3"></div>
              <p className="text-gray-600 mt-3">
                {step === 'slot' ? 'Loading time slots...' : 'Checking availability...'}
              </p>
            </div>
          )}

          {/* Package Selection Step */}
          {!loading && isDateOk === true && step === 'package' && packages.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Package</h3>
              <div className="space-y-3">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackageId(pkg.id);
                      setSlotsLoading(true);
                      setStep('slot'); // Move to slot selection after package is chosen
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg 
                      ${selectedPackageId === pkg.id 
                        ? 'border-[#ff914d] bg-orange-50' 
                        : 'border-gray-200 hover:border-[#ff914d] hover:shadow-md'}`}
                  >
                    <div>
                      <span className="font-medium">{pkg.name}</span>
                      {pkg.maxPeople && (
                        <p className="text-xs text-gray-500 mt-1">
                          Max {pkg.maxPeople} people
                        </p>
                      )}
                      {selectedPackageId === pkg.id && ( // Check for selectedPackageId here
                        <div className="mt-1 flex items-center text-[#ff914d]">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Selected</span>
                        </div>
                      )}
                    </div>
                    {pkg.basePrice && (
                       <span className="font-semibold">
                         {new Intl.NumberFormat('en-IN', {
                           style: 'currency',
                           currency: pkg.currency || 'INR',
                           minimumFractionDigits: 0
                         }).format(pkg.basePrice)}
                       </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Back button to return to package selection */}
          {step === 'slot' && !slotsLoading && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedPackageId(null);
                  setSelectedSlotId(null);
                  setSlots([]); // Clear slots when going back
                  setStep('package'); // Crucial line for navigation
                }}
                className="text-[#104c57] hover:text-[#ff914d] transition-colors text-sm"
              >
                Go Back to Packages
              </button>
            </div>
          )}

          {/* Slot Selection Step */}
          {!loading && step === 'slot' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d] mr-3"></div>
                  <p className="text-gray-600">Loading time slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <div className="space-y-2">
                  {slots
                    .flatMap(slot =>
                      Array.isArray(slot.Time)
                        ? slot.Time.map((time: string) => ({ slotId: slot.id, time, slot }))
                        : []
                    )
                    .map(({ slotId, time, slot }) => {
                      const availableSeats = slot.available - (slot.booked || 0);
                      const isDisabled = availableSeats < (adults + children);
                      const isSelected =
                        selectedSlotId === slotId && selectedTime === time;

                      return (
                        <button
                          key={`${slotId}-${time}`}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedSlotId(slotId);
                              setSelectedTime(time);
                            }
                          }}
                          disabled={isDisabled}
                          className={clsx(
                            'w-full flex items-center justify-between px-4 py-3 border rounded-lg',
                            isSelected
                              ? 'border-2 border-[#ff914d] bg-orange-50'
                              : 'border-gray-200 hover:border-[#ff914d] hover:shadow-md',
                            isDisabled && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className="font-medium">{time}</span>
                          {isSelected && (
                            <div className="bg-[#ff914d] text-white rounded-full h-5 w-5 flex items-center justify-center ml-2">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}

                  {selectedPackageId && isDateOk && selectedSlotId && selectedTime && (
                    <Link
                      to={
                        `/book/${productId}` +
                        `?package=${selectedPackageId}` +
                        `&slot=${selectedSlotId}` +
                        `&time=${encodeURIComponent(selectedTime ?? '')}` +
                        `&date=${datestr}` +
                        `&adults=${adults}` +
                        `&children=${children}`
                      }
                    >
                      <button onClick={onClose} className="w-full py-4 rounded-lg bg-[#ff914d] text-white">
                        Reserve Now
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-center text-red-600">
                  No time slots available for this date for the selected package.
                </p>
              )}
            </div>
          )}

          {/* No availability message (if no packages found for the date, or initial check fails) */}
          {!loading && isDateOk === false && step === 'package' && (
            <p className="text-center text-red-600">
              No packages available for this date.
              <br />
              <span className="text-gray-500 text-sm">Please try selecting another date.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CircleBtn = ({
  disabled,
  children,
  onClick,
}: {
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={clsx(
      'h-9 w-9 rounded-full flex items-center justify-center',
      disabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-black text-white hover:bg-gray-800',
    )}
  >
    {children}
  </button>
);