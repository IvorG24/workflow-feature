export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  phoneNumber: string | null;
  noPasswordProvider: boolean;
};
