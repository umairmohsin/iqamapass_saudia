import { cookies } from "next/headers";
import { dictionaries, type Language } from "./dictionaries";

export async function getLanguage(): Promise<Language> {
  const language = cookies().get("language")?.value;
  return language === "ur" ? "ur" : "en";
}

export async function getDictionary() {
  const language = await getLanguage();
  return {
    language,
    dict: dictionaries[language]
  };
}
