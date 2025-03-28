import axios, { AxiosRequestConfig } from "axios";
import { METHODS_HTTP } from "../enum/http.enum";

export class RequestService {
  async request<R>(
    url: string,
    method: METHODS_HTTP,
    body?: object,
    options?: AxiosRequestConfig
  ): Promise<{ status: boolean; data?: R; error?: any }> {
    console.log("axiosRequest.init ", body);
    try {
      const methods = {
        GET: () => axios.get<R>(url, options),
        POST: () => axios.post<R>(url, body, options),
        PUT: () => axios.put<R>(url, body, options),
        PATCH: () => axios.patch<R>(url, body, options),
        DELETE: () => axios.delete<R>(url, options),
      };

      const { data } = await methods[method]();

      return {
        data: data as R,
        status: true,
      };
    } catch (error) {
      const response = error?.response;
      const message = response?.data ? response.data : error.message;
      console.error(`Error in makeRequest: ${message}`, error);

      return {
        status: false,
        error,
      };
    }
  }
}
