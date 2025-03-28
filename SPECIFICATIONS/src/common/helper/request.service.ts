import axios from 'axi'
export class RequestService {

  async axiosRequest<R>(
    url: string,
    method: METHODS_HTTP,
    body?: object,
    options?: AxiosRequestConfig
  ): Promise<{ status: boolean; data?: R; error?: any }> {
    console.log("axiosRequest.init ", body);
    try {
      const methods = {
        GET: () => this.httpService.get<R>(url, options),
        POST: () => this.httpService.post<R>(url, body, options),
        PUT: () => this.httpService.put<R>(url, body, options),
        PATCH: () => this.httpService.patch<R>(url, body, options),
        DELETE: () => this.httpService.delete<R>(url, options),
      };

      const request = methods[method]();
      const { data } = await firstValueFrom(request);

      return {
        data: data as R,
        status: true,
      };
    } catch (error) {
      const response = error?.response;
      const message = response?.data ? response.data : error.message;
      // console.log(error.response);
      this.logger.error(`Error in makeRequest: ${message}`, error);

      return {
        status: false,
        error,
      };
    }
  }
}
