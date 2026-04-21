import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "You are not authenticated. Please login.",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const teamId = searchParams.get("teamId");
    const role = searchParams.get("role");

    const query: Prisma.UserWhereInput = {};

    // ---------------- ADMIN ----------------
    if (currentUser.role === Role.ADMIN) {
      // admin can see all users
      if (teamId) {
        query.teamId = teamId;
      }

      if (role && Object.values(Role).includes(role as Role)) {
        query.role = role as Role;
      }
    }

    // ---------------- MANAGER ----------------
    else if (currentUser.role === Role.MANAGER) {
      // manager can see everyone except admin

      query.role = {
        not: Role.ADMIN,
      };

      if (teamId) {
        query.teamId = teamId;
      }

      if (role && Object.values(Role).includes(role as Role)) {
        // manager cannot search admin
        if (role === Role.ADMIN) {
          return NextResponse.json(
            {
              message: "Managers cannot access admin users.",
            },
            { status: 403 }
          );
        }

        query.role = role as Role;
      }
    }

    // ---------------- USER / GUEST ----------------
    else {
      // only own team users
      query.teamId = currentUser.teamId;

      // only role search allowed
      if (role && Object.values(Role).includes(role as Role)) {
        query.role = role as Role;
      }
    }

    // ---------------- FETCH USERS ----------------

    const users = await prisma.user.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.log("error", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
};