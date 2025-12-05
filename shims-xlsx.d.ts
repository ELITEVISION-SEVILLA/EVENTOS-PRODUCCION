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
    // Index signature to allow direct access to cells by string key (e.g., 'A1')
    [cellRef: string]: CellObject | undefined; 
    '!ref'?: string;
    '!cols'?: { wch?: number; wpx?: number; hidden?: boolean }[];
    '!merges'?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
    // Removed the overly broad index signature which allowed string and other types at arbitrary keys,
    // as it conflicts with the primary use of cells as CellObject.
    // [key: string]: CellObject | string | { wch?: number; wpx?: number; hidden?: boolean }[] | { s: { r: number; c: number; }; e: { r: number; c: number; }; }[] | undefined;
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }
}