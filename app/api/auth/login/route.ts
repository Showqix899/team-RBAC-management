import { generateJwtToken, hashPassword, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request: NextRequest)=>{
    try {
        const {email,password} = await request.json();

        if (!email || !password){
            return NextResponse.json({
                status:"error",
                message:"passord and email are required"
            },{
                status:400
            })
        }

        //check if the user already exist 
        const userFromDB = await prisma.user.findUnique({
            where:{email},
            include:{team: true}
        })

        if(!userFromDB){
            return NextResponse.json({
                message:"with this email a user does not exist"
            },{status:404})
        }

        

        const isValidPassword =await verifyPassword(password,userFromDB.password)

        if (!isValidPassword){
            return NextResponse.json({
                message:"Invalid password"
            })
        }

        

        //generate token 
        const token = generateJwtToken(userFromDB.id)
        
        const response = NextResponse.json({
            id:userFromDB.id,
            name:userFromDB.name,
            email:userFromDB.email,
            role:userFromDB.role,
            team:userFromDB.team,
            token,
        })

        response.cookies.set(
            "token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"lax",
                maxAge:60*60*24*7,
            }
        );

        return response;

    } catch (error) {
        console.log("something went wrong with login");
        return NextResponse.json({
            message:"this is a ineternal server error at login"
        },{status:500})
    }
}