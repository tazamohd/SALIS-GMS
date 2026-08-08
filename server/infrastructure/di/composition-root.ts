/**
 * Composition root (Phase E3 — Dependency Injection).
 *
 * The single place where concrete implementations are wired into the container.
 * Everything else depends on abstractions and resolves from here. Building the
 * graph in one location keeps construction out of business code and makes the
 * dependency structure auditable.
 */

import { Container } from './container';
import {
  EVENT_BUS,
  CUSTOMER_REPOSITORY,
  CUSTOMER_SERVICE,
  VEHICLE_REPOSITORY,
  VEHICLE_SERVICE,
  APPOINTMENT_REPOSITORY,
  APPOINTMENT_SERVICE,
  GARAGE_REPOSITORY,
  GARAGE_SERVICE,
  JOBCARD_REPOSITORY,
  JOBCARD_SERVICE,
  ESTIMATE_REPOSITORY,
  ESTIMATE_SERVICE,
  INVOICE_REPOSITORY,
  INVOICE_SERVICE,
  PAYMENT_REPOSITORY,
  PAYMENT_SERVICE,
  SPARE_PART_REPOSITORY,
  SPARE_PART_SERVICE,
  INVENTORY_DASHBOARD_REPOSITORY,
  INVENTORY_DASHBOARD_SERVICE,
  STOCK_ALERT_REPOSITORY,
  STOCK_ALERT_SERVICE,
  INVENTORY_AUDIT_REPOSITORY,
  INVENTORY_AUDIT_SERVICE,
  INVENTORY_TRANSFER_REPOSITORY,
  INVENTORY_TRANSFER_SERVICE,
  SUPPLIER_REPOSITORY,
  SUPPLIER_SERVICE,
  PURCHASE_REPOSITORY,
  PURCHASE_SERVICE,
  DELIVERY_REPOSITORY,
  DELIVERY_SERVICE,
  REORDER_SETTING_REPOSITORY,
  REORDER_SETTING_SERVICE,
  PRICING_HISTORY_REPOSITORY,
  PRICING_HISTORY_SERVICE,
  CRM_REPOSITORY,
  CRM_SERVICE,
  INSURANCE_REPOSITORY,
  INSURANCE_SERVICE,
  FLEET_REPOSITORY,
  FLEET_SERVICE,
  MARKETPLACE_REPOSITORY,
  MARKETPLACE_SERVICE,
  MARKETPLACE_WRITES_REPOSITORY,
  MARKETPLACE_WRITES_SERVICE,
  PROVIDER_REPOSITORY,
  PROVIDER_SERVICE,
  ADMINISTRATION_REPOSITORY,
  ADMINISTRATION_SERVICE,
  LICENSING_REPOSITORY,
  LICENSING_SERVICE,
  FLEET_MANAGEMENT_REPOSITORY,
  FLEET_MANAGEMENT_SERVICE,
  FLEET_TRACKING_REPOSITORY,
  FLEET_TRACKING_SERVICE,
  HR_REPOSITORY,
  HR_SERVICE,
  REPORTS_REPOSITORY,
  REPORTS_SERVICE,
  ANALYTICS_REPOSITORY,
  ANALYTICS_SERVICE,
  AI_REPOSITORY,
  AI_SERVICE,
  AI_JOB_ESTIMATION_REPOSITORY,
  AI_JOB_ESTIMATION_SERVICE,
  AI_MAINTENANCE_PREDICTION_REPOSITORY,
  AI_MAINTENANCE_PREDICTION_SERVICE,
  AI_PARTS_RECOMMENDATION_REPOSITORY,
  AI_PARTS_RECOMMENDATION_SERVICE,
  AI_SCHEDULE_OPTIMIZATION_REPOSITORY,
  AI_SCHEDULE_OPTIMIZATION_SERVICE,
  AI_CHAT_REPOSITORY,
  AI_CHAT_SERVICE,
  AI_OCR_DOCUMENT_REPOSITORY,
  AI_OCR_DOCUMENT_SERVICE,
  FEATURE_FLAG_REPOSITORY,
  FEATURE_FLAG_SERVICE,
  BACKUP_REPOSITORY,
  BACKUP_SERVICE,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_SERVICE,
} from './tokens';
import { EventBus, type DeadLetter } from '../events/event-bus';
import { CustomerRepository } from '../../modules/customers/repositories/customer.repository';
import { CustomerService } from '../../modules/customers/services/customer.service';
import { registerCustomerEventHandlers } from '../../modules/customers/events/customer.handlers';
import { VehicleRepository } from '../../modules/vehicles/repositories/vehicle.repository';
import { VehicleService } from '../../modules/vehicles/services/vehicle.service';
import { AppointmentRepository } from '../../modules/appointments/repositories/appointment.repository';
import { AppointmentService } from '../../modules/appointments/services/appointment.service';
import { GarageRepository } from '../../modules/garage/repositories/garage.repository';
import { GarageService } from '../../modules/garage/services/garage.service';
import { JobCardRepository } from '../../modules/jobcards/repositories/jobcard.repository';
import { JobCardService } from '../../modules/jobcards/services/jobcard.service';
import { EstimateRepository } from '../../modules/estimates/repositories/estimate.repository';
import { EstimateService } from '../../modules/estimates/services/estimate.service';
import { registerEstimateEventHandlers } from '../../modules/estimates/events/estimate.handlers';
import { InvoiceRepository } from '../../modules/invoices/repositories/invoice.repository';
import { InvoiceService } from '../../modules/invoices/services/invoice.service';
import { registerInvoiceEventHandlers } from '../../modules/invoices/events/invoice.handlers';
import { PaymentRepository } from '../../modules/payments/repositories/payment.repository';
import { PaymentService } from '../../modules/payments/services/payment.service';
import { registerPaymentEventHandlers } from '../../modules/payments/events/payment.handlers';
import { SparePartRepository } from '../../modules/inventory/repositories/spare-part.repository';
import { SparePartService } from '../../modules/inventory/services/spare-part.service';
import { InventoryDashboardRepository } from '../../modules/inventory/repositories/inventory-dashboard.repository';
import { InventoryDashboardService } from '../../modules/inventory/services/inventory-dashboard.service';
import { StockAlertRepository } from '../../modules/inventory/repositories/stock-alert.repository';
import { StockAlertService } from '../../modules/inventory/services/stock-alert.service';
import { InventoryAuditRepository } from '../../modules/inventory/repositories/inventory-audit.repository';
import { InventoryAuditService } from '../../modules/inventory/services/inventory-audit.service';
import { InventoryTransferRepository } from '../../modules/inventory/repositories/inventory-transfer.repository';
import { InventoryTransferService } from '../../modules/inventory/services/inventory-transfer.service';
import { SupplierRepository } from '../../modules/suppliers/repositories/supplier.repository';
import { SupplierService } from '../../modules/suppliers/services/supplier.service';
import { PurchaseRepository } from '../../modules/procurement/repositories/purchase.repository';
import { PurchaseService } from '../../modules/procurement/services/purchase.service';
import { DeliveryRepository } from '../../modules/procurement/repositories/delivery.repository';
import { DeliveryService } from '../../modules/procurement/services/delivery.service';
import { ReorderSettingRepository } from '../../modules/procurement/repositories/reorder-setting.repository';
import { ReorderSettingService } from '../../modules/procurement/services/reorder-setting.service';
import { PricingHistoryRepository } from '../../modules/procurement/repositories/pricing-history.repository';
import { PricingHistoryService } from '../../modules/procurement/services/pricing-history.service';
import { CrmRepository } from '../../modules/crm/repositories/crm.repository';
import { CrmService } from '../../modules/crm/services/crm.service';
import { InsuranceRepository } from '../../modules/insurance/repositories/insurance.repository';
import { InsuranceService } from '../../modules/insurance/services/insurance.service';
import { FleetRepository } from '../../modules/fleet/repositories/fleet.repository';
import { FleetService } from '../../modules/fleet/services/fleet.service';
import { MarketplaceRepository } from '../../modules/marketplace/repositories/marketplace.repository';
import { MarketplaceService } from '../../modules/marketplace/services/marketplace.service';
import { MarketplaceWritesRepository } from '../../modules/marketplace/repositories/marketplace-writes.repository';
import { MarketplaceWritesService } from '../../modules/marketplace/services/marketplace-writes.service';
import { ProviderRepository } from '../../modules/provider/repositories/provider.repository';
import { ProviderService } from '../../modules/provider/services/provider.service';
import { AdministrationRepository } from '../../modules/administration/repositories/administration.repository';
import { AdministrationService } from '../../modules/administration/services/administration.service';
import { LicensingRepository } from '../../modules/licensing/repositories/licensing.repository';
import { LicensingService } from '../../modules/licensing/services/licensing.service';
import { FleetManagementRepository } from '../../modules/fleet-management/repositories/fleet-management.repository';
import { FleetManagementService } from '../../modules/fleet-management/services/fleet-management.service';
import { FleetTrackingRepository } from '../../modules/fleet-tracking/repositories/fleet-tracking.repository';
import { FleetTrackingService } from '../../modules/fleet-tracking/services/fleet-tracking.service';
import { HrRepository } from '../../modules/hr/repositories/hr.repository';
import { HrService } from '../../modules/hr/services/hr.service';
import { ReportsRepository } from '../../modules/reports/repositories/reports.repository';
import { ReportsService } from '../../modules/reports/services/reports.service';
import { AnalyticsRepository } from '../../modules/analytics/repositories/analytics.repository';
import { AnalyticsService } from '../../modules/analytics/services/analytics.service';
import { AiRepository } from '../../modules/ai/repositories/ai.repository';
import { AiService } from '../../modules/ai/services/ai.service';
import { AiJobEstimationRepository } from '../../modules/ai/repositories/ai-job-estimation.repository';
import { AiJobEstimationService } from '../../modules/ai/services/ai-job-estimation.service';
import { AiMaintenancePredictionRepository } from '../../modules/ai/repositories/ai-maintenance-prediction.repository';
import { AiMaintenancePredictionService } from '../../modules/ai/services/ai-maintenance-prediction.service';
import { AiPartsRecommendationRepository } from '../../modules/ai/repositories/ai-parts-recommendation.repository';
import { AiPartsRecommendationService } from '../../modules/ai/services/ai-parts-recommendation.service';
import { AiScheduleOptimizationRepository } from '../../modules/ai/repositories/ai-schedule-optimization.repository';
import { AiScheduleOptimizationService } from '../../modules/ai/services/ai-schedule-optimization.service';
import { AiChatRepository } from '../../modules/ai/repositories/ai-chat.repository';
import { AiChatService } from '../../modules/ai/services/ai-chat.service';
import { AiOcrDocumentRepository } from '../../modules/ai/repositories/ai-ocr-document.repository';
import { AiOcrDocumentService } from '../../modules/ai/services/ai-ocr-document.service';
import { FeatureFlagRepository } from '../../modules/platform/repositories/feature-flag.repository';
import { FeatureFlagService } from '../../modules/platform/services/feature-flag.service';
import { BackupRepository } from '../../modules/platform/repositories/backup.repository';
import { BackupService } from '../../modules/platform/services/backup.service';
import { SubscriptionRepository } from '../../modules/subscriptions/repositories/subscription.repository';
import { SubscriptionService } from '../../modules/subscriptions/services/subscription.service';

