import axios from "axios";

const mainAPI = axios.create({
  baseURL: "https://10fa-177-128-192-93.ngrok-free.app",
  headers: {
    "ngrok-skip-browser-warning": 1,
  },
});

export default mainAPI;
