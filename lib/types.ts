export type DocumentType = "iqama" | "passport" | "reentry_visa" | "other";
export type RelationType = "self" | "spouse" | "child" | "dependent";
export type IqamaType = "work" | "family";

export type ProfileRecord = {
  id: string;
  user_id: string;
  full_name: string;
  relation: RelationType;
  city: string | null;
  iqama_type: IqamaType | null;
  is_primary: boolean;
};

export type DocumentRecord = {
  id: string;
  profile_id: string;
  document_type: DocumentType;
  label: string | null;
  expiry_date: string | null;
  issue_date: string | null;
  visa_entry_type: "single" | "multiple" | null;
  notes: string | null;
  alert_90: boolean;
  alert_60: boolean;
  alert_30: boolean;
  alert_7: boolean;
  created_at?: string;
};

export type TripRecord = {
  id: string;
  profile_id: string;
  departure_date: string;
  return_date: string | null;
  destination: string | null;
  notes: string | null;
};
