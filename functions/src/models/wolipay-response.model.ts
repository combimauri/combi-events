export interface WolipayResponse<T> {
  code: number;
  message: string;
  body: T;
}
