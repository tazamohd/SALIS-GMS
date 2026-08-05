/**
 * Per-garage sequential document numbering (D3, ZATCA-friendly): consecutive
 * invoices in one garage get consecutive sequence numbers; another garage has
 * its own independent sequence; concurrent claims never collide.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { storage } from "../storage";

let garageA = "";
let garageB = "";
let userId = "";
let customerId = "";
const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  await createTestApp();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    garageA = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('SeqA','SA','Riyadh',true) RETURNING id`)).rows[0].id;
    garageB = (await client.query(`INSERT INTO garages (name,country,city,is_active) VALUES ('SeqB','SA','Jeddah',true) RETURNING id`)).rows[0].id;
    userId = (await client.query(`INSERT INTO users (email,password,full_name,role) VALUES ($1,'x','Seq User','ADMIN') RETURNING id`, [`seq-${uniq()}@t.sa`])).rows[0].id;
    customerId = (await client.query(`INSERT INTO users (email,password,full_name,role,user_type) VALUES ($1,'x','Seq Cust','CUSTOMER','customer') RETURNING id`, [`seqc-${uniq()}@t.sa`])).rows[0].id;
  } finally {
    await client.end();
  }
});

const invoiceData = (garageId: string) => ({
  garageId, customerId, invoiceDate: new Date(), dueDate: new Date(), status: "unpaid",
  subtotal: "10.00", taxAmount: "0.00", discountAmount: "0.00",
  totalAmount: "10.00", paidAmount: "0.00", balanceAmount: "10.00", createdBy: userId,
});

describe("doc sequences", () => {
  it("issues consecutive per-garage numbers, independent across garages", async () => {
    const a1 = await storage.createInvoice(invoiceData(garageA) as any);
    const a2 = await storage.createInvoice(invoiceData(garageA) as any);
    const b1 = await storage.createInvoice(invoiceData(garageB) as any);

    const seq = (n: string) => parseInt(n.split("-").pop()!, 10);
    const disc = (n: string) => n.split("-")[1];

    expect(a1.invoiceNumber).toMatch(/^INV-[0-9A-F]{8}-\d{6}$/);
    expect(seq(a2.invoiceNumber)).toBe(seq(a1.invoiceNumber) + 1);
    // Garage B starts its own sequence with a different discriminator.
    expect(disc(b1.invoiceNumber)).not.toBe(disc(a1.invoiceNumber));
    expect(seq(b1.invoiceNumber)).toBe(1);
  });

  it("never collides under concurrent claims", async () => {
    const claims = await Promise.all(
      Array.from({ length: 10 }, () => storage.nextDocNumber(garageA, "stress")),
    );
    expect(new Set(claims).size).toBe(10); // all distinct
  });
});
