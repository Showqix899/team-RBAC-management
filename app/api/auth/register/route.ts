import { generateJwtToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request: NextRequest)=>{
    try {
        const {name,email,password,teamCode} = await request.json();

        if (!name || !email || !password){
            return NextResponse.json({
                status:"error",
                message:"name, passord and email are required"
            },{
                status:400
            })
        }

        //check if the user already exist 
        const existingUser = await prisma.user.findUnique({
            where:{email}
        })

        if(existingUser){
            return NextResponse.json({
                message:"with this email a user already exist"
            },{status:409})
        }

        let teamId :string | undefined ;

        if (teamCode){
            const team = await prisma.team.findUnique({
                where:{code : teamCode},
            })

            if (!team){
                return NextResponse.json({
                    messag:"please submit a valid team id"
                })
            }

            teamId = team.id;
        };

        const hashpass =await hashPassword(password)

        const userCount = await prisma.user.count();

        const role = userCount === 0 ? Role.ADMIN : Role.USER;

        const user = await prisma.user.create({
           data:{
             name,
            email,
            password:hashpass,
            role,
            teamId,
           },
           include:{
            team:true
           }
        });

        //generate token 
        const token = generateJwtToken(user.id)
        
        const response = NextResponse.json({
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
            team:user.team,
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
        console.log("something went wrong with register");
        return NextResponse.json({
            message:"this is a ineternal server error at register"
        },{status:500})
    }
}