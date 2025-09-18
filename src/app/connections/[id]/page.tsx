'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  WifiIcon,
  InformationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { fetchConnectionType, deleteConnectionType, ConnectionType } from '../../../lib/api/connections';
import { getCurrentUser } from '../../../lib/storage'; // ✅ Import current user

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function ConnectionDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [connection, setConnection] = useState<ConnectionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // ✅ Track user

  useEffect(() => {
    const loadConnection = async () => {
      try {
        const connectionData = await fetchConnectionType(id);
        setConnection(connectionData);
      } catch (error) {
        console.error('Error loading connection:', error);
        alert('Failed to load connection data');
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    loadConnection();
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!connection || !confirm(`Are you sure you want to delete "${connection.name}"?`)) return;
    
    try {
      setDeleting(true);
      await deleteConnectionType(id);
      router.push('/connections');
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Failed to delete connection');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-white font-medium">Loading connection...</p>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Connection not found</h1>
          <Link href="/connections" className="text-indigo-600 hover:text-indigo-900 mt-4 inline-block">
            Back to Connections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/connections"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Connections
          </Link>
          
          {/* ✅ Only show Edit & Delete for admin */}
          {currentUser?.role === 'admin' && (
            <div className="flex space-x-2">
              <Link
                href={`/connections/edit/${id}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <TrashIcon className="w-4 h-4 mr-2" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Connection Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{connection.name}</h1>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              </div>
              <p className="text-gray-600">
                {connection.description || 'No description provided'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {connection.id}
                </p>
                {/* Add created/updated dates if available in your API response */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
