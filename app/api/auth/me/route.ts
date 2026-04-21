import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest)=>{
    try {
        const user = await getCurrentUser();

        if (!user){
            return NextResponse.json({
                message:"no user found"
            },{status:404})
        }

        return NextResponse.json({
            user:user
        })
    } catch (error) {
        console.log("error",error)
        return NextResponse.json({
                message:"something went wrong with me fucntion",
                error:error
            },{status:404})
    }
}