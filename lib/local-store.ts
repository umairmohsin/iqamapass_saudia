"use client";

import { useEffect, useMemo, useState } from "react";
import type { DocumentRecord, IqamaType, ProfileRecord, RelationType, TripRecord } from "./types";
import { calculateAbroadSummary, getDocumentStatus, passportBlocksIqama, sortDocumentsByUrgency } from "./compliance";

export type LocalUser = {
  email: string;
  password: string;
  full_name: string;
  city: string;
  language_preference: "en" | "ur";
  iqama_type: IqamaType;
  premium_status: boolean;
};

export type LocalData = {
  user: LocalUser | null;
  profiles: ProfileRecord[];
  documents: DocumentRecord[];
  trips: TripRecord[];
};

const STORAGE_KEY = "iqamapass_local_data_v1";
const defaultData: LocalData = { user: null, profiles: [], documents: [], trips: [] };

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadLocalData(): LocalData {
  if (typeof window === "undefined") return defaultData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData;
  try {
    return { ...defaultData, ...JSON.parse(raw) } as LocalData;
  } catch {
    return defaultData;
  }
}

export function saveLocalData(data: LocalData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearLocalData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function useLocalData() {
  const [data, setData] = useState<LocalData>(defaultData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = loadLocalData();
    setData(next);
    setReady(true);
  }, []);

  const update = (updater: (current: LocalData) => LocalData) => {
    setData((current) => {
      const next = updater(current);
      saveLocalData(next);
      return next;
    });
  };

  return { data, ready, update };
}

export function buildSelfProfile(user: LocalUser): ProfileRecord {
  return {
    id: "self_profile",
    user_id: "local_user",
    full_name: user.full_name,
    relation: "self",
    city: user.city,
    iqama_type: user.iqama_type,
    is_primary: true
  };
}

export function ensureSelfProfile(data: LocalData): LocalData {
  if (!data.user) return data;
  const existing = data.profiles.find((profile) => profile.relation === "self");
  const selfProfile = buildSelfProfile(data.user);
  if (existing) {
    return {
      ...data,
      profiles: data.profiles.map((profile) => (profile.id === existing.id ? { ...existing, ...selfProfile, id: existing.id } : profile))
    };
  }
  return { ...data, profiles: [selfProfile, ...data.profiles] };
}

export function createUser(input: {
  email: string;
  password: string;
  full_name?: string;
  city?: string;
  language_preference?: "en" | "ur";
  iqama_type?: IqamaType;
}): LocalUser {
  return {
    email: input.email,
    password: input.password,
    full_name: input.full_name || "",
    city: input.city || "",
    language_preference: input.language_preference || "en",
    iqama_type: input.iqama_type || "work",
    premium_status: false
  };
}

export function addOrUpdateDocument(data: LocalData, document: Omit<DocumentRecord, "id"> & { id?: string }): LocalData {
  const nextDoc = { ...document, id: document.id || makeId("doc") } as DocumentRecord;
  const documents = document.id
    ? data.documents.map((item) => (item.id === document.id ? nextDoc : item))
    : [nextDoc, ...data.documents];
  return { ...data, documents };
}

export function removeDocument(data: LocalData, id: string): LocalData {
  return { ...data, documents: data.documents.filter((document) => document.id !== id) };
}

export function addTrip(data: LocalData, trip: Omit<TripRecord, "id">): LocalData {
  return { ...data, trips: [{ ...trip, id: makeId("trip") }, ...data.trips] };
}

export function removeTrip(data: LocalData, id: string): LocalData {
  return { ...data, trips: data.trips.filter((trip) => trip.id !== id) };
}

export function addFamilyProfile(
  data: LocalData,
  profile: { full_name: string; relation: RelationType; city?: string; iqama_type?: IqamaType | null }
): LocalData {
  return {
    ...data,
    profiles: [
      ...data.profiles,
      {
        id: makeId("profile"),
        user_id: "local_user",
        full_name: profile.full_name,
        relation: profile.relation,
        city: profile.city || null,
        iqama_type: profile.iqama_type || null,
        is_primary: false
      }
    ]
  };
}

export function useLocalDashboard(data: LocalData) {
  return useMemo(() => {
    const normalized = ensureSelfProfile(data);
    const primaryProfile = normalized.profiles.find((profile) => profile.is_primary);
    const documents = normalized.documents.map((document) => ({
      ...document,
      profiles: normalized.profiles.find((profile) => profile.id === document.profile_id) || primaryProfile!
    }));
    const primaryTrips = normalized.trips.filter((trip) => trip.profile_id === primaryProfile?.id);
    const iqama = normalized.documents.find((item) => item.profile_id === primaryProfile?.id && item.document_type === "iqama");
    const passport = normalized.documents.find((item) => item.profile_id === primaryProfile?.id && item.document_type === "passport");
    const passportBlocker = passportBlocksIqama(passport?.expiry_date || null, iqama?.expiry_date || null);
    const sorted = sortDocumentsByUrgency(documents as Array<DocumentRecord & { profiles: ProfileRecord }>);
    const urgentCount = sorted.filter((document) => {
      const status = getDocumentStatus(document.expiry_date);
      return status.tone === "urgent" || status.tone === "expired";
    }).length;
    return {
      profiles: normalized.profiles,
      documents: sorted as Array<DocumentRecord & { profiles: ProfileRecord }>,
      trips: normalized.trips,
      abroadSummary: calculateAbroadSummary(primaryTrips),
      passportBlocker,
      urgentCount,
      user: normalized.user
    };
  }, [data]);
}
