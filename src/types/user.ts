export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  isGuest: boolean;
}
