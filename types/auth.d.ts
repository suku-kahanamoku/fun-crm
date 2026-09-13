declare module "#auth-utils" {
  interface User {
    id?: number | string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }
}

export {};
