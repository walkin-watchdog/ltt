import { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import { DayPicker } from 'react-day-picker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Sheet } from 'react-modal-sheet';
import clsx from 'clsx';

interface Props {
  productId: string;
  packages: any[];
  open: boolean;
  onClose: () => void;
  onPackageSelect: (pkgId: string) => void;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  selectedPackage?: {
    id: string;
    inclusions?: string[];
    timeSlots?: string[];
  };
}

export const AvailabilityModal = ({
  open,
  onClose,
  onPackageSelect,
  initialDate,
  initialAdults,
  initialChildren,
  selectedPackage
}: Props) => {
  const [date, setDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [adults, setAdults] = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);
  const [slots, setSlots] = useState<any[]>([]);
  const [isDateOk, setIsDateOk]= useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [showTravellers, setShowTravellers] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width:1023px)');

  useEffect(() => {
    setDate(initialDate ? new Date(initialDate) : null);
  }, [initialDate]);

  useEffect(() => {
    setAdults(initialAdults ?? 2);
  }, [initialAdults]);

  useEffect(() => {
    setChildren(initialChildren ?? 0);
  }, [initialChildren]);

  /* fetch whenever the filter changes */
  useEffect(() => {
    if (!open || !date || !selectedPackage) return;
    (async () => {
      setLoading(true);
      try {
        const iso  = date.toISOString().split('T')[0];
        const base = import.meta.env.VITE_API_URL || '';
        const res  = await fetch(`${base}/availability/package/${selectedPackage.id}/slots?date=${iso}`);
        const { slots } = await res.json();
        setSlots(slots);
        const ok = slots.some((s: any) => (s.available - s.booked) >= (adults + children));
        setIsDateOk(ok);
      } catch (e) {
        console.error(e);
        setIsDateOk(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, date, adults, children, selectedPackage]);

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
                  day: 'w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200',
                  day_selected: 'bg-[#ff914d] text-white',
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
                      day: 'w-10 h-10 items-center justify-center rounded-full hover:bg-gray-200',
                      day_selected: 'bg-[#ff914d] text-white',
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
            <p className="text-center text-gray-500">Checking availability…</p>
          )}

          {!loading && isDateOk && (
            <div className="space-y-2">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    onPackageSelect(slot.id);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 border rounded-lg',
                    slot.id === selectedSlotId
                      ? 'border-[#ff914d] bg-orange-50'
                      : 'border-gray-200 hover:border-[#ff914d]'
                  )}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium">
                      {new Date(slot.startTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      &nbsp;-&nbsp;
                      {new Date(slot.endTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </span>
                    <span className="text-xs text-gray-600">
                      {slot.available - slot.booked} seat{(slot.available - slot.booked)===1?'':'s'} left
                    </span>
                  </div>

                  {selectedPackage?.inclusions && selectedPackage.inclusions.length > 0 && (
                    <ul className="text-xs mt-2 text-gray-700 list-disc ml-4 space-y-0.5">
                      {selectedPackage?.inclusions?.slice(0,3).map(inc => <li key={inc}>{inc}</li>)}
                      {selectedPackage?.inclusions && selectedPackage.inclusions.length > 3 && <li>…</li>}
                    </ul>
                  )}

                  {selectedPackage?.timeSlots && selectedPackage.timeSlots.length > 0 && (
                    <p className="text-xs mt-2 text-gray-500">
                      Slots:&nbsp;{selectedPackage?.timeSlots?.join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && isDateOk === false && (
            <p className="text-center text-red-600">
              Not enough spots for {adults + children} participant
              {adults + children > 1 && 's'}.
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