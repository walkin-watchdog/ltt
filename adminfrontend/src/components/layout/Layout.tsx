import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';


export const Layout = ({ children }: {children: ReactNode;}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};