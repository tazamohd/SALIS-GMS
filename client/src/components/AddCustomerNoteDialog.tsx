import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCustomerNoteSchema, type InsertCustomerNote } from "@shared/schema";

interface AddCustomerNoteDialogProps {
  customerId: string;
}

export function AddCustomerNoteDialog({ customerId }: AddCustomerNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<InsertCustomerNote>({
    resolver: zodResolver(insertCustomerNoteSchema),
    defaultValues: {
      customerId,
      noteType: "general",
      content: "",
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertCustomerNote) => {
      return await apiRequest("POST", `/api/customers/${customerId}/notes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/notes`] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomerNote) => {
    createNoteMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="button-add-note">
          <Plus className="w-4 h-4 mr-2" />
          {t('customers.addNote', 'Add Note')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('customers.addCustomerNote', 'Add Customer Note')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('customers.addNoteDescription', 'Form to add a note about the customer')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.subjectOptional', 'Subject (Optional)')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('customers.noteSubject', 'Note subject')} 
                      {...field} 
                      value={field.value ?? ""} 
                      data-testid="input-note-subject" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="noteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.noteType', 'Note Type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-note-type">
                        <SelectValue placeholder={t('customers.selectNoteType', 'Select note type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">{t('customers.noteTypes.general', 'General')}</SelectItem>
                      <SelectItem value="complaint">{t('customers.noteTypes.complaint', 'Complaint')}</SelectItem>
                      <SelectItem value="feedback">{t('customers.noteTypes.feedback', 'Feedback')}</SelectItem>
                      <SelectItem value="reminder">{t('customers.noteTypes.reminder', 'Reminder')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('customers.note', 'Note')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('customers.enterNoteHere', 'Enter your note here...')}
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-note-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-note"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createNoteMutation.isPending}
                data-testid="button-submit-note"
              >
                {createNoteMutation.isPending ? t('common.adding', 'Adding...') : t('customers.addNote', 'Add Note')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
