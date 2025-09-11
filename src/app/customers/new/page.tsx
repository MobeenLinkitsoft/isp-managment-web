'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckIcon,
  WifiIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { addCustomer, updateCustomer, fetchCustomer } from '../../../lib/api/customer';
import { fetchConnectionTypes } from '../../../lib/api/connections';
import { fetchPackages } from '../../../lib/api/packages';

interface FormData {
  name: string;
  username: string;
  password: string;
  plan: string;
  connectionType: string;
  nationalId: string;
  mobile: string;
  phone: string;
  email: string;
  address: string;
}

export default function CustomerForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [connectionTypes, setConnectionTypes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    password: '',
    plan: '',
    connectionType: '',
    nationalId: '',
    mobile: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [connectionTypesData, packagesData] = await Promise.all([
          fetchConnectionTypes(),
          fetchPackages(),
        ]);
        
        setConnectionTypes(connectionTypesData);
        setPackages(packagesData);

        if (id) {
          const customerData = await fetchCustomer(id);
          setFormData({
            name: customerData.name,
            username: customerData.username,
            password: '',
            plan: customerData.plan?.id || '',
            connectionType: customerData.connectionType?.id || '',
            nationalId: customerData.nationalId,
            mobile: customerData.mobile,
            phone: customerData.phone || '',
            email: customerData.email || '',
            address: customerData.address || '',
          });
        } else if (connectionTypesData.length > 0 && packagesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            connectionType: connectionTypesData[0].id,
            plan: packagesData[0].id,
          }));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        alert('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value) newErrors.name = 'Name is required';
        else delete newErrors.name;
        break;
      case 'username':
        if (!value) newErrors.username = 'Username is required';
        else if (value.length < 3) newErrors.username = 'Username must be at least 3 characters';
        else delete newErrors.username;
        break;
      case 'password':
        if (!id && !value) newErrors.password = 'Password is required';
        else if (value && value.length < 4) newErrors.password = 'Password must be at least 4 characters';
        else delete newErrors.password;
        break;
      case 'nationalId':
        if (!value) newErrors.nationalId = 'National ID is required';
        else delete newErrors.nationalId;
        break;
      case 'mobile':
        if (!value) newErrors.mobile = 'Mobile number is required';
        else if (!/^[0-9]{10}$/.test(value)) newErrors.mobile = 'Mobile number must be 10 digits';
        else delete newErrors.mobile;
        break;
      case 'plan':
        if (!value) newErrors.plan = 'Plan is required';
        else delete newErrors.plan;
        break;
      case 'connectionType':
        if (!value) newErrors.connectionType = 'Connection type is required';
        else delete newErrors.connectionType;
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Invalid email format';
        else delete newErrors.email;
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
    const requiredFields: (keyof FormData)[] = ['name', 'username', 'nationalId', 'mobile', 'plan', 'connectionType'];
    
    if (!id) {
      requiredFields.push('password');
    }

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
    const apiData = { ...formData };
    
    if (id && !apiData.password) {
      delete apiData.password;
    }

    // Convert plan and connectionType to objects with id and name
    const formattedData: any = { ...apiData };
    
    if (formattedData.plan) {
      const selectedPlan = packages.find(p => p.id === formattedData.plan);
      if (selectedPlan) {
        formattedData.plan = { 
          id: selectedPlan.id, 
          name: selectedPlan.name 
        };
      }
    }
    
    if (formattedData.connectionType) {
      const selectedConnection = connectionTypes.find(ct => ct.id === formattedData.connectionType);
      if (selectedConnection) {
        formattedData.connectionType = { 
          id: selectedConnection.id, 
          name: selectedConnection.name 
        };
      }
    }

    if (id) {
      await updateCustomer(id, formattedData);
    } else {
      await addCustomer(formattedData);
    }
    
    router.push('/customers');
    router.refresh();
  } catch (error) {
    console.error('Error saving customer:', error);
    alert(`Failed to ${id ? 'update' : 'add'} customer`);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/customers"
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Customer' : 'VIP Customer Registration'}
              </h1>
              <p className="text-gray-600 mt-1">
                {id ? 'Update customer information' : 'Create a new customer account with premium features'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-center">
            <nav className="flex space-x-8" aria-label="Progress">
              {['basic', 'contact', 'connection'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center ${
                    activeTab === tab
                      ? 'text-indigo-600 border-indigo-600'
                      : 'text-gray-500 border-gray-200 hover:text-gray-700'
                  } border-b-2 pb-4 px-1 text-sm font-medium`}
                >
                  <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
                    activeTab === tab
                      ? 'border-indigo-600 bg-indigo-100 text-indigo-600'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="ml-2 capitalize">{tab} Information</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Basic Information */}
          {(activeTab === 'basic') && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Basic Information
                </h2>
                <p className="text-gray-600 mt-2">Enter the customer's personal details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="Choose a username"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-2">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {id ? 'Password (leave empty to keep current)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter secure password"
                    />
                    <LockClosedIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.nationalId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    placeholder="Enter NIC number"
                  />
                  {errors.nationalId && <p className="text-red-500 text-sm mt-2">{errors.nationalId}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(activeTab === 'contact') && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PhoneIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Contact Information
                </h2>
                <p className="text-gray-600 mt-2">Enter the customer's contact details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="07XXXXXXXX"
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-2">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Optional phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="customer@example.com"
                    />
                    <EnvelopeIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Connection Details */}
          {(activeTab === 'connection') && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <WifiIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Connection Details
                </h2>
                <p className="text-gray-600 mt-2">Configure the customer's internet connection</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Type *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.connectionType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.connectionType}
                    onChange={(e) => handleChange('connectionType', e.target.value)}
                  >
                    <option value="">Select Connection Type</option>
                    {connectionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.connectionType && <p className="text-red-500 text-sm mt-2">{errors.connectionType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internet Plan *
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.plan ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.plan}
                    onChange={(e) => handleChange('plan', e.target.value)}
                  >
                    <option value="">Select Internet Plan</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - Rs{pkg.price}/month
                      </option>
                    ))}
                  </select>
                  {errors.plan && <p className="text-red-500 text-sm mt-2">{errors.plan}</p>}
                </div>
              </div>

              {/* Plan Preview */}
              {formData.plan && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">Selected Plan</h3>
                  {packages
                    .filter(pkg => pkg.id === formData.plan)
                    .map(pkg => (
                      <div key={pkg.id} className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Plan Name:</span>
                          <span className="font-medium ml-2">{pkg.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium ml-2">Rs{pkg.price}/month</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Speed:</span>
                          <span className="font-medium ml-2">{pkg.speed || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Data Limit:</span>
                          <span className="font-medium ml-2">{pkg.dataLimit || 'Unlimited'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <div>
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'connection' ? 'contact' : 'basic')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {activeTab !== 'connection' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'contact' : 'connection')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {saving ? (
                    'Processing...'
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      {id ? 'Update Customer' : 'Create VIP Account'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}