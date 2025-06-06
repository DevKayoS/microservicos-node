import { date, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";


export const customers = pgTable("customers", {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    address: text().notNull(),
    state: text().notNull(),
    zipcode: text().notNull(),
    country: text().notNull(),
    dateOfBirth: date({ mode: 'date' }),
})