import axios from "axios";

const mainAPI = axios.create({
  baseURL: "http://localhost:3001",
});

export default mainAPI;
