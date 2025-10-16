import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { CustomerNote } from "@shared/schema";

export function CustomerCommunications() {
  const { data: communications = [], isLoading } = useQuery<CustomerNote[]>({
    queryKey: ['/api/customer/communications'],
  });

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'complaint':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'feedback':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Communications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View your communication history and notes
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading communications...</div>
      ) : communications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No communications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your communication history will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {communications.map(comm => (
            <Card key={comm.id} data-testid={`card-communication-${comm.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-communication-subject-${comm.id}`}>
                      {comm.subject || 'No Subject'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {comm.createdAt ? format(new Date(comm.createdAt), 'PPP p') : 'N/A'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(comm.noteType)}`}
                      data-testid={`type-communication-${comm.id}`}
                    >
                      {comm.noteType}
                    </span>
                    {comm.isImportant && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300" data-testid={`text-communication-content-${comm.id}`}>
                  {comm.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
