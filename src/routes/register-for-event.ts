import fastify, { FastifyInstance } from "fastify"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-Zod'
import { request } from "http"
import {z} from 'zod'
import { prisma } from "../lib/prisma"
import { error } from "console"

export async function registerForEvent(app:FastifyInstance){
    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees',{
            schema:{
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email(),


                }),
                params: z.object({
                            eventId: z.string().uuid(),

                        }),
                response:{
                    201: z.object({
                        attendeeId: z.number(),
                    })
                }
            }
        }, async  (request, reply)=>{
             const {eventId} = request.params
             
             const{name, email}= request.body

             const attendeeFromEmail = await prisma.attendee.findUnique({
                where: {
                    eventId_email: {
                        email,
                        eventId
                    }
                }
             }) 
             if(attendeeFromEmail !==null){
                throw new Error('This e-mail is alredy registered for this event.')
             }

             const [event,amountOfAttendeesForEvent] =  await Promise.all([
                    prisma.events.findUnique({
                        where:{
                            id : eventId
                        }
                     }),

                     prisma.attendee.count({
                        where:{
                            eventId,
                        }
                     })
                ])
     
             if(event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees){
                throw new Error('The maximum number of attendees for this event has been reached.')
             }

             const attendee = await prisma.attendee.create({
                data: {
                    name,
                    email,
                    eventId,
                }
             })

             return reply.status(201).send({attendeeId: attendee.id})
        })

}