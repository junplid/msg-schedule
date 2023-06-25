import axios from "axios";

const mainAPI = axios.create({
  baseURL: "https://ad81-177-128-192-93.ngrok-free.app",
  headers: {
    "ngrok-skip-browser-warning": 1,
  },
});

export default mainAPI;
