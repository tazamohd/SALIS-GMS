import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "rest-express";

const jobs = [
  { id: "JC-1042", vehicle: "Toyota Camry 2021 — KSA 4821", service: "Brake pad replacement", tech: "Omar H.", status: "In Progress", total: "SAR 640" },
  { id: "JC-1041", vehicle: "Nissan Patrol 2019 — RUH 7733", service: "Full service + oil change", tech: "Faisal A.", status: "Awaiting Parts", total: "SAR 1,180" },
  { id: "JC-1039", vehicle: "Hyundai Sonata 2023 — JED 2210", service: "AC compressor diagnosis", tech: "Yusuf K.", status: "Completed", total: "SAR 320" },
];

export const JobCards = () => (
  <Table>
    <TableCaption>Open job cards — Al Malaz branch</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Job card</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Service</TableHead>
        <TableHead>Technician</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Total</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {jobs.map((j) => (
        <TableRow key={j.id}>
          <TableCell className="font-medium">{j.id}</TableCell>
          <TableCell>{j.vehicle}</TableCell>
          <TableCell>{j.service}</TableCell>
          <TableCell>{j.tech}</TableCell>
          <TableCell>
            <Badge variant={j.status === "Completed" ? "secondary" : "default"}>{j.status}</Badge>
          </TableCell>
          <TableCell className="text-right">{j.total}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
