
import "server-only";
import { auth, db } from "./firebaseAdmin.server";
import PDFDocument from "pdfkit";
import fs from "fs";
import nodemailer from "nodemailer";
import type { Transporter } from 'nodemailer';

const checkAdminSdk = () => {
    if (!auth || !db) {
        throw new Error("Firebase Admin SDK is not initialized. Please set the FIREBASE_ADMIN_KEY environment variable.");
    }
};

/* VERIFY & SET ADMIN */
export async function verifyAdmin(uid: string): Promise<void> {
    checkAdminSdk();
    const user = await auth.getUser(uid);
    
    // The ONLY authorized admin email
    const adminEmail = "udayarajkhanal21@gmail.com";
    
    if (user.email === adminEmail) {
        // Ensure the user has the admin claim
        if (user.customClaims?.role !== 'admin') {
            await auth.setCustomUserClaims(uid, { role: 'admin' });
            // Also update the user document in Firestore for double verification
            await db.doc(`users/${uid}`).set({ role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
        }
        return;
    }

    throw new Error('Access Denied: You are not authorized to access the Admin Control Center.');
}

/* USER BLOCK (SUSPEND) */
export async function blockUser(uid: string): Promise<void> {
  checkAdminSdk();
  await auth.updateUser(uid, { disabled: true });
  await db.doc(`users/${uid}`).set({ role: 'blocked', updatedAt: new Date().toISOString() }, { merge: true });
}

/* USER UNBLOCK (RESTORE) */
export async function unblockUser(uid: string): Promise<void> {
    checkAdminSdk();
    await auth.updateUser(uid, { disabled: false });
    await db.doc(`users/${uid}`).set({ role: 'user', updatedAt: new Date().toISOString() }, { merge: true });
}

/* LIST USERS */
export async function listUsers(limit: number = 100, pageToken?: string) {
    checkAdminSdk();
    const userRecords = await auth.listUsers(limit, pageToken);
    const users = userRecords.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        disabled: user.disabled,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
    }));
    return {
        users,
        nextPageToken: userRecords.pageToken
    }
}

/* NEWS MANAGEMENT */
export async function saveNewsItem(data: any) {
    checkAdminSdk();
    const id = data.id || db.collection('newsItems').doc().id;
    const newsData = {
        ...data,
        id,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    await db.collection('newsItems').doc(id).set(newsData, { merge: true });
    return { success: true, id };
}

export async function deleteNewsItem(id: string) {
    checkAdminSdk();
    await db.collection('newsItems').doc(id).delete();
    return { success: true };
}

/* DUMMY TICKET CONFIRMATION */
export async function confirmDummyBooking(bookingId: string, transactionId?: string): Promise<void> {
    checkAdminSdk();
    const bookingRef = db.doc(`dummyBookings/${bookingId}`);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) throw new Error("Booking not found.");

    const data = bookingDoc.data();
    if (!data) throw new Error("No data in booking document.");

    await bookingRef.update({
        status: "confirmed",
        confirmedAt: new Date().toISOString(),
        transactionId: transactionId || "N/A"
    });

    const filePath = `/tmp/Ticket_${data.pnr}.pdf`;
    await generateTicketPDF(data, filePath, transactionId);
    await sendTicketMail(data.contactEmail, data.pnr, filePath);
}

async function generateTicketPDF(data: any, path: string, txid?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(path);
        doc.pipe(stream);

        doc.fontSize(25).fillColor('#003366').text(data.flightDetails?.airline || 'Flight Reservation', { align: 'center' });
        doc.fontSize(10).fillColor('#666666').text('Official Electronic Ticket Reservation', { align: 'center' });
        doc.moveDown();

        doc.rect(50, 100, 500, 50).fill('#f0f7ff');
        doc.fillColor('#003366').fontSize(12).text('PNR / Booking Reference', 70, 110);
        doc.fontSize(20).text(data.pnr, 70, 125);

        doc.moveDown(4);
        doc.fillColor('#000000').fontSize(14).text('Passenger Details', { underline: true });
        data.passengers.forEach((p: any, i: number) => {
            doc.fontSize(11).text(`${i + 1}. ${p.title} ${p.firstName} ${p.lastName} - Passport: ${p.passportNumber}`);
        });

        doc.moveDown();
        doc.fontSize(14).text('Itinerary Information', { underline: true });
        doc.fontSize(11).text(`Route: ${data.fromAirport} to ${data.toAirport}`);
        doc.text(`Date: ${data.departureDate}`);
        doc.text(`Status: CONFIRMED / RESERVED`);
        if (txid) {
            doc.text(`Transaction ID: ${txid}`);
        }

        doc.moveDown(10);
        doc.fontSize(8).fillColor('#999999').text('THIS IS A VERIFIABLE FLIGHT RESERVATION FOR VISA PURPOSES ONLY.', { align: 'center' });
        
        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

async function sendTicketMail(to: string, pnr: string, filePath: string): Promise<void> {
    const transporter: Transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_GMAIL,
            pass: process.env.ADMIN_GMAIL_APP_PASS
        }
    });

    await transporter.sendMail({
        from: `"OmniTools AI" <${process.env.ADMIN_GMAIL}>`,
        to: to,
        subject: `Confirmed Flight Reservation - PNR: ${pnr}`,
        text: `Namaste,\n\nYour flight reservation for PNR ${pnr} has been verified and confirmed. Please find the attached PDF for your visa application.\n\nThank you for choosing OmniTools AI.`,
        attachments: [{ filename: `Ticket_${pnr}.pdf`, path: filePath }]
    });
}
