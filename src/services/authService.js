import axios from "axios";

const API_URL = "/api/auth";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    // Store token in localStorage
    localStorage.setItem("token", response.data.access_token);

    return { success: true };
  } catch (err) {
    return { success: false, message: "Invalid email or password" };
  }
};

export const logout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    await fetch("http://127.0.0.1:8000/auth/logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    // Clear token from local storage
    localStorage.removeItem("token");
  
    // Redirect to login page
    window.location.href = "/login";
  };

  export const getStudents = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:8000/students/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    if (!response.ok) {
      throw new Error("Unauthorized! Please log in.");
    }
  
    return response.json();
  };
  
  
