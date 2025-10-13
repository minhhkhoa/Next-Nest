export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  isOk: boolean;
  isError: boolean;
}
