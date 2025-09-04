'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export default function MobileDrawer({ isOpen, onClose, navigationItems }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40">
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-40 flex">
        <div className="relative flex-1 flex flex-col w-64 max-w-xs bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={onClose}
                  >
                    <Icon className={`mr-4 h-6 w-6 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}