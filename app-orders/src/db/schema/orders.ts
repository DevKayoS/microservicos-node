import { integer } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const ordersStatusEnum = pgEnum("order_status", [
    'pending',
    'paid',
    'canceled'
])

export const orders = pgTable("orders", {
    id: text().primaryKey(),
    customerId: text().notNull(),
    amount: integer().notNull(),
    status: ordersStatusEnum().notNull().default('pending'),
    createdAt: timestamp().defaultNow().notNull(),
})