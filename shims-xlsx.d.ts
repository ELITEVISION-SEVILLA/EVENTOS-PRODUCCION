
// shims-xlsx.d.ts
declare module 'xlsx' {
  // Removed: import { WorkBook, WorkSheet } from 'xlsx'; // Conflicts with local declarations

  // Corrected 'utils' from function to const
  export const utils: {
    book_new(): WorkBook;
    aoa_to_sheet<T>(data: T[][]): WorkSheet;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
    encode_cell(cell: {r: number; c: number}): string;
  };
  export function writeFile(wb: WorkBook, filename: string): void;

  interface CellObject {
    v?: any;
    t?: string;
    w?: string;
    f?: string;
    r?: string;
    h?: string;
    z?: string;
    s?: {
      font?: {
        bold?: boolean;
        sz?: number;
        name?: string;
        color?: { rgb: string };
      };
      fill?: {
        fgColor?: { rgb: string };
      };
      alignment?: {
        horizontal?: string;
        vertical?: string;
        wrapText?: boolean;
      };
      border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
      };
    };
  }

  interface WorkSheet {
    // Fix: Broadened the index signature to allow for different types of properties on a worksheet
    [key: string]: CellObject | string | { wch?: number; wpx?: number; hidden?: boolean }[] | { s: { r: number; c: number }; e: { r: number; c: number } }[] | undefined;
    
    '!ref'?: string;
    '!cols'?: { wch?: number; wpx?: number; hidden?: boolean }[];
    '!merges'?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }
}
