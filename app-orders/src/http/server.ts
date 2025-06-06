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
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'


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
        const { amount } = request.body

        const orderId = randomUUID()
        await db.insert(schema.orders).values({
            id: orderId,
            amount,
            customerId: 'bc26e22f-2e7b-487b-b826-812cbd244b80'
        })

        dispatchOrderCreated({
            amount,
            orderId,
            customer:{
                id: 'bc26e22f-2e7b-487b-b826-812cbd244b80'
            }
        })

        return reply.status(201).send({
            status: true,
            msg: 'Order has created with successfully'
        })
    }
)

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
    console.log("[ORDERS] HTTP server running!")
})