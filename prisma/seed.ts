import { prisma } from '../src/lib/prisma'
async function seed(){
    await prisma.events.create({
        data:{
            id:'8b0a34c2-a58d-442a-833a-c83655739ce1',
            title: 'Unite Summit',
            slug: 'unite-summit', 
            details: 'Um evento para Devs apaixonados',
            maximumAttendees:   120,
        }
    })
}

seed().then(()=>{
    console.log('Data base seeded!')
    prisma.$disconnect()
})