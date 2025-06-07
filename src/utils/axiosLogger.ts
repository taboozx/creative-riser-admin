import axios from "axios";

axios.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === "post") {
    console.log("[Axios] POST", config.url, config.data);
  }
  return config;
});

export {};
