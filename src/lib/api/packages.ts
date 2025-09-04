import apiClient from '../api-client';

export interface Package {
  id: string;
  name: string;
  price: number;
  speed: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageStats {
  totalPackages: number;
  totalRevenue: number;
  averagePrice: number;
  maxSpeed: number;
  minSpeed: number;
}

export const fetchPackages = async (): Promise<Package[]> => {
  const { data } = await apiClient.get('/package');
  return data;
};

export const fetchPackage = async (id: string): Promise<Package> => {
  const { data } = await apiClient.get(`/package/${id}`);
  return data;
};

export const addPackage = async (pkg: Omit<Package, 'id'>): Promise<Package> => {
  const { data } = await apiClient.post('/package', pkg);
  return data;
};

export const updatePackage = async (
  id: string,
  updates: Partial<Package>
): Promise<Package> => {
  const { data } = await apiClient.put(`/package/${id}`, updates);
  return data;
};

export const deletePackage = async (id: string): Promise<void> => {
  await apiClient.delete(`/package/${id}`);
};

export const fetchPackageStats = async (): Promise<PackageStats> => {
  const packages = await fetchPackages();
  
  const totalPackages = packages.length;
  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.price, 0);
  const averagePrice = totalPackages > 0 ? totalRevenue / totalPackages : 0;
  const maxSpeed = Math.max(...packages.map(pkg => pkg.speed), 0);
  const minSpeed = Math.min(...packages.map(pkg => pkg.speed), Infinity);

  return {
    totalPackages,
    totalRevenue,
    averagePrice,
    maxSpeed: minSpeed === Infinity ? 0 : maxSpeed,
    minSpeed: minSpeed === Infinity ? 0 : minSpeed
  };
};