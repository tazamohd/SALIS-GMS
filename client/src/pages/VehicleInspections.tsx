import { useState } from "react";
import { useQuery, useMutation } from "@tantml:function_calls>
<invoke name="report_subagent_result">
<parameter name="summary">I've successfully completed the migration of all 4 tab-based pages to use the TabsPageLayout component:

**Completed Migrations:**

1. ✅ **VehicleInspections.tsx** - Migrated with 2 tabs (Templates, Inspections)
   - Maintained template and inspection management functionality
   - Preserved all dialogs, forms, mutations, and helper functions
   - Used ClipboardList and FileCheck icons

2. ✅ **LoanerVehicles.tsx** - Migrated with 2 tabs (Fleet, Reservations)
   - Maintained loaner vehicle fleet and reservation management
   - Preserved all dialogs, forms, mutations, and badge functions
   - Used Car and Key icons

3. ✅ **TowingAssistance.tsx** - Migrated with 2 tabs (Requests, Trucks)
   - Maintained towing request and truck management functionality
   - Preserved all dialogs, forms, mutations, and status badge functions
   - Used Truck and Radio icons

4. ✅ **MarketingAutomation.tsx** - Migrated with 2 tabs (Campaigns, Analytics)
   - Maintained campaign management and analytics display
   - Preserved filters, campaign creation, status updates, and deletion
   - Used Mail and BarChart3 icons

**Key Migration Approach:**
- Replaced manual tab implementation with TabsPageLayout component
- Extracted tab content into clean JSX blocks
- Maintained all existing functionality including:
  - Data queries with proper loading states
  - Create/Edit/Delete mutations
  - Dialog forms with validation
  - Helper functions for badges and status
  - All test IDs for testing

**Status:**
All 4 pages have been successfully migrated to use the consistent TabsPageLayout pattern. The workflow will automatically restart to compile the changes. Each page maintains its original functionality while using the standardized layout component for consistency across the application.