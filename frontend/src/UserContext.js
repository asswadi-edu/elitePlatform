import React, { createContext, useState, useEffect } from 'react';
import { getApiUrl } from './api';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("guest");
  const [isUniversity, setIsUniversity] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const setUser = (u) => {
    setUserState(u);
    if (u) {
      // Determine primary role for UI purposes (admin > moderator > subscriber > student)
      const roles = (u.roles?.map(r => typeof r === 'string' ? r : r.name) || []);
      const perms = u.user_permissions || u.permissions || [];
      if (u.role && !roles.includes(u.role)) roles.push(u.role);
      
      let roleName = "student";
      if (roles.includes('admin')) roleName = 'admin';
      else if (roles.includes('moderator')) roleName = 'moderator';
      else if (roles.includes('subscriber')) roleName = 'subscriber';
      else if (roles.includes('student_school') || roles.includes('student_university')) roleName = 'student';

      setUserRole(roleName);
      setIsUniversity(!!u.is_university || !!u.universityInfo);
      
      // Robust subscription detection
      const hasActiveSub = !!u.active_subscription || !!u.activeSubscription || (u.active_subscription && u.active_subscription.status === 1);
      setIsSubscribed(hasActiveSub || roles.includes('subscriber') || roles.includes('admin') || roles.includes('moderator'));
      setLoggedIn(true);
    } else {
      setUserRole("guest");
      setIsUniversity(false);
      setIsSubscribed(false);
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    // Initial sync from token if needed, but App.js handles it.
    // This effect is now mostly for safety or logging.
  }, [user]);

  const logout = () => {
    const token = localStorage.getItem("elite_token");
    if (token) {
        fetch(`${getApiUrl()}/api/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => {});
    }
    localStorage.removeItem("elite_token");
    setLoggedIn(false);
    setUser(null);
    setUserRole("guest");
    setIsUniversity(false);
    window.location.href = "/";
  };

  return (
    <UserContext.Provider value={{ user, setUser, loggedIn, setLoggedIn, userRole, setUserRole, isUniversity, setIsUniversity, isSubscribed, setIsSubscribed, logout }}>
      {children}
    </UserContext.Provider>
  );
}
