import { dbCheck } from "@/app/lib/db";
import { NextResponse } from "next/server";

export const GET = async ()=>{
    const isConnected = await dbCheck();

    if(isConnected === true){
        return NextResponse.json({
            status:"success",
            message:"database is connected"
        })
    }else{
        return NextResponse.json({
            status:"error",
            message:"database connection failed"
        })
    }
}