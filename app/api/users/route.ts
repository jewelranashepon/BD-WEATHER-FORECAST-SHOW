import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import { diff } from "deep-object-diff";
import { revalidateTag } from "next/cache";
import { admin } from "@/lib/auth-client";

// GET method for listing users with pagination
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get pagination parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where:
          session.user.role === "super_admin"
            ? undefined
            : {
                role: "observer",
                stationId: session.user.station?.id,
              },
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.users.count({
        where:
          session.user.role === "super_admin"
            ? undefined
            : {
                role: "observer",
                stationId: session.user.station?.id,
              },
      }),
    ]);

    return NextResponse.json(
      {
        users,
        total,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT method for updating users
export async function PUT(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body and log it for debugging
    const body = await request.json();

    const { id, password, ...rest } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }


    // Get the existing user to check their current role
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    // Authorization check (If other role tries to update super admin)
    if (existingUser.role === "super_admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    // Authorization check (If station admin tries to update other station admin)
    if (existingUser.role === "station_admin" && session.user.role === "station_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    // Only super_admin users can create other super_admin users
    if (
      existingUser.role !== "super_admin" &&
      rest.role === "super_admin" &&
      session.user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Only super admins can promote users to super admin role" },
        { status: 403 }
      );
    }

    // Handle password separately if provided
    let hashedPassword: string | undefined;
    if (password && password.trim() !== "") {
      hashedPassword = await hashPassword(password);
    }

    try {
      // Use a transaction to update both the user and the password
      const updatedUser = await prisma.$transaction(async (tx) => {
        // First update the user
        const user = await tx.users.update({
          where: {
            id: id,
          },
          data: rest,
        });

        // If password was provided, update it in the accounts table
        if (hashedPassword) {
          // Check if the account exists
          const existingAccount = await tx.accounts.findFirst({
            where: {
              userId: id,
              providerId: "credential",
            },
          });

          if (existingAccount) {
            // Update the existing account
            await tx.accounts.update({
              where: {
                id: existingAccount.id,
              },
              data: {
                password: hashedPassword,
              },
            });

            // Revoke User Sessions
            await admin.revokeUserSessions({
              userId: existingUser.id,
            });
          } else {
            // Create a new account if it doesn't exist
            await tx.accounts.create({
              data: {
                accountId: id,
                providerId: "credential",
                userId: id,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }

        // Log The Action
        const diffData = diff(existingUser, user);
        await LogAction({
          init: tx,
          action: LogActionType.UPDATE,
          actionText: "User Updated",
          role: session.user.role!,
          actorId: session.user.id,
          targetId: id,
          actorEmail: session.user.email,
          targetEmail: existingUser.email,
          module: LogModule.USER,
          details: diffData,
        });

        return user;
      });

      // Revalidate time checking
      revalidateTag("logs");

      return NextResponse.json(
        { message: "User updated successfully", user: updatedUser },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to update user",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// POST method for creating users
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if(session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      division,
      district,
      upazila,
      stationId,
    } = body;

    // Validate required fields
    if (!email || !password || !role || !division || !district || !upazila) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password length based on role
    const passwordMinLength = {
      super_admin: 12,
      station_admin: 11,
      observer: 10,
    };

    // Check if role is valid
    if (!["super_admin", "station_admin", "observer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const requiredLength =
      passwordMinLength[role as keyof typeof passwordMinLength];

    if (password.length < requiredLength) {
      return NextResponse.json(
        {
          error: `Password must be at least ${requiredLength} characters for ${role} role`,
        },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password using better-auth's hashPassword function
    const hashedPassword = await hashPassword(password);

    // Use a transaction to create the user and then the account
    await prisma.$transaction(async (tx) => {
      // First create the user
      const newUser = await tx.users.create({
        data: {
          name: name || null,
          email,
          role: role || null,
          division,
          district,
          upazila,
          stationId: stationId || null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
          banned: false,
          banReason: null,
          banExpires: null,
          twoFactorEnabled: false,
        },
      });

      // Then create the account with the user's ID
      await tx.accounts.create({
        data: {
          accountId: newUser.id,
          providerId: "credential",
          userId: newUser.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Log The Action
      await LogAction({
        init: tx,
        action: LogActionType.CREATE,
        actionText: "User Created",
        actorEmail: session.user.email,
        targetEmail: newUser.email,
        role: session.user.role!,
        actorId: session.user.id,
        targetId: newUser.id,
        module: LogModule.USER,
      });

      return newUser;
    });

    // Revalidate time checking
    revalidateTag("logs");

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// DELETE method for removing users
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if(session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent users from deleting their own account
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      );
    }

    // Get the user to be deleted to check their role
    const userToDelete = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Super_admin users can never be deleted
    if (userToDelete.role === "super_admin") {
      return NextResponse.json(
        { error: "Super admin accounts cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await admin.revokeUserSessions({
        userId: userToDelete.id,
      });

      // Log The Action
      await LogAction({
        init: tx,
        action: LogActionType.DELETE,
        actionText: "User Deleted",
        role: session.user.role!,
        actorId: session.user.id,
        targetId: userToDelete.id,
        actorEmail: session.user.email,
        targetEmail: userToDelete.email,
        module: LogModule.USER,
        details: userToDelete,
      });

      // Delete user from the database
      await tx.users.delete({
        where: {
          id: userId,
        },
      });
    });

    // Revalidate time checking
    revalidateTag("logs");

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
