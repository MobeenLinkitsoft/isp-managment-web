'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { updateConnectionType, fetchConnectionType, ConnectionType } from '../../../../lib/api/connections';

interface FormData {
  name: string;
  description: string;
}

export default function EditConnection() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    const loadConnection = async () => {
      try {
        const connectionData = await fetchConnectionType(id);
        setFormData({
          name: connectionData.name,
          description: connectionData.description || '',
        });
      } catch (error) {
        console.error('Error loading connection:', error);
        alert('Failed to load connection data');
      } finally {
        setLoading(false);
      }
    };

    loadConnection();
  }, [id]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value) newErrors.name = 'Name is required';
        else delete newErrors.name;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateForm = () => {
    let isValid = true;
    const requiredFields: (keyof FormData)[] = ['name'];
    
    requiredFields.forEach(field => {
      isValid = validateField(field, formData[field]) && isValid;
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix all errors before submitting');
      return;
    }

    try {
      setSaving(true);
      await updateConnectionType(id, formData);
      
      router.push('/connections');
      router.refresh();
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('Failed to update connection type');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/connections"
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Connection Type
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Connection Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <WifiIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Edit Connection Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Fiber Optic, Cable, DSL"
                />
                {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter description of this connection type"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {saving ? (
                'Updating...'
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Update Connection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}