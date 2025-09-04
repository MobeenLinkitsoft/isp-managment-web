// Simple auth functions without circular dependencies
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store directly to localStorage to avoid import issues
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
};

export const getCurrentUser = () => {
  // if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};