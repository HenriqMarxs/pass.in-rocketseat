import fastify, { FastifyInstance } from "fastify"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-Zod'
import {z} from 'zod'
import {prisma} from "../lib/prisma";
import { generateSlug } from "../utils/generate-slug";


export async function createEvent(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/events', {
    schema:{

            body:
                z.object({
                title : z.string().min(4),
                details: z.string().nullable(),
                maximumAttendees: z.number().int().positive().nullable(),
        }),
        response :{
            201 : z.object ({
                eventId: z.string().uuid(),
            })
        }
    },
        

}, async (request, reply)=>{ 
    const {
        title,
        details,
        maximumAttendees
     } = request.body

    const slug = generateSlug(title)

    const eventWithSameSlug = await prisma.events.findUnique({
        where: {
            slug,
        }
    })

    if(eventWithSameSlug !== null){
        throw new Error('Another event with same title alredy exists.')
    }

    const event =  await prisma.events.create({
            data:{

                title,
                details,
                maximumAttendees,
                slug,
            },
            
        })

    // return{eventId: event.id}
    return reply.status(201).send({eventId: event.id})

})
}


