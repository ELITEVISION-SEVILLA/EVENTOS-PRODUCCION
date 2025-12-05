

// shims-xlsx.d.ts
declare module 'xlsx' {
  // Removed: import { WorkBook, WorkSheet } from 'xlsx'; // Conflicts with local declarations

  // Corrected 'utils' from function to const
  export const utils: {
    book_new(): WorkBook;
    aoa_to_sheet<T>(data: T[][]): WorkSheet;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
    encode_cell(cell: {r: number; c: number}): string;
    sheet_to_json<T>(worksheet: WorkSheet, opts?: {
      raw?: boolean;
      header?: number;
      range?: string | number;
      defval?: any;
      blankrows?: boolean;
      edit?: boolean;
      cols?: number[];
      grow?: boolean;
      skipHidden?: boolean;
      dateNF?: string;
    }): T[];
  };
  export function writeFile(wb: WorkBook, filename: string): void;
  export function read(data: ArrayBuffer, opts?: {
    type?: string; // e.g., 'array', 'base64', 'binary', 'file'
    raw?: boolean;
    cellDates?: boolean;
    cellHTML?: boolean;
    cellNF?: boolean;
    cellStyles?: boolean;
    dense?: boolean;
    sheetStubs?: boolean;
    bookDeps?: boolean;
    bookProps?: boolean;
    bookSheets?: boolean;
    bookType?: string;
    codepage?: number;
    FS?: string;
    WT?: number;
    locale?: string;
    password?: string;
    original?: boolean;
    dateNF?: string;
    strict?: boolean;
    editable?: boolean;
    img?: boolean;
    json?: boolean;
  }): WorkBook;

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