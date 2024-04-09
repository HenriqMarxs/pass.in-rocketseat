import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma"
import { request } from "http";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-Zod'
import {string, z} from 'zod'
import { title } from "process";
import { defaultMaxListeners } from "events";
import { checkIn } from "./check-in";
import { getAttendeeBadge } from "./get-attendee-badge";


export async function getEventAttendees(app: FastifyInstance){

    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
        schema:{
            params: z.object({
                eventId: z.string().uuid(),
            }),
            querystring: z.object({
                query: z.string().nullish(),
                pageIndex: z.string().nullish().default('0').transform(Number),
            }),
            response: {
                200: z.object({
                    attendees: z.array(
                        z.object({
                            id: z.number(),
                            name: z.string(),
                            email: z.string().email(),
                            createdAt: z.date(),
                            checkedInAt: z.date().nullable(),
                        })
                    )
                })
            },
        }
    }, async (request, replay)=> {

        const{ eventId } = request.params
        const {pageIndex, query} =request.query
        

        const attendees = await prisma.attendee.findMany({
            select:{
                id: true,
                name: true,
                email: true,
                createdAt: true,
                checkIn:{
                    select:{
                        createdAt: true,
                    }
                }
            },
            where: query ?{
                eventId,
                name:{
                    contains:query,
                }
            } : { 
                eventId,

            },
            take: 10,
            skip: pageIndex*10,
            orderBy:{
                createdAt: 'desc'
            }
            
        })

        return replay.send({
            attendees: attendees.map(attendee=>{
                return {id: attendee.id,
                name: attendee.name,
                email: attendee.email,
                createdAt: attendee.createdAt,
                checkedInAt: attendee.checkIn?.createdAt ?? null,
                }
            })
        })
  
    })
}