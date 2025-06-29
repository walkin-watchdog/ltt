import { Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState, useEffect, useRef } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Sheet } from 'react-modal-sheet';
import clsx from 'clsx';

interface Props {
  selectedDate: string;
  adults: number;
  children: number;
  onChange: (d: { date: string; adults: number; children: number }) => void;
  onCheck: () => void;
}

export const AvailabilityBar = ({
  selectedDate,
  adults,
  children,
  onChange,
  onCheck,
}: Props) => (
  <BarUI
    selectedDate={selectedDate}
    adults={adults}
    children={children}
    onChange={onChange}
    onCheck={onCheck}
  />
);

const BarUI = ({
  selectedDate,
  adults,
  children,
  onChange,
  onCheck,
}: Props) => {
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [showTravellers, setShowTravellers] = useState(false);
  const datepickerRef = useRef<HTMLDivElement>(null);
  const travellersRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:1023px)');

  useEffect(() => {
    if (!isMobile && showDatepicker) {
      const handleClickOutside = (e: MouseEvent) => {
        if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
          setShowDatepicker(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, showDatepicker]);

  useEffect(() => {
    if (!isMobile && showTravellers) {
      const handleClickOutside = (e: MouseEvent) => {
        if (travellersRef.current && !travellersRef.current.contains(e.target as Node)) {
          setShowTravellers(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, showTravellers]);

  return (
    <div className="bg-white rounded-xl mb-6">
      <h3 className="text-xl font-semibold mb-5">Select Date and Travelers</h3>

      {/* Date field */}
      <div className="relative" ref={datepickerRef}>
        <button
          onClick={() => setShowDatepicker((o) => !o)}
          className={`w-full flex items-center rounded-lg px-4 py-4 mb-4
                      focus:outline-none focus:ring-2 focus:ring-[#104c57] ${
            selectedDate
              ? 'border border-gray-400'
              : 'border border-gray-300 hover:border-gray-400'
          }`}
        >
          <CalendarIcon className="h-5 w-5 text-gray-700 mr-4" />
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Choose a date'}

          <input
            id="native-date-input"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
        </button>

        {!isMobile && showDatepicker && (
          <div 
            className="absolute z-30 bg-white rounded-xl shadow-lg right-0 p-4"
          >
            <DayPicker
              mode="single"
              numberOfMonths={2}
              month={month}
              onMonthChange={setMonth}
              fromDate={new Date()}
              selected={selectedDate ? new Date(selectedDate) : new Date()}
              onSelect={(day) => {
                if (day) {
                  onChange({
                    date: day.toLocaleDateString('en-US'),
                    adults,
                    children,
                  });
                  setShowDatepicker(false);
                }
              }}
              className="flex flex-col sm:flex-row gap-8"
              classNames={{
                caption: 'text-center font-semibold mb-4',
                table: 'border-collapse',
                head_row: 'text-gray-400',
                day: 'w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#104c57] hover:ring-opacity-50',
                day_selected: 'bg-[#104c57] text-white font-semibold',
                day_today: 'border border-[#104c57]',
              }}
            />
          </div>
        )}
        {isMobile && (
          <Sheet isOpen={showDatepicker} onClose={() => setShowDatepicker(false)} snapPoints={[0.6]} initialSnap={0}>
            <Sheet.Backdrop onTap={() => setShowDatepicker(false)} />
            <Sheet.Container>
              <Sheet.Header className="flex justify-end p-4">
                <button
                  aria-label="Close date picker"
                  onClick={() => setShowDatepicker(false)}
                  className="bg-gray-200 rounded-full p-2 h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                >
                  <span className="text-xl">✕</span>
                </button>
              </Sheet.Header>
              <Sheet.Content className="">
                <DayPicker
                  mode="single"
                  numberOfMonths={1}
                  month={month}
                  onMonthChange={setMonth}
                  fromDate={new Date()}
                  selected={selectedDate ? new Date(selectedDate) : new Date()}
                  onSelect={(day) => {
                    if (day) {
                      onChange({
                        date: day.toLocaleDateString('en-US'),
                        adults,
                        children,
                      });
                      setShowDatepicker(false);
                    }
                  }}
                  classNames={{
                    month: "w-full",
                    nav: "flex w-full",
                    caption: 'text-center font-semibold mb-4',
                    table: 'border-collapse w-full',
                    head_row: 'text-gray-400',
                    day: 'w-10 h-10 items-center justify-center rounded-full hover:ring-2 hover:ring-[#104c57] hover:ring-opacity-50',
                    day_selected: 'bg-[#104c57] text-white font-semibold',
                    day_today: 'border border-[#104c57]',
                  }}
                />
              </Sheet.Content>
            </Sheet.Container>
          </Sheet>
        )}
      </div>
      {/* Travellers field */}
      <div className="relative" ref={travellersRef}>
        <button
          className="w-full flex items-center border border-gray-300 rounded-lg px-4 py-4
                     hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#104c57]"
          onClick={() => setShowTravellers((o) => !o)}
        >
          <Users className="h-5 w-5 text-gray-700 mr-4" />
          {adults} Adult{adults > 1 ? 's' : ''}{' '}
          {children > 0 && `, ${children} Child${children > 1 ? 'ren' : ''}`}
        </button>

        {/* dropdown */}
        {showTravellers && (
          <div
            className="absolute z-20 left-0 right-0 mt-3 bg-white border border-gray-200
                       rounded-xl p-5 shadow-lg"
          >
            {[
              { label: 'Adults', key: 'adults', price: 0, value: adults, min: 1 },
              {
                label: 'Children',
                key: 'children',
                price: 0,
                value: children,
                min: 0,
              },
            ].map(({ label, key, price, value, min }) => (
              <div
                key={key}
                className="flex items-center justify-between mb-4 last:mb-0"
              >
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-gray-600">${price}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <CircleBtn
                    disabled={value === min}
                    onClick={() =>
                      onChange({
                        date: selectedDate,
                        adults: key === 'adults' ? value - 1 : adults,
                        children: key === 'children' ? value - 1 : children,
                      })
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </CircleBtn>
                  <span className="w-4 text-center">{value}</span>
                  <CircleBtn
                    onClick={() =>
                      onChange({
                        date: selectedDate,
                        adults: key === 'adults' ? value + 1 : adults,
                        children: key === 'children' ? value + 1 : children,
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </CircleBtn>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowTravellers(false)}
              className="w-full mt-4 bg-[#104c57] hover:bg-[#ff914d] text-white
                         font-semibold rounded-lg px-6 py-3"
            >
              Update search
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onCheck}
        className="w-full mt-6 bg-[#104c57] hover:bg-[#ff914d] text-white
                   font-semibold rounded-lg px-6 py-4"
      >
        Check Availability
      </button>
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