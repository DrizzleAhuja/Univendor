import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Don't treat 401 as an error since it's expected when not logged in
    throwOnError: (error: any) => error?.response?.status !== 401,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error: error?.response?.status === 401 ? null : error,
  };
}
