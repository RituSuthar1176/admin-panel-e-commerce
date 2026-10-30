export interface AdminProfile {
  name: string;
  email: string;
  password: string;
}

// Static for now. Later this will come from an API.
export const adminProfile: AdminProfile = {
  name: 'John Doe',
  email: 'admin@example.com',
  password: '••••••••',
};