import { Avatar, AvatarImage, AvatarFallback } from "rest-express";

const SVG_PORTRAIT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%230A5ED7'/%3E%3Ccircle cx='40' cy='30' r='14' fill='white'/%3E%3Cellipse cx='40' cy='68' rx='24' ry='18' fill='white'/%3E%3C/svg%3E";

export const TechnicianInitials = () => (
  <div className="flex items-center gap-4 p-4">
    <Avatar>
      <AvatarFallback>HK</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback className="bg-primary text-primary-foreground">
        AS
      </AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback className="bg-secondary text-secondary-foreground">
        MR
      </AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage src={SVG_PORTRAIT} alt="Hamid Khan" />
      <AvatarFallback>HK</AvatarFallback>
    </Avatar>
  </div>
);

export const Sizes = () => (
  <div className="flex items-center gap-4 p-4">
    <Avatar className="h-7 w-7">
      <AvatarFallback className="text-xs">JC</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>JC</AvatarFallback>
    </Avatar>
    <Avatar className="h-14 w-14">
      <AvatarFallback className="text-lg">JC</AvatarFallback>
    </Avatar>
  </div>
);

export const StackedTeam = () => (
  <div className="flex flex-col gap-2 p-4">
    <p className="text-sm font-medium">Assigned to job card JC-1042</p>
    <div className="flex -space-x-3">
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-primary text-primary-foreground">
          HK
        </AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          AS
        </AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          +2
        </AvatarFallback>
      </Avatar>
    </div>
  </div>
);
