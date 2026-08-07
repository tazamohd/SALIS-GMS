/**
 * DI tokens (Phase E3). Typed identifiers for injectable dependencies, kept in
 * one place so providers and consumers agree on identity and type.
 */

import { token } from './container';
import type { EventBus } from '../events/event-bus';
import type { ICustomerRepository } from '../../modules/customers/repositories/customer.repository';
import type { CustomerService } from '../../modules/customers/services/customer.service';
import type { IVehicleRepository } from '../../modules/vehicles/repositories/vehicle.repository';
import type { VehicleService } from '../../modules/vehicles/services/vehicle.service';
import type { IAppointmentRepository } from '../../modules/appointments/repositories/appointment.repository';
import type { AppointmentService } from '../../modules/appointments/services/appointment.service';
import type { IGarageRepository } from '../../modules/garage/repositories/garage.repository';
import type { GarageService } from '../../modules/garage/services/garage.service';
import type { IJobCardRepository } from '../../modules/jobcards/repositories/jobcard.repository';
import type { JobCardService } from '../../modules/jobcards/services/jobcard.service';
import type { IEstimateRepository } from '../../modules/estimates/repositories/estimate.repository';
import type { EstimateService } from '../../modules/estimates/services/estimate.service';
import type { IInvoiceRepository } from '../../modules/invoices/repositories/invoice.repository';
import type { InvoiceService } from '../../modules/invoices/services/invoice.service';
import type { IPaymentRepository } from '../../modules/payments/repositories/payment.repository';
import type { PaymentService } from '../../modules/payments/services/payment.service';
import type { ISparePartRepository } from '../../modules/inventory/repositories/spare-part.repository';
import type { SparePartService } from '../../modules/inventory/services/spare-part.service';
import type { IInventoryDashboardRepository } from '../../modules/inventory/repositories/inventory-dashboard.repository';
import type { InventoryDashboardService } from '../../modules/inventory/services/inventory-dashboard.service';
import type { IStockAlertRepository } from '../../modules/inventory/repositories/stock-alert.repository';
import type { StockAlertService } from '../../modules/inventory/services/stock-alert.service';
import type { IInventoryAuditRepository } from '../../modules/inventory/repositories/inventory-audit.repository';
import type { InventoryAuditService } from '../../modules/inventory/services/inventory-audit.service';
import type { IInventoryTransferRepository } from '../../modules/inventory/repositories/inventory-transfer.repository';
import type { InventoryTransferService } from '../../modules/inventory/services/inventory-transfer.service';
import type { ISupplierRepository } from '../../modules/suppliers/repositories/supplier.repository';
import type { SupplierService } from '../../modules/suppliers/services/supplier.service';
import type { IPurchaseRepository } from '../../modules/procurement/repositories/purchase.repository';
import type { PurchaseService } from '../../modules/procurement/services/purchase.service';
import type { IDeliveryRepository } from '../../modules/procurement/repositories/delivery.repository';
import type { DeliveryService } from '../../modules/procurement/services/delivery.service';
import type { IReorderSettingRepository } from '../../modules/procurement/repositories/reorder-setting.repository';
import type { ReorderSettingService } from '../../modules/procurement/services/reorder-setting.service';
import type { IPricingHistoryRepository } from '../../modules/procurement/repositories/pricing-history.repository';
import type { PricingHistoryService } from '../../modules/procurement/services/pricing-history.service';
import type { ICrmRepository } from '../../modules/crm/repositories/crm.repository';
import type { CrmService } from '../../modules/crm/services/crm.service';
import type { IInsuranceRepository } from '../../modules/insurance/repositories/insurance.repository';
import type { InsuranceService } from '../../modules/insurance/services/insurance.service';
import type { IFleetRepository } from '../../modules/fleet/repositories/fleet.repository';
import type { FleetService } from '../../modules/fleet/services/fleet.service';
import type { IMarketplaceRepository } from '../../modules/marketplace/repositories/marketplace.repository';
import type { MarketplaceService } from '../../modules/marketplace/services/marketplace.service';
import type { IFleetManagementRepository } from '../../modules/fleet-management/repositories/fleet-management.repository';
import type { FleetManagementService } from '../../modules/fleet-management/services/fleet-management.service';

