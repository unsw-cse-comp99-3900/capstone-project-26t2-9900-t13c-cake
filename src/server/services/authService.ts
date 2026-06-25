/** Layer 3 — AuthService (CAKE-10) */
export const authService = {
  async verifyCredentials(_username: string, _password: string): Promise<boolean> {
    void _username;
    void _password;
    throw new Error("Not implemented");
  },
};
