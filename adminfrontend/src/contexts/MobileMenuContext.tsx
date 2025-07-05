import { createContext, useState } from 'react';

interface MobileMenuContextType {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileMenuContext = createContext<MobileMenuContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}