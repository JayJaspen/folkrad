import { sql } from '@vercel/postgres';
export { sql };

export const COUNTIES = [
  'Blekinge','Dalarna','Gotland','Gävleborg','Halland',
  'Jämtland','Jönköping','Kalmar','Kronoberg','Norrbotten',
  'Skåne','Stockholm','Södermanland','Uppsala','Värmland',
  'Västerbotten','Västernorrland','Västmanland',
  'Västra Götaland','Örebro','Östergötland'
];

export const AGE_RANGES = ['18-25','26-35','36-45','46-55','56-65','66+'];
export const GENDERS = ['Man','Kvinna','Vill ej ange'];

export const PARTIES = [
  { name: 'Socialdemokraterna', color: '#E8112d' },
  { name: 'Moderaterna', color: '#1B4F72' },
  { name: 'Sverigedemokraterna', color: '#5DADE2' },
  { name: 'Centerpartiet', color: '#27AE60' },
  { name: 'Vänsterpartiet', color: '#8B0000' },
  { name: 'Kristdemokraterna', color: '#154360' },
  { name: 'Miljöpartiet', color: '#82E0AA' },
  { name: 'Liberalerna', color: '#85C1E9' },
  { name: 'Annat parti', color: '#9B59B6' },
  { name: 'Osäker', color: '#F4D03F' },
];

export function getAgeRange(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  if (age <= 65) return '56-65';
  return '66+';
}
