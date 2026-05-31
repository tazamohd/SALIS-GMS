import { useMutation, type InvalidateQueryFilters } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface UseCrudMutationOptions<TData = unknown> {
  /** HTTP method */
  method: HttpMethod;
  /** API endpoint — may include a placeholder like `/api/items/:id` */
  url: string | ((data: TData) => string);
  /** Query keys to invalidate on success */
  invalidateKeys?: InvalidateQueryFilters["queryKey"][];
  /** Toast title on success (default: "Success") */
  successMessage?: string;
  /** Toast description on success */
  successDescription?: string;
  /** Toast title on error (default: "Error") */
  errorMessage?: string;
  /** Extra callback after success (runs after invalidation + toast) */
  onSuccess?: () => void;
  /** Extra callback after error */
  onError?: (error: Error) => void;
}

/**
 * Thin wrapper around `useMutation` that handles:
 *  - calling `apiRequest(method, url, data)`
 *  - invalidating supplied query keys
 *  - showing success / error toasts
 *
 * Returns the same object as `useMutation` so callers keep `.mutate()`,
 * `.isPending`, etc.
 */
export function useCrudMutation<TData = unknown>(
  opts: UseCrudMutationOptions<TData>,
) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TData) => {
      const url =
        typeof opts.url === "function" ? opts.url(data) : opts.url;
      // For DELETE with no body, pass undefined
      const body = opts.method === "DELETE" ? undefined : (data as unknown);
      return apiRequest(opts.method, url, body);
    },
    onSuccess: () => {
      if (opts.invalidateKeys) {
        for (const key of opts.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      toast({
        title: opts.successMessage ?? "Success",
        description: opts.successDescription,
      });
      opts.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: opts.errorMessage ?? "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      opts.onError?.(error);
    },
  });
}
