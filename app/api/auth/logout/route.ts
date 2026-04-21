import { NextResponse } from "next/server"

export const POST = async () => {
    const response = NextResponse.json({
        message:"User logged out successfuly"
    },{status:200});

    response.cookies.set(
        "token","",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"lax",
            maxAge:0
        }
    )

    return response
}