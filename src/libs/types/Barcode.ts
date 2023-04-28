import { TotpDetails } from "./Totp";

export interface Barcode {
    format: BarcodeType;
    altText: string;
    message: string;
}

export type BarcodeType = "AZTEC" | "CODE_39" | "CODE_128" | "CODABAR" | "DATA_MATRIX" | "EAN_8" | "EAN_13" | "ITF_14" | "PDF_417" | "QR_CODE" | "UPC_A" | "TEXT_ONLY";

export interface RotatingBarcode {
    type: BarcodeType;
    valuePattern: string;
    totpDetails: TotpDetails
}