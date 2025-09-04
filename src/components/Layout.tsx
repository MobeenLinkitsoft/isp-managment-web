'use client';

import { useState } from 'react';
import DrawerNavigation from './DrawerNavigation';
import MobileDrawer from './MobileDrawer';
import { Bars3Icon, ChartBarIcon, Cog6ToothIcon, CubeIcon, CurrencyDollarIcon, HomeIcon, UserGroupIcon, UsersIcon, WifiIcon } from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Connections', href: '/connections', icon: WifiIcon },
  { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Packages', href: '/packages', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DrawerNavigation onLogout={handleLogout} />
      <MobileDrawer 
        isOpen={mobileDrawerOpen} 
        onClose={() => setMobileDrawerOpen(false)}
        navigationItems={navigationItems}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <WifiIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">ISP Manager</h1>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}