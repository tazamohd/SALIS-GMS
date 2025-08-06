# Appointment Check-in Module

## Purpose

To manage the vehicle arrival and check-in process for scheduled appointments, ensuring that condition tracking, service readiness, and approval workflows are handled efficiently at the garage level.

---

## Detailed Features and Rules

### ✅ Who Can Perform Check-in

* **Receptionist**, **Supervisor**, or **Garage Admin** can mark a vehicle as "Arrived".
* Lead technicians and system admins are not directly involved in check-in.
* QR-based check-in is planned for future versions.

### ✅ Vehicle Condition Logging

* **Optional** but supported.
* Fields: Scratches, dents, fuel level, mileage, and external conditions.
* Used to document customer disputes and internal quality assurance.

### 📸 Photo Before Service

* **Mandatory**.
* Taken by the staff during check-in.
* Used for evidence in customer disputes.

### 🔄 Add-on Service Suggestions

* Enabled during check-in.
* System may recommend relevant services based on vehicle type or history.
* Garage can upsell services at this stage.

### 🧾 Printed Job Intake Form

* **Enabled**.
* Generated automatically after vehicle check-in.
* Contains:

  * Appointment ID
  * Customer details
  * Vehicle info
  * List of services/packages
  * Technician notes
  * Initial condition + photos

### 🔐 Rejection Handling

* If vehicle arrives at the wrong branch, or too late, or is incompatible with the service, **approval is required**.
* Approval roles: **Receptionist**, **Supervisor**, or **Garage Admin**.

### 🔕 Arrival Timestamp + Staff Logs

* **Not required** for now (as per user preference).
* May be enabled later if needed.

---

## Notifications

* Upon check-in, the **customer is notified**:

  * That the vehicle is marked as arrived
  * With service step tracking links if registered
* Channels: **App**, **SMS**, and **Email** (if available)

---

## Configuration

| Setting                   | Scope               | Description                        |
| ------------------------- | ------------------- | ---------------------------------- |
| Vehicle Condition Capture | Garage Configurable | Optional or required               |
| Photo Requirement         | Always Enabled      | Cannot be disabled                 |
| Add-On Suggestions        | Garage Configurable | Optional upsell support            |
| Print Intake Form         | Always Enabled      | Default on check-in                |
| Rejection Approval Roles  | Fixed               | Receptionist/Supervisor/Admin only |
| Arrival Staff Logging     | Disabled            | Not tracked currently              |

---

## Future Enhancements (Backlog)

* 🔍 QR-code-based self check-in
* 🧠 AI-based service suggestion engine
* 🛠️ Garage-specific dynamic condition forms

---

## Use Case Flow

1. Customer arrives at garage.
2. Staff (Receptionist or Supervisor) selects the appointment and marks it as "Arrived".
3. System prompts for vehicle condition fields (optional) and requires photos (mandatory).
4. Add-on service suggestions are displayed.
5. Job intake form is generated and printed.
6. If the vehicle does not meet appointment criteria, staff can reject or request admin approval.
7. Customer is notified of service progress initiation.

---
