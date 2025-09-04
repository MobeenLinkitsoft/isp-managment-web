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
  CurrencyDollarIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { fetchPackage, deletePackage, Package } from '../../../lib/api/packages';

export default function PackageDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [packageItem, setPackageItem] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      try {
        const packageData = await fetchPackage(id);
        setPackageItem(packageData);
      } catch (error) {
        console.error('Error loading package:', error);
        alert('Failed to load package data');
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [id]);

  const handleDelete = async () => {
    if (!packageItem || !confirm(`Are you sure you want to delete "${packageItem.name}" package?`)) return;
    
    try {
      setDeleting(true);
      await deletePackage(id);
      router.push('/packages');
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-white font-medium">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!packageItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Package not found</h1>
          <Link href="/packages" className="text-indigo-600 hover:text-indigo-900 mt-4 inline-block">
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/packages"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Packages
          </Link>
          
          <div className="flex space-x-2">
            <Link
              href={`/packages/edit/${id}`}
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
        </div>

        {/* Package Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{packageItem.name}</h1>
            <p className="text-gray-600">Internet Service Package</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BoltIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Speed</h2>
              </div>
              <p className="text-2xl font-bold text-blue-600">{packageItem.speed} Mbps</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Price</h2>
              </div>
              <p className="text-2xl font-bold text-green-600">Rs{packageItem.price.toFixed(2)}/month</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            </div>
            <p className="text-gray-600">
              {packageItem.description || 'No description provided for this package.'}
            </p>
          </div>

          {/* Metadata */}
          {packageItem.createdAt && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {packageItem.id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {formatDate(packageItem.createdAt)}
                </p>
                {packageItem.updatedAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Updated:</span> {formatDate(packageItem.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}