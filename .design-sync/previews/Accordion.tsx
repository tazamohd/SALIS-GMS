import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "rest-express";

export const ServiceFAQ = () => (
  <div className="p-4" style={{ width: 420 }}>
    <Accordion type="single" collapsible defaultValue="warranty">
      <AccordionItem value="warranty">
        <AccordionTrigger>Is the repair work under warranty?</AccordionTrigger>
        <AccordionContent>
          All workshop labor is covered for 6 months or 10,000 km, whichever
          comes first. Genuine spare parts carry the manufacturer&apos;s own
          warranty, registered against your plate number.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="estimate">
        <AccordionTrigger>How are repair estimates prepared?</AccordionTrigger>
        <AccordionContent>
          After inspection, the technician itemizes labor and parts on the job
          card. You approve the estimate by SMS before any work starts.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pickup">
        <AccordionTrigger>When can I pick up my vehicle?</AccordionTrigger>
        <AccordionContent>
          You receive a notification the moment the job card is closed and the
          final invoice is issued. Vehicles can be collected until 9 PM.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);
