import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, RefreshCw, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please try again or return to the
                dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={resetError} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Link href="/">
                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {isDev && (
              <div className="w-full mt-4">
                <button
                  onClick={() => setShowDetails((prev) => !prev)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showDetails ? "Hide" : "Show"} error details
                </button>

                {showDetails && (
                  <div className="mt-3 rounded-md bg-muted p-3 text-left">
                    <p className="text-xs font-mono text-destructive break-all">
                      {error.message}
                    </p>
                    {error.stack && (
                      <pre className="mt-2 text-[10px] font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
