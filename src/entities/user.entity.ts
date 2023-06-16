type TypesUser_T = "user" | "root";
export interface User {
  token: string;
  full_name: string;
  type: TypesUser_T | null;
}
