import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "rest-express";

type JobCardForm = {
  customerName: string;
  plateNumber: string;
  serviceType: string;
  complaint: string;
};

export const JobCardIntake = () => {
  const form = useForm<JobCardForm>({
    defaultValues: {
      customerName: "Abdullah Al-Qahtani",
      plateNumber: "7821 KSA",
      serviceType: "periodic",
      complaint: "Engine vibration at idle and A/C blowing warm air.",
    },
  });

  return (
    <Form {...form}>
      <form className="w-96 space-y-4 p-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                As shown on the registration card (Istimara).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="periodic">Periodic Maintenance</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="bodywork">Bodywork</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Complaint</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Open Job Card</Button>
      </form>
    </Form>
  );
};

export const ValidationError = () => {
  const form = useForm<{ plateNumber: string; odometer: string }>({
    defaultValues: { plateNumber: "ABC", odometer: "" },
    errors: {
      plateNumber: {
        type: "manual",
        message: "Plate number must match the Saudi format, e.g. 7821 KSA.",
      },
      odometer: {
        type: "required",
        message: "Odometer reading is required to open a job card.",
      },
    },
  });

  return (
    <Form {...form}>
      <form className="w-96 space-y-4 p-4">
        <FormField
          control={form.control}
          name="plateNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="odometer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Odometer (km)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 84,500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline">
          Save Vehicle
        </Button>
      </form>
    </Form>
  );
};

export const WithDescriptionOnly = () => {
  const form = useForm<{ vin: string }>({
    defaultValues: { vin: "JTDBT923771012345" },
  });

  return (
    <Form {...form}>
      <form className="w-96 space-y-4 p-4">
        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN / Chassis Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                17 characters. Used to look up the vehicle's service history.
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
