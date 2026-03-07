export interface UserData {
  id: number;
  username: string;
  createBy?: string;
  createDate?: string;
  updateBy?: string;
  updateDate?: string;
  isDelete?: boolean;
}

export interface LoginResponse {
  status: number | string;
  message: string;
  bearerToken: string;
  data: UserData;
}
