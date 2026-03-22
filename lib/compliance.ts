import { addDays, differenceInCalendarDays, isAfter, max, min, parseISO, subDays } from "date-fns";
import type { DocumentRecord, TripRecord } from "./types";

export type StatusTone = "safe" | "warning" | "urgent" | "expired" | "nodata";

export function getDocumentStatus(expiryDate: string | null) {
  if (!expiryDate) {
    return { tone: "nodata" as StatusTone, daysRemaining: null };
  }

  const today = new Date();
  const expiry = parseISO(expiryDate);
  const daysRemaining = differenceInCalendarDays(expiry, today);

  if (daysRemaining <= 0) return { tone: "expired" as StatusTone, daysRemaining };
  if (daysRemaining <= 30) return { tone: "urgent" as StatusTone, daysRemaining };
  if (daysRemaining <= 90) return { tone: "warning" as StatusTone, daysRemaining };
  return { tone: "safe" as StatusTone, daysRemaining };
}

export function passportBlocksIqama(passportExpiry: string | null, iqamaExpiry: string | null) {
  if (!passportExpiry || !iqamaExpiry) return false;
  const passport = parseISO(passportExpiry);
  const iqama = parseISO(iqamaExpiry);
  const sixMonthsBefore = subDays(iqama, 183);
  return !isAfter(passport, iqama) && !isAfter(sixMonthsBefore, passport);
}

export function calculateAbroadSummary(trips: TripRecord[]) {
  const today = new Date();
  const windowStart = subDays(today, 179);
  let daysAbroad = 0;

  for (const trip of trips) {
    const departure = parseISO(trip.departure_date);
    const returnBoundary = trip.return_date ? addDays(parseISO(trip.return_date), -1) : today;
    const overlapStart = max([departure, windowStart]);
    const overlapEnd = min([returnBoundary, today]);

    if (overlapEnd >= overlapStart) {
      daysAbroad += differenceInCalendarDays(overlapEnd, overlapStart) + 1;
    }
  }

  const safeDaysRemaining = Math.max(0, 180 - daysAbroad);
  const tone: StatusTone =
    safeDaysRemaining === 0 ? "urgent" : safeDaysRemaining <= 30 ? "warning" : "safe";

  return {
    daysAbroad,
    safeDaysRemaining,
    tone
  };
}

export function sortDocumentsByUrgency(documents: DocumentRecord[]) {
  const rank: Record<StatusTone, number> = {
    expired: 0,
    urgent: 1,
    warning: 2,
    safe: 3,
    nodata: 4
  };

  return [...documents].sort((a, b) => {
    const aStatus = getDocumentStatus(a.expiry_date);
    const bStatus = getDocumentStatus(b.expiry_date);
    return rank[aStatus.tone] - rank[bStatus.tone];
  });
}
