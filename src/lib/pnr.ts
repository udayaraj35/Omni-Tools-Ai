import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O I 0 1
const nano = customAlphabet(alphabet, 6);

export function generatePNR(): string {
  // No uniqueness check, just generate a random PNR
  return nano();
}

export function generateTicketNumber() {
  const prefix = "176"; // airline prefix dummy
  const rest = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, "0");
  return prefix + rest;
}

export function generateBookingRef() {
  return customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ", 8)();
}
