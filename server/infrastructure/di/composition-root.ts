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

  container = c;
  return c;
}

/** Reset the container (test isolation). */
export function resetAppContainer(): void {
  container = undefined;
}
