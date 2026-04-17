/**
 * Authentication utilities
 */

/**
 * Load user information from authentication token
 * @returns {Object} User object with { user_id, name, email, role }
 */
export function loadUserFromToken() {
  try {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }

    // Decode JWT token (simple base64 decode - adjust as needed for your token format)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format');
      return null;
    }

    const decoded = JSON.parse(atob(parts[1]));
    
    return {
      user_id: decoded.sub || decoded.user_id || decoded.id,
      name: decoded.name || decoded.username,
      email: decoded.email,
      role: decoded.role || decoded.roles || [],
    };
  } catch (error) {
    console.error('Error loading user from token:', error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param {string|string[]} requiredRoles - Role(s) to check
 * @returns {boolean} True if user has the required role
 */
export function hasRole(requiredRoles) {
  const user = loadUserFromToken();
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  
  return roles.some(role => userRoles.includes(role));
}

/**
 * Get authentication header for API requests
 * @returns {Object} Headers object with Authorization header
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}
