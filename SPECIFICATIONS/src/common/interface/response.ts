export interface ResponseDefault<T> {
  data: T;
  message?: string;
  success?: boolean;
  statusCode?: number;
}