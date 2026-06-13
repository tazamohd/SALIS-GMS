import { StatusDot } from "rest-express";

export const AllStatuses = () => (
  <div className="flex items-center gap-6 text-sm">
    <span className="flex items-center gap-2">
      <StatusDot status="active" /> Active
    </span>
    <span className="flex items-center gap-2">
      <StatusDot status="pending" /> Pending
    </span>
    <span className="flex items-center gap-2">
      <StatusDot status="warning" /> Warning
    </span>
    <span className="flex items-center gap-2">
      <StatusDot status="inactive" /> Inactive
    </span>
  </div>
);

export const TechnicianRoster = () => (
  <div className="flex w-full max-w-xs flex-col gap-2 text-sm">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <StatusDot status="active" /> Omar H. — Bay 3
      </span>
      <span className="text-xs text-muted-foreground">On job</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <StatusDot status="pending" /> Faisal A. — Bay 1
      </span>
      <span className="text-xs text-muted-foreground">Parts requested</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <StatusDot status="warning" /> Yusuf K. — Bay 2
      </span>
      <span className="text-xs text-muted-foreground">Job overdue</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <StatusDot status="inactive" /> Khalid M.
      </span>
      <span className="text-xs text-muted-foreground">Off shift</span>
    </div>
  </div>
);

export const SizedDots = () => (
  <div className="flex items-center gap-4 text-sm">
    <span className="flex items-center gap-2">
      <StatusDot status="active" className="w-3 h-3" /> Workshop open
    </span>
    <span className="flex items-center gap-2">
      <StatusDot status="warning" className="w-3 h-3" /> 2 overdue job cards
    </span>
  </div>
);
