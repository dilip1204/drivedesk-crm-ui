// src/hooks/useAuth.js
export const useAuth = () => {
  const user = JSON.parse(localStorage.getItem("userRoleInfo"));
  return {
    role: user?.role,
    email: user?.email,
    name: user?.name,
  };
};
