export interface Kontaktperson {
  id: string;
  navn: string;
  email: string | null;
  telefon: string | null;
  /** The default recipient for anything sent to this Kunde. */
  erPrimær: boolean;
}

export interface Kunde {
  id: string;
  navn: string;
  adresse: string | null;
  postnr: string | null;
  by: string | null;
  economicCustomerNumber: number | null;
  kontaktpersoner: Kontaktperson[];
}

export interface KundeFelter {
  navn: string;
  adresse: string | null;
  postnr: string | null;
  by: string | null;
}

export interface KontaktpersonFelter {
  navn: string;
  email: string | null;
  telefon: string | null;
}
