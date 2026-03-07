import apiClient from "@/lib/api2/client";
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/**
 * ApiService provides a wrapper around axios for consistent error handling.
 * Follows the v1 pattern for API calls with proper type safety.
 */
const ApiService = {
  /**
   * Fetch data with axios - returns unwrapped data or throws error
   */
  fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
    param: AxiosRequestConfig<Request>
  ) {
    return new Promise<Response>((resolve, reject) => {
      apiClient(param)
        .then((response: AxiosResponse<Response>) => {
          resolve(response.data);
        })
        .catch((error: AxiosError) => {
          reject(error);
        });
    });
  },
};

export default ApiService;
