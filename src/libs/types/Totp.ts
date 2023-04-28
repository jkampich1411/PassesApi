import { LocalizedString } from "../Langs";

export type TotpAlgorithm = "TOTP_ALGORITHM_UNSPECIFIED" | "TOTP_SHA1";

export interface TotpParameter {
    key: string,
    valueLength: number
}

export interface TotpDetails {
    periodMillis: string; // string rep of Number()
    algorithm: TotpAlgorithm;
    parameters: Array<TotpParameter>;
    alternateText: string;
    showCodeText: LocalizedString;
}