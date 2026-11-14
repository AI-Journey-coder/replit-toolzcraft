import {sql} from 'drizzle-orm';
import {pgTable,text,integer,timestamp,boolean,uniqueIndex,check,index} from 'drizzle-orm/pg-core';
import {usersTable} from './users';
export const billingSubscriptionsTable=pgTable('billing_subscriptions',{
 id:text('id').primaryKey(),userId:integer('user_id').notNull().references(()=>usersTable.id,{onDelete:'cascade'}),
 providerId:text('provider_id').unique(),planId:text('plan_id').notNull(),mode:text('mode').notNull(),status:text('status').notNull().default('creating'),cancelRequested:boolean('cancel_requested').notNull().default(false),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[uniqueIndex('billing_one_open_subscription').on(t.userId,t.mode).where(sql`${t.status} NOT IN ('cancelled','completed','expired')`),check('billing_mode',sql`${t.mode} IN ('test','live')`)]);
export const billingPeriodsTable=pgTable('billing_periods',{
 paymentId:text('payment_id').primaryKey(),subscriptionId:text('subscription_id').notNull().references(()=>billingSubscriptionsTable.id),userId:integer('user_id').notNull().references(()=>usersTable.id,{onDelete:'cascade'}),periodStart:timestamp('period_start',{withTimezone:true}).notNull(),periodEnd:timestamp('period_end',{withTimezone:true}).notNull(),used:integer('used').notNull().default(0),revoked:boolean('revoked').notNull().default(false),
},t=>[uniqueIndex('billing_period_cycle').on(t.subscriptionId,t.periodStart),index('billing_period_user').on(t.userId,t.periodEnd),check('billing_period_dates',sql`${t.periodEnd}>${t.periodStart}`),check('billing_credit_limit',sql`${t.used} BETWEEN 0 AND 100`)]);
export const aiCreditReservationsTable=pgTable('ai_credit_reservations',{
 id:text('id').primaryKey(),userId:integer('user_id').notNull().references(()=>usersTable.id,{onDelete:'cascade'}),paymentId:text('payment_id').references(()=>billingPeriodsTable.paymentId),state:text('state').notNull().default('reserved'),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[check('ai_credit_state',sql`${t.state} IN ('reserved','completed','released')`)]);
export const billingRevocationsTable=pgTable('billing_revocations',{paymentId:text('payment_id').primaryKey(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()});
