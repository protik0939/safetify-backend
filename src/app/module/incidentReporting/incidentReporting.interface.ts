export interface ICreateIncident {
  userId: string;
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
  severityLevel?: string;
  timing: string;
  victim?: string;
  attackers?: string;
  deathToll?: number;
  injuryCount?: number;
  peopleHelped?: number;
  stories?: string[];
  images?: string[];
}

export interface IUpdateIncident {
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  severityLevel?: string;
  timing?: string;
  status?: string;
  victim?: string;
  attackers?: string;
  deathToll?: number;
  injuryCount?: number;
  peopleHelped?: number;
  stories?: string[];
  images?: string[];
}
