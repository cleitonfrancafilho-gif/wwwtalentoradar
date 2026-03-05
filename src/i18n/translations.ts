export type Lang = "pt" | "en" | "es";

export const translations: Record<string, Record<Lang, string>> = {
  // Positions
  "Atacante": { pt: "Atacante", en: "Forward", es: "Delantero" },
  "Meio-campo": { pt: "Meio-campo", en: "Midfielder", es: "Centrocampista" },
  "Zagueiro": { pt: "Zagueiro", en: "Center Back", es: "Defensa Central" },
  "Goleiro": { pt: "Goleiro", en: "Goalkeeper", es: "Portero" },
  "Lateral": { pt: "Lateral", en: "Full Back", es: "Lateral" },
  "Pivô": { pt: "Pivô", en: "Center/Pivot", es: "Pívot" },
  "Levantadora": { pt: "Levantadora", en: "Setter", es: "Colocadora" },
  "Líbero": { pt: "Líbero", en: "Libero", es: "Líbero" },
  "Ala": { pt: "Ala", en: "Wing", es: "Alero" },
  "Armador": { pt: "Armador", en: "Point Guard", es: "Base" },
  // Sports
  "Futebol": { pt: "Futebol", en: "Football", es: "Fútbol" },
  "Basquete": { pt: "Basquete", en: "Basketball", es: "Baloncesto" },
  "Vôlei": { pt: "Vôlei", en: "Volleyball", es: "Voleibol" },
  "Tênis": { pt: "Tênis", en: "Tennis", es: "Tenis" },
  "Natação": { pt: "Natação", en: "Swimming", es: "Natación" },
  "Artes Marciais": { pt: "Artes Marciais", en: "Martial Arts", es: "Artes Marciales" },
  "Surf": { pt: "Surf", en: "Surfing", es: "Surf" },
  // UI
  "Meu Foco": { pt: "Meu Foco", en: "My Focus", es: "Mi Enfoque" },
  "Descoberta": { pt: "Descoberta", en: "Discovery", es: "Descubrimiento" },
  "Eventos Próximos": { pt: "Eventos Próximos", en: "Nearby Events", es: "Eventos Cercanos" },
  "Tenho Interesse": { pt: "Tenho Interesse", en: "I'm Interested", es: "Me Interesa" },
};

export const t = (key: string, lang: Lang = "pt"): string => {
  return translations[key]?.[lang] ?? key;
};
