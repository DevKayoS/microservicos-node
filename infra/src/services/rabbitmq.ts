import * as awsx from "@pulumi/awsx";
import { cluster } from '../cluster'

export const rabbitMQService = new awsx.classic.ecs.FargateService('fargate-rabbitmq', {
    cluster,
    desiredCount: 1, // minimo de instancias rodando
    waitForSteadyState: false,
    taskDefinitionArgs: {
        container: {
            image: 'rabbitmq:3-management',
            cpu: 256,
            memory: 512,
            environment: [
                { name: 'RABBITMQ_DEFAULT_USER', value: 'admin' },
                { name: 'RABBITMQ_DEFAULT_PASS', value: 'admin' }

            ]
        }
    }
})