import { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import { DayPicker } from 'react-day-picker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Sheet } from 'react-modal-sheet'; 
import clsx from 'clsx';
import { CheckCircle } from 'lucide-react';
import { formatDate } from 'date-fns'; // Removed 'parse' as it's not used

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

export const AdminAvailabilityModal = ({
  open,
  productId,
  onClose,
  onPackageSelect,
  initialDate,
  initialAdults,
  initialChildren,
  selectedPackageFromProp // Using the renamed prop
}: Props) => {
  const [date, setDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [adults, setAdults] = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);
  const [slots, setSlots] = useState<any[]>([]);
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
  const datestr = date ? formatDate(date, 'yyyy-MM-dd') : ''; // Ensure datestr is always defined if date is present

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

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const iso = formatDate(date, 'yyyy-MM-dd');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        // If no package selected yet or if we're on the package selection step
        if (!selectedPackageId || step === 'package') { 
          console.log("Checking product availability for date:", iso);
          const url = `${base}/availability/product/${productId}?startDate=${iso}&endDate=${iso}`;
          
          const res = await fetch(url);
          
          if (res.ok) {
            const data = await res.json();
            console.log("Received availability data:", data);
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
                    basePrice: a.package.basePrice, // Include basePrice
                    currency: a.package.currency // Include currency
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
        
        // Fetch slots if a package is selected and we're on the slot selection step
        if (selectedPackageId && step === 'slot') { 
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
                    {pkg.basePrice && ( // Display base price for admin
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
            <>
              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d] mr-3"></div>
                  <p className="text-gray-600">Loading time slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                       }}
                      className={clsx(
                        'w-full flex items-center justify-between px-4 py-3 border rounded-lg',
                        slot.id === selectedSlotId
                          ? 'border-2 border-[#ff914d] bg-orange-50'
                          : 'border-gray-200 hover:border-[#ff914d] hover:shadow-md'
                      )}
                    >
                      <div className="flex flex-col text-left flex-grow">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {Array.isArray(slot.Time) && slot.Time.length > 0 
                              ? slot.Time[0] 
                              : "Time not specified"}
                          </span>
                          {slot.id === selectedSlotId && (
                            <div className="bg-[#ff914d] text-white rounded-full h-5 w-5 flex items-center justify-center ml-2">
                              ✓
                            </div>
                          )}
                        </div>
                        {/* Show additional times if there are more than one */}
                        {Array.isArray(slot.Time) && slot.Time.length > 1 && (
                          <span className="text-xs text-gray-500 mt-1">
                            Also available: {slot.Time.slice(1).join(', ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right ml-2">
                        <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                          Available
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Reserve Now button */}
                  {selectedPackageId && isDateOk && selectedSlotId && ( // Use selectedPackageId state
                    <Link
                      to={
                        `/book/${productId}` +
                        `?package=${selectedPackageId}` + // Use internal state
                        `&slot=${selectedSlotId}` +
                        `&date=${datestr}` +
                        `&adults=${adults}` +
                        `&children=${children}`
                      }
                      >
                      <button 
                        onClick={() => {
                          onPackageSelect(selectedSlotId); // Call the prop with the slot ID
                          onClose();
                        }}
                        className="w-full py-4 px-4 rounded-lg font-semibold transition-colors text-center block bg-[#ff914d] text-white hover:bg-[#e8823d] mb-4"
                      >
                        Reserve Now
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-center text-red-600">
                  No time slots available for this date for the selected package.
                  <br />
                  <span className="text-gray-500 text-sm">Please try selecting another date or package.</span>
                </p>
              )}
            </>
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