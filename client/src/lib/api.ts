import axios from "axios";

const api = axios.create({
  baseURL: "https://noreva-modern-digital-banking.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;