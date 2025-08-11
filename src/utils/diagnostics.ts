// Diagnostic utilities to help debug connectivity issues

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connectivity
    const response = await fetch('https://oyacwfzdaciskhlclrby.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YWN3ZnpkYWNpc2tobGNscmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTEzODMsImV4cCI6MjA2OTk4NzM4M30.MzvPmZOeCh0l-Ggntr7zhHMMwc_DHW79wiyRyx2AHMo',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 Supabase REST API response:', response.status, response.statusText);
    
    // Test auth endpoint
    const authResponse = await fetch('https://oyacwfzdaciskhlclrby.supabase.co/auth/v1/settings', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YWN3ZnpkYWNpc2tobGNscmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTEzODMsImV4cCI6MjA2OTk4NzM4M30.MzvPmZOeCh0l-Ggntr7zhHMMwc_DHW79wiyRyx2AHMo',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 Supabase Auth API response:', authResponse.status, authResponse.statusText);
    
    if (authResponse.ok) {
      const settings = await authResponse.json();
      console.log('🔍 Auth settings:', settings);
    }
    
    return {
      restApi: response.status === 200,
      authApi: authResponse.status === 200,
    };
  } catch (error) {
    console.error('🔍 Supabase connection test failed:', error);
    return {
      restApi: false,
      authApi: false,
      error: error,
    };
  }
};

export const diagnoseCurrentState = () => {
  console.log('🔍 === DIAGNOSTIC REPORT ===');
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 User Agent:', navigator.userAgent);
  console.log('🔍 Network status:', navigator.onLine ? 'Online' : 'Offline');
  
  // Check localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('🔍 localStorage: Available');
  } catch {
    console.log('🔍 localStorage: Not available');
  }
  
  // Check for auth tokens
  const authToken = localStorage.getItem('sb-oyacwfzdaciskhlclrby-auth-token');
  console.log('🔍 Auth token exists:', !!authToken);
  
  console.log('🔍 === END DIAGNOSTIC REPORT ===');
};