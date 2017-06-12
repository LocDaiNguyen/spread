export interface User {
  _id?: string;
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  active: boolean;
  verify: boolean;
  paid: boolean;
  avatar: string;
}
