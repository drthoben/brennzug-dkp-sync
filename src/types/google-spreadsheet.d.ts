declare module 'google-spreadsheet' {
  export class GoogleSpreadsheet {
    constructor(sheetId: string);
  }

  export class GoogleSpreadsheetWorksheet {
  }

  export class GoogleSpreadsheetRow {
  }

  export class GoogleSpreadsheetCell {
    constructor(parentSheet: GoogleSpreadsheetWorksheet, rowIndex: number, columnIndex: number, cellData: any) {
    }
  }

  export interface BasicDocumentProperties {
    spreadsheetId: string;
    title: string;
    locale: string;
    timeZone: string;
    autoRecalc: any; // RecalculationInterval
    defaultFormat: any; // CellFormat
    spreadsheetTheme: any; // SpreadsheetTheme
    iterativeCalculationSettings: any; // IterativeCalculationSettings
  }

  export interface GoogleSpreadsheet extends BasicDocumentProperties {
    // Private fields
    axios: AxiosInstance;

    // Worksheets
    sheetsById: { string: GoogleSpreadsheetWorksheet };
    sheetsByIndex: GoogleSpreadsheetWorksheet[];
    sheetCount: number;

    // Worksheets
    useServiceAccountAuth(credentials: ServiceAccountCredentials)
    useApiKey(key: string);
    useRawAccessToken(token: string);

    // Basic info
    loadInfo(): Promise<void>;
    updateProperties(props: any): Promise<void>; // props: BasicDocumentProperties
    resetLocalCache();

    // Managing Sheets
    addSheet(props?: any): Promise<GoogleSpreadsheetWorksheet>; // props?: { sheetId?: number, headerValues?: string[] }
    deleteSheet(sheetId: string): Promise<void>;

    // Named Ranges
    addNamedRange(name: string, range: object | string, rangeId?: string): Promise<void>;
    deleteNamedRange(rangeId: string): Promise<void>;
  }

  export interface GoogleSpreadsheetWorksheet {
    // Private fields
    _spreadsheet: GoogleSpreadsheet;
    _rawProperties: any;
    _cells: GoogleSpreadsheetCell[][];
    encodedA1SheetName: string;

    // Basic Sheet Properties
    sheetId: string;
    title: string;
    index: number;
    sheetType: any; // SheetType
    gridProperties: any; // GridProperties
    hidden: boolean;
    tabColor: any; // Color
    rightToLeft: boolean;

    // Sheet Dimensions & Stats
    rowCount: number;
    columnCount: number;
    cellStats: {
      total: number;
      loaded: number;
      nonEmpty: number;
    };

    // Working with rows
    loadHeaderRow(): Promise<void>;
    setHeaderRow(headerValues: string[]): Promise<void>;
    addRow(rowValues: any, options?: any): Promise<GoogleSpreadsheetRow>;
    addRows(arrayOfRowValues: any, options?: any): Promise<GoogleSpreadsheetRow[]>;
    getRows(options?: any): Promise<GoogleSpreadsheetRow[]>;

    // Working with cells
    loadCells(filters?: any): Promise<void>;
    getCell(rowIndex: number, columnIndex: number): GoogleSpreadsheetCell;
    getCellByA1(a1Address: string): GoogleSpreadsheetCell;
    saveUpdatedCells(): Promise<void>;
    saveCells(cells: GoogleSpreadsheetCell[]): Promise<void>;
    resetLocalCache(dataOnly?: boolean);

    // Updating Sheet Properties
    updateProperties(props: any): Promise<void>;
    resize(props: any): Promise<void>;
    updateDimensionProperties(columnsOrRows: any, props: any, bounds: any): Promise<void>;

    // Other
    clear(): Promise<void>;
    delete(): Promise<void>;
    copyToSpreadsheet(destinationSpreadsheetId: string): Promise<void>;
  }

  export interface GoogleSpreadsheetRow {
    // Row Location
    rowNumber: number;
    a1Range: string;

    // Row Values
    [key: string]: any;

    // Methods
    save(options?: { raw?: boolean }): Promise<void>;
    delete(): Promise<void>;
  }

  export interface GoogleSpreadsheetCell {
    // Private fields
    _rawData: any;
    _row: number;

    // Cell Location
    rowIndex: number;
    columnIndex: number;
    a1Row: number;
    a1Column: string;
    a1Address: string;

    // Cell Value(s)
    value: any;
    valueType: any;
    formattedValue: any;
    formula: string;
    formulaError: any; // Error
    note: string;
    hyperlink: string;

    // Cell Formatting
    userEnteredFormat: any; // CellFormat
    effectiveFormat: any; // CellFormat
    numberFormat: any; // NumberFormat
    backgroundColor: any; // Color
    borders: any; // Borders
    padding: any; // Padding
    horizontalAlignment: any; // HorizonalAlign
    verticalAlignment: any; // VerticalAlign
    wrapStrategy: any; // WrapStrategy
    textDirection: any; // TextDirection
    textFormat: any; // TextFormat
    hyperlinkDisplayType: any; // HyperlinkDisplayType
    textRotation: any; // TextRotation

    clearAllFormatting();
    discardUnsavedChanges();
    save(): Promise<void>;
  }

  export interface GoogleSpreadsheetCellCollection {
    rowIndex: number;
    cells: GoogleSpreadsheetCell[];
  }

  export interface ServiceAccountCredentials {
    client_email: string;
    private_key: string;
  }
}
