// src/hooks/useAuth.js
export const useAuth = () => {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("userRoleInfo") || "{}");
  } catch {
    user = {};
  }

  return {
    role: String(user?.role || "").trim().toLowerCase(),
    email: user?.email,
    name: user?.name,
  };
};
