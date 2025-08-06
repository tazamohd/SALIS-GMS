# Tools Management Module

## Purpose

To enable garages and SaaS administrators to manage tools inventory, types, compatibility with services, and tool availability across branches. Tools may be required in specific service steps and optionally tracked per garage.

---

## Entities

### Tool

| Field              | Type         | Description                              |
| ------------------ | ------------ | ---------------------------------------- |
| Id                 | uuid         | Unique identifier                        |
| Name               | string       | Tool name                                |
| Description        | text         | Optional description                     |
| ToolType           | enum         | e.g., Diagnostic, Mechanical, Electrical |
| Brand              | string       | Brand name                               |
| Manufacturer       | string       | Manufacturer info                        |
| Tags               | list<string> | Optional tags                            |
| CompatibleVehicles | list<string> | Vehicle models supported                 |
| LinkedServiceIds   | list<uuid>   | Services this tool supports              |
| LinkedPartIds      | list<uuid>   | Optional part links                      |
| Media              | list<string> | Images, videos, manuals                  |
| Documents          | list<string> | Warranties, certifications               |
| IsGlobal           | boolean      | Shared globally or local only            |
| Visibility         | enum         | Public, Private, Shared                  |
| EditableBy         | enum         | SaaSAdmin, GarageAdmin                   |
| CreatedBy          | UserRef      | Creator info                             |
| IsActive           | boolean      | Deactivation flag                        |
| CreatedAt          | datetime     | Timestamp                                |

---

### ToolAvailability

| Field               | Type    | Description                        |
| ------------------- | ------- | ---------------------------------- |
| Id                  | uuid    | Unique ID                          |
| ToolId              | uuid    | Tool reference                     |
| GarageId            | uuid    | Owning garage                      |
| BranchId            | uuid?   | Optional branch reference          |
| Quantity            | int     | Quantity available                 |
| Status              | enum    | Available, InUse, UnderMaintenance |
| AllowOverrideFields | boolean | Garage-level customization         |
| IsEnabled           | boolean | Flag for use                       |

---

## Key Features

* 🧰 Full metadata for tool definitions
* 🔧 Tool-to-service and tool-to-part linkage
* 🌐 Global vs local visibility
* 📍 Availability tracking by garage/branch
* 🧪 Tagging and documentation support
* 🧑‍🔧 Access control by creator or admin scope

---

## Use Cases

1. **SaaS Admin defines a global tool** (e.g., Torque Wrench)
2. **Garage imports and sets local quantity** and availability status
3. **Tool is linked to service templates** that require it
4. **Availability changes** based on job card assignment
5. **Tools under maintenance** marked unavailable temporarily
6. **Garage adds extra media/manuals** to help technicians

---

## ERD (Entity Relationship Diagram)

```dbml
Table Tools {
  Id uuid [pk]
  Name varchar
  Description text
  ToolType varchar
  Brand varchar
  Manufacturer varchar
  Tags text
  CompatibleVehicles text
  LinkedServiceIds text
  LinkedPartIds text
  Media text
  Documents text
  IsGlobal boolean
  Visibility varchar
  EditableBy varchar
  CreatedBy uuid
  IsActive boolean
  CreatedAt datetime
}

Table ToolAvailabilities {
  Id uuid [pk]
  ToolId uuid [ref: > Tools.Id]
  GarageId uuid
  BranchId uuid
  Quantity int
  Status varchar
  AllowOverrideFields boolean
  IsEnabled boolean
}
```

---

## To Be Added Later

* Tool maintenance history
* Assignment & return logs
* QR code and scanning support
