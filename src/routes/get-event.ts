import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma"
import { request } from "http";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-Zod'
import {z} from 'zod'
import { title } from "process";
import { defaultMaxListeners } from "events";


export async function getEvent(app: FastifyInstance){

    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId', {
        schema:{
            params: z.object({
                eventId: z.string().uuid(),
            }),
            response: {
                200:{
                    event: z.object({
                        id: z.string().uuid(), 
                        title: z.string(), 
                        details:  z.string().nullable(),
                        slug: z.string(),
                        maximumAttendees: z.number().int().nullable(), 
                        attendesAmount: z.number().int(), 

                    })
                }
            },
        }
    }, async (request, replay)=> {

        const{ eventId } = request.params

        const event =  await prisma.events.findUnique({
            select:{
                id: true,
                title: true,
                details: true,
                maximumAttendees: true,
                slug: true,
                _count:{
                    select:{
                        attendees: true
                    }
                }

            },
        
            where:{
                id: eventId,
            }
        })

        if(event === null){
            throw new Error('Event not find.')
        }

        return replay.send({event:{
            id: event.id,
            title: event.title,
            details: event.details,
            slug: event.slug,
            maximumAttendees: event.maximumAttendees,
            attendesAmount: event._count.attendees

        }
        })
    })
}