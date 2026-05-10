import axios from "axios";

const API = axios.create({
  baseURL: "https://diabetesmodel.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default API;
