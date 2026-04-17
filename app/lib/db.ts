import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

//database helper fucntion 


export const dbCheck = async ()=>{
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error(`Database connection failed : ${error}`)
        return false;
    }
}