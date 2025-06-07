import '@opentelemetry/auto-instrumentations-node/register'
import { trace } from '@opentelemetry/api'

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import {
    validatorCompiler,
    serializerCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'
import { tracer } from '../tracer/tracer.ts'


const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
    return 'ok'
})


app.post('/orders', {
    schema: {
        body: z.object({
            amount: z.number()
        })
    }
    }, async (request, reply) => {
        const span = tracer.startSpan('Request Order')

        const { amount } = request.body

        const orderId = randomUUID()
        await db.insert(schema.orders).values({
            id: orderId,
            amount,
            customerId: 'bc26e22f-2e7b-487b-b826-812cbd244b80'
        })

       span.setAttribute('order', JSON.stringify({
            order_id: orderId.toString(),
            amount,
            customerId: 'bc26e22f-2e7b-487b-b826-812cbd244b80'
        }))

        span.setAttribute('Channel', 'send to orders channel')

        dispatchOrderCreated({
            amount,
            orderId,
            customer:{
                id: 'bc26e22f-2e7b-487b-b826-812cbd244b80'
            }
        })

        span.end()

        return reply.status(201).send({
            status: true,
            msg: 'Order has created with successfully'
        })
    }
)

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
    console.log("[ORDERS] HTTP server running!")
})