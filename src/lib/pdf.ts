import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { dbAdmin } from "@/lib/firebase-admin";

export async function generateTicketPDF(pnr: string): Promise<Buffer> {
  const snap = await dbAdmin
    .collection("reservations")
    .where("pnr_code", "==", pnr)
    .limit(1)
    .get();

  if (snap.empty) throw new Error("PNR_NOT_FOUND");

  const r = snap.docs[0].data();

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: any[] = [];

  doc.on("data", c => chunks.push(c));

  // Header
  doc.fontSize(20).text("FLIGHT RESERVATION", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text("Reservation for Visa Purpose", { align: "center" });

  doc.moveDown(2);

  // Passenger
  doc.text(`Passenger: ${r.passenger_name}`);
  doc.text(`Passport: ${r.passport_number}`);
  doc.text(`Nationality: ${r.nationality}`);

  doc.moveDown();

  // Flight
  doc.text(`Route: ${r.from} → ${r.to}`);
  doc.text(`Flight: ${r.flight_number}`);
  doc.text(`Departure: ${r.depart_time}`);
  doc.text(`Arrival: ${r.arrive_time}`);

  doc.moveDown();

  // Booking
  doc.text(`PNR: ${r.pnr_code}`);
  doc.text(`Ticket No: ${r.ticket_number}`);
  doc.text(`Booking Ref: ${r.booking_ref}`);
  doc.text(`Status: RESERVED`);
  doc.text(`Valid Until: ${new Date(r.valid_until).toLocaleString()}`);

  const qr = await QRCode.toDataURL(
    `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${pnr}`
  );

  const base64 = qr.replace(/^data:image\/png;base64,/, "");
  doc.image(Buffer.from(base64, "base64"), 400, 120, { width: 120 });

  doc.moveDown(4);
  doc.fontSize(10).text(
    "This is a flight reservation document and not a paid ticket.",
    { align: "center" }
  );

  doc.end();

  return await new Promise(res =>
    doc.on("end", () => res(Buffer.concat(chunks)))
  );
}
