import fastify from "fastify";
import {z} from 'zod';
import {PrismaClient} from '@prisma/client';


const app = fastify();

const  prisma = new PrismaClient({
    log:['query'],
})


app.post('/events', async (request, reply)=>{
    const createEventSchema = z.object({
        title : z.string().min(4),
        details: z.string().nullable(),
        maximumAtendees: z.number().int().positive().nullable(),
    })

    const data = createEventSchema.parse(request.body)

   const event =  await prisma.events.create({
        data: {
            title: data.title,
            details: data.details,
            maximumAttendees: data.maximumAtendees,
            slug: new Date().toString(),

        },
        
    })

    return{eventId: event.id}

})


app.listen({port: 3333}).then(()=>{
    console.log('HTTPS sever run ing')
} )


