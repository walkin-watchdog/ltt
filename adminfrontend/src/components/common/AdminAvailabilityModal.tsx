import { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Sheet } from 'react-modal-sheet';
import clsx from 'clsx';
import { type PackageOption } from '@/types.ts';

interface Props {
  productId: string;
  packages: PackageOption[];
  open: boolean;
  onClose: () => void;
  selectedPackageId?: string;
  onSlotSelect: (slotId: string) => void;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
}

export const AdminAvailabilityModal = ({
  open,
  onClose,
  selectedPackageId,
  onSlotSelect,
  initialDate,
  initialAdults,
  initialChildren,
}: Props) => {
  const [date, setDate]         = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [adults, setAdults]     = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [loading, setLoading]   = useState(false);
  const [slots,     setSlots]   = useState<any[]>([]);
  const [isDateOk, setIsDateOk] = useState<boolean | null>(null);

  const [showDatepicker, setShowDatepicker] = useState(false);
  const [showTravellers, setShowTravellers] = useState(false);
  const isMobile = useMediaQuery('(max-width:1023px)');

  /* keep external updates in-sync */
  useEffect(() => setDate(initialDate ? new Date(initialDate) : null), [initialDate]);
  useEffect(() => setAdults(initialAdults ?? 2), [initialAdults]);
  useEffect(() => setChildren(initialChildren ?? 0), [initialChildren]);

  /* fetch availability whenever filters change */
  useEffect(() => {
    if (!open || !date || !selectedPackageId) return;
    (async () => {
      setLoading(true);
      try {
        const iso  = date.toISOString().split('T')[0];
        const base = import.meta.env.VITE_API_URL || '';
        const res  = await fetch(`${base}/availability/package/${selectedPackageId}/slots?date=${iso}`);
        const { slots } = await res.json();
        setSlots(slots);
        const ok = slots.some((s:any) => (s.available - s.booked) >= (adults + children));
        setIsDateOk(ok);
      } catch {
        setIsDateOk(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, date, adults, children, selectedPackageId]);

  if (!open) return null;

  return (
    <div className={clsx('fixed inset-0 z-50', isMobile ? 'bg-white' : 'flex justify-center items-start pt-12 bg-black/50')}>
      <div className={clsx('bg-white overflow-hidden', isMobile ? 'w-full h-full rounded-none' : 'w-full max-w-md rounded-lg')}>
        {/* HEADER */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 relative">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mr-4">
            <X className="h-6 w-6 rounded-full bg-gray-200" />
          </button>

          {/* date button */}
          <button
            onClick={() => setShowDatepicker(o => !o)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 mr-3"
          >
            <CalendarIcon className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium">
              {date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Choose date'}
            </span>
          </button>

          {/* travellers button */}
          <button
            onClick={() => setShowTravellers(o => !o)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300"
          >
            <Users className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium">{adults}A{children > 0 && `/${children}C`}</span>
          </button>

          {/* date-picker pop/ sheet */}
          {!isMobile && showDatepicker && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-xl shadow-lg p-4 z-20">
              <DayPicker
                mode="single"
                fromDate={new Date()}
                selected={date ?? undefined}
                onSelect={d => {
                  if (d) { setDate(d); setShowDatepicker(false); }
                }}
                classNames={{
                  caption: 'text-center font-semibold mb-4',
                  head_row: 'text-gray-400',
                  day: 'w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200',
                  day_selected: 'bg-[#ff914d] text-white',
                  day_today: 'border border-[#ff914d]',
                }}
              />
            </div>
          )}
          {isMobile && (
            <Sheet isOpen={showDatepicker} onClose={() => setShowDatepicker(false)} snapPoints={[0.6]} initialSnap={0}>
              <Sheet.Backdrop onTap={() => setShowDatepicker(false)} />
              <Sheet.Container>
                <Sheet.Content>
                  <DayPicker
                    mode="single"
                    fromDate={new Date()}
                    selected={date ?? undefined}
                    onSelect={d => {
                      if (d) { setDate(d); setShowDatepicker(false); }
                    }}
                    classNames={{
                      month: 'w-full',
                      nav: 'flex w-full',
                      head_row: 'text-gray-400',
                      day: 'w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200',
                      day_selected: 'bg-[#ff914d] text-white',
                      day_today: 'border border-[#ff914d]',
                    }}
                  />
                </Sheet.Content>
              </Sheet.Container>
            </Sheet>
          )}

          {/* travellers pop / sheet */}
          {!isMobile && showTravellers && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-gray-200 rounded-xl p-5 shadow-lg z-20 w-60">
              {[
                { label: 'Adults', key: 'adults', value: adults, min: 1 },
                { label: 'Children', key: 'children', value: children, min: 0 },
              ].map(({ label, key, value, min }) => (
                <div key={key} className="flex items-center justify-between mb-4 last:mb-0">
                  <p className="font-semibold">{label}</p>
                  <div className="flex items-center space-x-4">
                    <RoundBtn disabled={value === min} onClick={() => key === 'adults' ? setAdults(value - 1) : setChildren(value - 1)}>
                      <Minus className="h-4 w-4" />
                    </RoundBtn>
                    <span className="w-4 text-center">{value}</span>
                    <RoundBtn onClick={() => key === 'adults' ? setAdults(value + 1) : setChildren(value + 1)}>
                      <Plus className="h-4 w-4" />
                    </RoundBtn>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowTravellers(false)} className="w-full mt-2 bg-[#ff914d] text-white rounded-lg py-2">
                Done
              </button>
            </div>
          )}

          {isMobile && (
            <Sheet isOpen={showTravellers} onClose={() => setShowTravellers(false)} snapPoints={[0.5]} initialSnap={0}>
              <Sheet.Backdrop onTap={() => setShowTravellers(false)} />
              <Sheet.Container>
                <Sheet.Content className="p-5">
                  {[
                    { label: 'Adults', key: 'adults', value: adults, min: 1 },
                    { label: 'Children', key: 'children', value: children, min: 0 },
                  ].map(({ label, key, value, min }) => (
                    <div key={key} className="flex items-center justify-between mb-4">
                      <p className="font-semibold">{label}</p>
                      <div className="flex items-center space-x-6">
                        <RoundBtn disabled={value === min} onClick={() => key === 'adults' ? setAdults(value - 1) : setChildren(value - 1)}>
                          <Minus className="h-4 w-4" />
                        </RoundBtn>
                        <span className="w-4 text-center">{value}</span>
                        <RoundBtn onClick={() => key === 'adults' ? setAdults(value + 1) : setChildren(value + 1)}>
                          <Plus className="h-4 w-4" />
                        </RoundBtn>
                      </div>
                    </div>
                  ))}
                </Sheet.Content>
              </Sheet.Container>
            </Sheet>
          )}
        </div>

        {/* BODY */}
        <div className="p-6">
          {loading && <p className="text-center text-gray-500">Checking availability…</p>}

          {!loading && isDateOk && (
            <div className="space-y-2">
              {slots.map(slot => (
                <button
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    onSlotSelect(slot.id);
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
                      &nbsp;–&nbsp;
                      {new Date(slot.endTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </span>
                    <span className="text-xs text-gray-600">
                      {slot.available - slot.booked} seat{(slot.available - slot.booked)===1?'':'s'} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && isDateOk === false && (
            <p className="text-center text-red-600">
              Not enough spots for {adults + children} participant{adults + children > 1 && 's'}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const RoundBtn = ({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={clsx(
      'h-8 w-8 rounded-full flex items-center justify-center',
      disabled ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800'
    )}
  >
    {children}
  </button>
);