export const EVENT_BUS = token<EventBus>('EventBus');
export const CUSTOMER_REPOSITORY = token<ICustomerRepository>('CustomerRepository');
export const CUSTOMER_SERVICE = token<CustomerService>('CustomerService');
export const VEHICLE_REPOSITORY = token<IVehicleRepository>('VehicleRepository');
export const VEHICLE_SERVICE = token<VehicleService>('VehicleService');
export const APPOINTMENT_REPOSITORY = token<IAppointmentRepository>('AppointmentRepository');
export const APPOINTMENT_SERVICE = token<AppointmentService>('AppointmentService');
export const GARAGE_REPOSITORY = token<IGarageRepository>('GarageRepository');
export const GARAGE_SERVICE = token<GarageService>('GarageService');
export const JOBCARD_REPOSITORY = token<IJobCardRepository>('JobCardRepository');
export const JOBCARD_SERVICE = token<JobCardService>('JobCardService');
export const ESTIMATE_REPOSITORY = token<IEstimateRepository>('EstimateRepository');
export const ESTIMATE_SERVICE = token<EstimateService>('EstimateService');
export const INVOICE_REPOSITORY = token<IInvoiceRepository>('InvoiceRepository');
export const INVOICE_SERVICE = token<InvoiceService>('InvoiceService');
export const PAYMENT_REPOSITORY = token<IPaymentRepository>('PaymentRepository');
export const PAYMENT_SERVICE = token<PaymentService>('PaymentService');
export const SPARE_PART_REPOSITORY = token<ISparePartRepository>('SparePartRepository');
export const SPARE_PART_SERVICE = token<SparePartService>('SparePartService');
export const INVENTORY_DASHBOARD_REPOSITORY = token<IInventoryDashboardRepository>(
  'InventoryDashboardRepository',
);
export const INVENTORY_DASHBOARD_SERVICE = token<InventoryDashboardService>(
  'InventoryDashboardService',
);
export const STOCK_ALERT_REPOSITORY = token<IStockAlertRepository>('StockAlertRepository');
export const STOCK_ALERT_SERVICE = token<StockAlertService>('StockAlertService');
export const INVENTORY_AUDIT_REPOSITORY = token<IInventoryAuditRepository>('InventoryAuditRepository');
export const INVENTORY_AUDIT_SERVICE = token<InventoryAuditService>('InventoryAuditService');
export const INVENTORY_TRANSFER_REPOSITORY = token<IInventoryTransferRepository>(
  'InventoryTransferRepository',
);
export const INVENTORY_TRANSFER_SERVICE = token<InventoryTransferService>('InventoryTransferService');
export const SUPPLIER_REPOSITORY = token<ISupplierRepository>('SupplierRepository');
export const SUPPLIER_SERVICE = token<SupplierService>('SupplierService');
export const PURCHASE_REPOSITORY = token<IPurchaseRepository>('PurchaseRepository');
export const PURCHASE_SERVICE = token<PurchaseService>('PurchaseService');
export const DELIVERY_REPOSITORY = token<IDeliveryRepository>('DeliveryRepository');
export const DELIVERY_SERVICE = token<DeliveryService>('DeliveryService');
export const REORDER_SETTING_REPOSITORY = token<IReorderSettingRepository>('ReorderSettingRepository');
export const REORDER_SETTING_SERVICE = token<ReorderSettingService>('ReorderSettingService');
export const PRICING_HISTORY_REPOSITORY = token<IPricingHistoryRepository>('PricingHistoryRepository');
export const PRICING_HISTORY_SERVICE = token<PricingHistoryService>('PricingHistoryService');
export const CRM_REPOSITORY = token<ICrmRepository>('CrmRepository');
export const CRM_SERVICE = token<CrmService>('CrmService');
export const INSURANCE_REPOSITORY = token<IInsuranceRepository>('InsuranceRepository');
export const INSURANCE_SERVICE = token<InsuranceService>('InsuranceService');
export const FLEET_REPOSITORY = token<IFleetRepository>('FleetRepository');
export const FLEET_SERVICE = token<FleetService>('FleetService');
export const MARKETPLACE_REPOSITORY = token<IMarketplaceRepository>('MarketplaceRepository');
export const MARKETPLACE_SERVICE = token<MarketplaceService>('MarketplaceService');
export const FLEET_MANAGEMENT_REPOSITORY = token<IFleetManagementRepository>('FleetManagementRepository');
export const FLEET_MANAGEMENT_SERVICE = token<FleetManagementService>('FleetManagementService');
