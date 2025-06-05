import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import {
    validatorCompiler,
    serializerCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { channels } from '../broker/channels/index.ts'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { randomUUID } from 'node:crypto'


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

        console.log("oq eu fiz de errado ", amount)

        channels.orders.sendToQueue('orders', Buffer.from(JSON.stringify(amount)))

        await db.insert(schema.orders).values({
            id: randomUUID(),
            amount,
            customerId: '1'
        })

        return reply.status(201).send()
    }
)

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
    console.log("[ORDERS] HTTP server running!")
})