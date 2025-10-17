import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Welcome to Your App
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Sign in to access your personalized dashboard and start managing your account.
        </p>
        <div className="space-y-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}