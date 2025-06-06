import { timestamp } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";


export const invoices = pgTable("invoices", {
    id: text().primaryKey(),
    orderId: text().notNull(),
    // amount: integer().notNull(),     
    createdAt: timestamp().defaultNow().notNull(),
})