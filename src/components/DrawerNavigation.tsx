"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  WifiIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { logoutUser } from "../lib/auth";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/storage";

interface DrawerProps {
  onLogout: () => void;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: UsersIcon },
  { name: "Connections", href: "/connections", icon: WifiIcon },
  { name: "Payments", href: "/payments", icon: CurrencyDollarIcon },
  { name: "Inventory", href: "/inventory", icon: CubeIcon },
  { name: "Employees", href: "/employees", icon: UserGroupIcon, adminOnly: true },
  { name: "Packages", href: "/packages", icon: ChartBarIcon },
  { name: "Invoice", href: "/invoice", icon: DocumentCheckIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function DrawerNavigation() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const onLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutUser();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex w-64 flex-col">
        {/* Sidebar */}
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <WifiIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Login.Me ISP</h1>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-4 space-y-1">
              {navigationItems.map((item) => {
                // If item is admin-only and currentUser is not admin, skip it
                if (item.adminOnly && currentUser?.role !== "admin") {
                  return null;
                }

                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                        }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : "Loading..."}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser ? currentUser.role : ""}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 rounded-md"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
