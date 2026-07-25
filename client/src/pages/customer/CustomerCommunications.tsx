import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { CustomerNote } from "@shared/schema";
import { StandardPageLayout } from "@/components/layouts";

export function CustomerCommunications() {
  const { data: communications = [], isLoading } = useQuery<CustomerNote[]>({
    queryKey: ['/api/customer/communications'],
  });

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white';
      case 'complaint':
        return 'bg-[#F97316]/20 text-[#F97316]';
      case 'feedback':
        return 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white';
      case 'reminder':
        return 'bg-[#0BB3FF]/20 text-[#0A5ED7] dark:text-[#0BB3FF]';
      default:
        return 'bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]';
    }
  };

  return (
    <StandardPageLayout
      title="Communications"
      description="View your communication history and notes"
      icon={MessageSquare}
    >
      {isLoading ? (
        <div className="text-center py-12 text-[#64748B]">Loading communications...</div>
      ) : communications.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white mb-2">
              No communications yet
            </h3>
            <p className="text-[#64748B]">
              Your communication history will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {communications.map(comm => (
            <Card key={comm.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-communication-${comm.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-communication-subject-${comm.id}`}>
                      {comm.subject || 'No Subject'}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[#64748B]">
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
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F97316]/20 text-[#F97316]">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#0B1F3B] dark:text-white" data-testid={`text-communication-content-${comm.id}`}>
                  {comm.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StandardPageLayout>
  );
}
