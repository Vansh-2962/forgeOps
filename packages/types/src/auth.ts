export interface GoogleSignInResponse {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
  token: string;
}
