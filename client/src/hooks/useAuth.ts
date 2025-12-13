import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // TEMPORARILY DISABLED: Authentication bypass - always return authenticated
  return {
    user: user || {
      id: 'default-user',
      email: 'admin@salisauto.com',
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      isActive: true,
      garageId: null
    } as User,
    isLoading: false,
    isAuthenticated: true,
  };
}