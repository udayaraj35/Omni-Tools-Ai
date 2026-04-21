
"use server";

import { 
    blockUser, 
    unblockUser,
    listUsers, 
    verifyAdmin as verifyAdminServer, 
    confirmDummyBooking,
    saveNewsItem,
    deleteNewsItem
} from "@/lib/adminSystem.server";

export async function blockUserAction(uid: string) {
  try {
    await blockUser(uid);
    return { success: true };
  } catch(error: any) {
    console.error("blockUserAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function unblockUserAction(uid: string) {
    try {
        await unblockUser(uid);
        return { success: true };
    } catch (error: any) {
        console.error("unblockUserAction error:", error);
        return { success: false, error: error.message };
    }
}

export async function listUsersAction(limit: number = 100, pageToken?: string) {
    try {
        const result = await listUsers(limit, pageToken);
        return { success: true, ...result };
    } catch (error: any) {
        console.error("listUsersAction error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Double-verifies admin privileges on the server.
 * Restricts access exclusively to udayarajkhanal21@gmail.com
 */
export async function verifyAdmin(uid: string) {
  await verifyAdminServer(uid);
}

export async function confirmDummyBookingAction(bookingId: string, transactionId?: string) {
    try {
        await confirmDummyBooking(bookingId, transactionId);
        return { success: true };
    } catch (error: any) {
        console.error("confirmDummyBookingAction error:", error);
        return { success: false, error: error.message };
    }
}

export async function saveNewsItemAction(data: any) {
    try {
        return await saveNewsItem(data);
    } catch (error: any) {
        console.error("saveNewsItemAction error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteNewsItemAction(id: string) {
    try {
        return await deleteNewsItem(id);
    } catch (error: any) {
        console.error("deleteNewsItemAction error:", error);
        return { success: false, error: error.message };
    }
}
