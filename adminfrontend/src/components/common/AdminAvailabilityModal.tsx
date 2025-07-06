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
import { isSlotBookable } from '../../lib/utils';
import type { AdminAvailabilityModalProps } from '@/types.ts';


export const AdminAvailabilityModal = ({
  open,
  productId,
  onClose,
  onPackageSelect,
  initialDate,
  initialAdults,
  initialChildren,
  selectedPackageFromProp
}: AdminAvailabilityModalProps) => {
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null); 
  const [step, setStep] = useState<'package'|'slot'>(
    selectedPackageFromProp ? 'slot' : 'package'
  );
  const [slotsLoading, setSlotsLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:1023px)');
  const datestr = date ? formatDate(date, 'yyyy-MM-dd') : '';

  const getSelectedPackageData = () => {
    if (selectedPackageFromProp) return selectedPackageFromProp;
    if (selectedPackageId) {
      return packages.find(p => p.id === selectedPackageId);
    }
    return null;
  };

  const selectedPkg = getSelectedPackageData();
  console.log('selectedPkg:', selectedPkg);
  const childrenAllowed = !selectedPkg || selectedPkg.ageGroups?.child?.enabled !== false;
  console.log('childrenAllowedddd:', childrenAllowed);
  useEffect(() => {
    setDate(initialDate ? new Date(initialDate) : null);
  }, [initialDate]);

  useEffect(() => {
    setAdults(initialAdults ?? 2);
  }, [initialAdults]);

  useEffect(() => {
    setChildren(initialChildren ?? 0);
  }, [initialChildren]);
  
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

  useEffect(() => {
    if (!open || !date) return;
    
    setSlots([]);
    setPackages([]);
    setIsDateOk(null);
    setSelectedSlotId(null);
    if (step === 'slot') {
      setSlotsLoading(true);
    }

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const iso = formatDate(date, 'yyyy-MM-dd');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        if (!selectedPackageId || step === 'package') { 
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
                  .filter((a: any) => a.package)
                  .map((a: any) => [a.package.id, {
                    id: a.package.id,
                    name: a.package.name,
                    maxPeople: a.package.maxPeople,
                    basePrice: a.package.basePrice,
                    currency: a.package.currency,
                    ageGroups: a.package.ageGroups
                  }])
                ).values()
              );
              setPackages(uniquePackages);
              if (selectedPackageFromProp && uniquePackages.some((p: any) => p.id === selectedPackageFromProp.id)) {
                  setSelectedPackageId(selectedPackageFromProp.id);
                  setStep('slot');
              }
            }
          } else {
            setIsDateOk(false);
            setPackages([]);
          }
        } 
        
        if (selectedPackageId && step === 'slot') { 
          setSlotsLoading(true);
          try {
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            const url = `${base}/availability/package/${selectedPackageId}/slots?date=${iso}`;
            const res = await fetch(url);
            
            if (res.ok) {
              const data = await res.json();
              
              if (data && data.slots && Array.isArray(data.slots)) {
                const filteredSlots = data.slots.filter((slot: { days: string | string[]; }) => 
                  Array.isArray(slot.days) && slot.days.includes(dayOfWeek)
                );
                
                const availableSlots = filteredSlots.filter((slot: any) => {
                  if (!slot.Time || !Array.isArray(slot.Time) || slot.Time.length === 0) {
                    return false;
                  }
                  return slot.Time.some((time: string) => {
                    const cutoffTime = slot.cutoffTime || 24;
                    const { isBookable } = isSlotBookable(iso, time, cutoffTime);
                    return isBookable;
                  });
                });
                
                setSlots(availableSlots);
                setIsDateOk(availableSlots.length > 0);
              } else {
                setSlots([]);
                setIsDateOk(false);
              }
            } else {
              setSlots([]);
              setIsDateOk(false);
            }
          } catch (e) {
            setSlots([]);
            setIsDateOk(false);
          } finally {
            setSlotsLoading(false);
          } 
        }
      } catch (e) {
        setIsDateOk(false);
        setPackages([]);
        setSlots([]);
      } finally {
        setLoading(false);
      } 
    };

    const timeoutId = setTimeout(fetchAvailability, 200); 
    return () => clearTimeout(timeoutId);
  }, [open, date, adults, children, productId, selectedPackageId, step]);

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
        <div className="flex items-center px-6 py-4 border-b border-gray-200 relative">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mr-4">
            <X className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-200" />
          </button>

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

          <button
            onClick={() => setShowTravellers((o) => !o)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300"
          >
            <Users className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">
              {adults}A{children>0?`/${children}C`:''}
            </span>
          </button>

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

          {!isMobile && showTravellers && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-gray-200 rounded-xl p-5 shadow-lg z-20 w-60">
              {[
                { label:'Adults',    key:'adults',    value: adults,   min:1 },
                ...(childrenAllowed ? [{ label:'Children',  key:'children',  value: children, min:0 }] : []),
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
                      ...(childrenAllowed ? [{ label: 'Children', key: 'children', value: children, min: 0 }] : []),
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

        <div className="p-6 h-full w-full">
          {loading && (
            <div className="flex justify-center items-center py-8 flex-col">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d] mr-3"></div>
              <p className="text-gray-600 mt-3">
                {step === 'slot' ? 'Loading time slots...' : 'Checking availability...'}
              </p>
            </div>
          )}

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
                      setStep('slot');
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
                      {selectedPackageId === pkg.id && (
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
          
          {step === 'slot' && !slotsLoading && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedPackageId(null);
                  setSelectedSlotId(null);
                  setSlots([]);
                  setStep('package');
                }}
                className="text-[#104c57] hover:text-[#ff914d] transition-colors text-sm"
              >
                Go Back to Packages
              </button>
            </div>
          )}

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
                        {Array.isArray(slot.Time) && slot.Time.length > 1 && (
                          <span className="text-xs text-gray-500 mt-1">
                            Also available: {slot.Time.slice(1).join(', ')}
                          </span>
                        )}
                        
                        {Array.isArray(slot.Time) && slot.Time.some((time: string) => {
                          const cutoffTime = slot.cutoffTime || 24;
                          const { isBookable } = isSlotBookable(
                            formatDate(date!, 'yyyy-MM-dd'), 
                            time, 
                            cutoffTime
                          );
                          return !isBookable;
                        }) && (
                          <div className="mt-1 text-xs text-red-600">
                            Some times may not be bookable due to cutoff policy
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-2">
                        <div className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                          Available
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {selectedPackageId && isDateOk && selectedSlotId && (
                    <Link
                      to={
                        `/book/${productId}` +
                        `?package=${selectedPackageId}` +
                        `&slot=${selectedSlotId}` +
                        `&date=${datestr}` +
                        `&adults=${adults}` +
                        `&children=${children}`
                      }
                      >
                      <button 
                        onClick={() => {
                          onPackageSelect(selectedSlotId);
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