function buildEventBus(): EventBus {
  return new EventBus({
    logger: (level, message, context) => {
      if (level === 'error' || level === 'warn') {
        console[level](`[events] ${message}`, context ?? '');
      }
    },
    onDeadLetter: (dl: DeadLetter) => {
      console.error('[events] dead-letter', {
        type: dl.event.type,
        handler: dl.handler,
        attempts: dl.attempts,
      });
    },
  });
}

let container: Container | undefined;

/** Build (once) and return the application container. */
export function getAppContainer(): Container {
  if (container) return container;

  const c = new Container();

  c.register(EVENT_BUS, () => {
    const bus = buildEventBus();
    // Register module event subscribers against the shared bus.
    registerCustomerEventHandlers(bus);
    registerEstimateEventHandlers(bus);
    registerInvoiceEventHandlers(bus);
    registerPaymentEventHandlers(bus);
    return bus;
  });

  c.register(CUSTOMER_REPOSITORY, () => new CustomerRepository());

  c.register(
    CUSTOMER_SERVICE,
    (ctx) => new CustomerService(ctx.resolve(CUSTOMER_REPOSITORY), ctx.resolve(EVENT_BUS)),
  );

  c.register(VEHICLE_REPOSITORY, () => new VehicleRepository());
  c.register(VEHICLE_SERVICE, (ctx) => new VehicleService(ctx.resolve(VEHICLE_REPOSITORY)));

  c.register(APPOINTMENT_REPOSITORY, () => new AppointmentRepository());
  c.register(
    APPOINTMENT_SERVICE,
    (ctx) => new AppointmentService(ctx.resolve(APPOINTMENT_REPOSITORY)),
  );

  c.register(GARAGE_REPOSITORY, () => new GarageRepository());
  c.register(GARAGE_SERVICE, (ctx) => new GarageService(ctx.resolve(GARAGE_REPOSITORY)));

  c.register(JOBCARD_REPOSITORY, () => new JobCardRepository());
  c.register(JOBCARD_SERVICE, (ctx) => new JobCardService(ctx.resolve(JOBCARD_REPOSITORY)));

  c.register(ESTIMATE_REPOSITORY, () => new EstimateRepository());
  c.register(
    ESTIMATE_SERVICE,
    (ctx) => new EstimateService(ctx.resolve(ESTIMATE_REPOSITORY), ctx.resolve(EVENT_BUS)),
  );

  c.register(INVOICE_REPOSITORY, () => new InvoiceRepository());
  c.register(
    INVOICE_SERVICE,
    (ctx) => new InvoiceService(ctx.resolve(INVOICE_REPOSITORY), ctx.resolve(EVENT_BUS)),
  );

  c.register(PAYMENT_REPOSITORY, () => new PaymentRepository());
  c.register(
    PAYMENT_SERVICE,
    (ctx) => new PaymentService(ctx.resolve(PAYMENT_REPOSITORY), ctx.resolve(EVENT_BUS)),
  );

  c.register(SPARE_PART_REPOSITORY, () => new SparePartRepository());
  c.register(SPARE_PART_SERVICE, (ctx) => new SparePartService(ctx.resolve(SPARE_PART_REPOSITORY)));

  c.register(INVENTORY_DASHBOARD_REPOSITORY, () => new InventoryDashboardRepository());
  c.register(
    INVENTORY_DASHBOARD_SERVICE,
    (ctx) => new InventoryDashboardService(ctx.resolve(INVENTORY_DASHBOARD_REPOSITORY)),
  );

  c.register(STOCK_ALERT_REPOSITORY, () => new StockAlertRepository());
  c.register(STOCK_ALERT_SERVICE, (ctx) => new StockAlertService(ctx.resolve(STOCK_ALERT_REPOSITORY)));

  c.register(INVENTORY_AUDIT_REPOSITORY, () => new InventoryAuditRepository());
  c.register(
    INVENTORY_AUDIT_SERVICE,
    (ctx) => new InventoryAuditService(ctx.resolve(INVENTORY_AUDIT_REPOSITORY)),
  );

  c.register(INVENTORY_TRANSFER_REPOSITORY, () => new InventoryTransferRepository());
  c.register(
    INVENTORY_TRANSFER_SERVICE,
    (ctx) => new InventoryTransferService(ctx.resolve(INVENTORY_TRANSFER_REPOSITORY)),
  );

  c.register(SUPPLIER_REPOSITORY, () => new SupplierRepository());
  c.register(SUPPLIER_SERVICE, (ctx) => new SupplierService(ctx.resolve(SUPPLIER_REPOSITORY)));

  c.register(PURCHASE_REPOSITORY, () => new PurchaseRepository());
  c.register(PURCHASE_SERVICE, (ctx) => new PurchaseService(ctx.resolve(PURCHASE_REPOSITORY)));

  c.register(DELIVERY_REPOSITORY, () => new DeliveryRepository());
  c.register(DELIVERY_SERVICE, (ctx) => new DeliveryService(ctx.resolve(DELIVERY_REPOSITORY)));

  c.register(REORDER_SETTING_REPOSITORY, () => new ReorderSettingRepository());
  c.register(
    REORDER_SETTING_SERVICE,
    (ctx) => new ReorderSettingService(ctx.resolve(REORDER_SETTING_REPOSITORY)),
  );

  c.register(PRICING_HISTORY_REPOSITORY, () => new PricingHistoryRepository());
  c.register(
    PRICING_HISTORY_SERVICE,
    (ctx) => new PricingHistoryService(ctx.resolve(PRICING_HISTORY_REPOSITORY)),
  );

  c.register(CRM_REPOSITORY, () => new CrmRepository());
  c.register(CRM_SERVICE, (ctx) => new CrmService(ctx.resolve(CRM_REPOSITORY)));

  c.register(INSURANCE_REPOSITORY, () => new InsuranceRepository());
  c.register(INSURANCE_SERVICE, (ctx) => new InsuranceService(ctx.resolve(INSURANCE_REPOSITORY)));

  c.register(FLEET_REPOSITORY, () => new FleetRepository());
  c.register(FLEET_SERVICE, (ctx) => new FleetService(ctx.resolve(FLEET_REPOSITORY)));

  c.register(MARKETPLACE_REPOSITORY, () => new MarketplaceRepository());
  c.register(
    MARKETPLACE_SERVICE,
    (ctx) => new MarketplaceService(ctx.resolve(MARKETPLACE_REPOSITORY)),
  );

  c.register(MARKETPLACE_WRITES_REPOSITORY, () => new MarketplaceWritesRepository());
  c.register(
    MARKETPLACE_WRITES_SERVICE,
    (ctx) => new MarketplaceWritesService(ctx.resolve(MARKETPLACE_WRITES_REPOSITORY)),
  );

  c.register(PROVIDER_REPOSITORY, () => new ProviderRepository());
  c.register(PROVIDER_SERVICE, (ctx) => new ProviderService(ctx.resolve(PROVIDER_REPOSITORY)));

  c.register(ADMINISTRATION_REPOSITORY, () => new AdministrationRepository());
  c.register(
    ADMINISTRATION_SERVICE,
    (ctx) => new AdministrationService(ctx.resolve(ADMINISTRATION_REPOSITORY)),
  );

  c.register(LICENSING_REPOSITORY, () => new LicensingRepository());
  c.register(LICENSING_SERVICE, (ctx) => new LicensingService(ctx.resolve(LICENSING_REPOSITORY)));

  c.register(FLEET_MANAGEMENT_REPOSITORY, () => new FleetManagementRepository());
  c.register(
    FLEET_MANAGEMENT_SERVICE,
    (ctx) => new FleetManagementService(ctx.resolve(FLEET_MANAGEMENT_REPOSITORY)),
  );

  c.register(FLEET_TRACKING_REPOSITORY, () => new FleetTrackingRepository());
  c.register(
    FLEET_TRACKING_SERVICE,
    (ctx) => new FleetTrackingService(ctx.resolve(FLEET_TRACKING_REPOSITORY)),
  );

  c.register(HR_REPOSITORY, () => new HrRepository());
  c.register(HR_SERVICE, (ctx) => new HrService(ctx.resolve(HR_REPOSITORY)));

  c.register(REPORTS_REPOSITORY, () => new ReportsRepository());
  c.register(REPORTS_SERVICE, (ctx) => new ReportsService(ctx.resolve(REPORTS_REPOSITORY)));

  c.register(ANALYTICS_REPOSITORY, () => new AnalyticsRepository());
  c.register(ANALYTICS_SERVICE, (ctx) => new AnalyticsService(ctx.resolve(ANALYTICS_REPOSITORY)));

  c.register(AI_REPOSITORY, () => new AiRepository());
  c.register(AI_SERVICE, (ctx) => new AiService(ctx.resolve(AI_REPOSITORY)));

  c.register(AI_JOB_ESTIMATION_REPOSITORY, () => new AiJobEstimationRepository());
  c.register(AI_JOB_ESTIMATION_SERVICE, (ctx) => new AiJobEstimationService(ctx.resolve(AI_JOB_ESTIMATION_REPOSITORY)));

  c.register(AI_MAINTENANCE_PREDICTION_REPOSITORY, () => new AiMaintenancePredictionRepository());
  c.register(AI_MAINTENANCE_PREDICTION_SERVICE, (ctx) => new AiMaintenancePredictionService(ctx.resolve(AI_MAINTENANCE_PREDICTION_REPOSITORY)));

  c.register(AI_PARTS_RECOMMENDATION_REPOSITORY, () => new AiPartsRecommendationRepository());
  c.register(AI_PARTS_RECOMMENDATION_SERVICE, (ctx) => new AiPartsRecommendationService(ctx.resolve(AI_PARTS_RECOMMENDATION_REPOSITORY)));

  c.register(AI_SCHEDULE_OPTIMIZATION_REPOSITORY, () => new AiScheduleOptimizationRepository());
  c.register(AI_SCHEDULE_OPTIMIZATION_SERVICE, (ctx) => new AiScheduleOptimizationService(ctx.resolve(AI_SCHEDULE_OPTIMIZATION_REPOSITORY)));

  c.register(AI_CHAT_REPOSITORY, () => new AiChatRepository());
  c.register(AI_CHAT_SERVICE, (ctx) => new AiChatService(ctx.resolve(AI_CHAT_REPOSITORY)));

  c.register(AI_OCR_DOCUMENT_REPOSITORY, () => new AiOcrDocumentRepository());
  c.register(AI_OCR_DOCUMENT_SERVICE, (ctx) => new AiOcrDocumentService(ctx.resolve(AI_OCR_DOCUMENT_REPOSITORY)));

  c.register(FEATURE_FLAG_REPOSITORY, () => new FeatureFlagRepository());
  c.register(FEATURE_FLAG_SERVICE, (ctx) => new FeatureFlagService(ctx.resolve(FEATURE_FLAG_REPOSITORY)));

  c.register(BACKUP_REPOSITORY, () => new BackupRepository());
  c.register(BACKUP_SERVICE, (ctx) => new BackupService(ctx.resolve(BACKUP_REPOSITORY)));

  c.register(SUBSCRIPTION_REPOSITORY, () => new SubscriptionRepository());
  c.register(SUBSCRIPTION_SERVICE, (ctx) => new SubscriptionService(ctx.resolve(SUBSCRIPTION_REPOSITORY)));

  container = c;
  return c;
}

/** Reset the container (test isolation). */
export function resetAppContainer(): void {
  container = undefined;
}
