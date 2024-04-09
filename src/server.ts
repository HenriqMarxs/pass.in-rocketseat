import { create } from "domain";
import fastify from "fastify"
import fastifySwaggerUI from "@fastify/swagger-ui"
import fastifySwagger from "@fastify/swagger"

import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-Zod'
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-events-attendees";

 
const app = fastify();

app.register(fastifySwagger,{
    swagger:{
        consumes:['application/json'],
        produces:['application/jason'],
        info:{
            title:'pass.in',
            description: 'Especificações da API para o back-end da palicação da aplicação pass.in construida durante o NLW Unite da RocketSeat.',
            version:'1.0.0'
        }, 
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',  
})
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)


app.register(createEvent)
app.register(registerForEvent)
app.register(getEvent)
app.register(getAttendeeBadge)
app.register(checkIn)
app.register(getEventAttendees)




app.listen({port:3333}).then(()=>{
    console.log('HTTPS sever running')
} )


