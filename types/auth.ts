export interface User {
  id: string | number;
  email: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  // Backend fields often in snake_case
  first_name?: string; 
  last_name?: string;
  account_type?: string;
  id_number?: string;
  
  role?: string;
  avatar?: string;
  photo?: string; // Backend field
  
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  
  tenants?: Array<{
    id: string;
    schema_name: string;
    name: string;
    logo?: string;
  }>;
  workspace?: string; // From portable-auth
  
  permissions?: string[];
  [key: string]: any;
}

export interface AuthPayload {
  user: User;
  token?: string;
}
