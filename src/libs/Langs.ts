export abstract class Langs {
    static genLocalString = (langsJson: Array<TranslatedString> | "EMPTY", defaults: TranslatedString): LocalizedString => {
        if (langsJson === "EMPTY") {
            return {
                "translatedValues": [],
                "defaultValue": defaults
            }
        }

        return {
            "translatedValues": langsJson,
            "defaultValue": defaults
        }
    } 
}

export interface LocalizedString {
    translatedValues: Array<TranslatedString> | [];
    defaultValue: TranslatedString;
}

export interface TranslatedString {
    language: string;
    value: string;
}

export function instanceOfLocalizedString(object: string | LocalizedString): boolean {
    if(typeof object === "string") {
        return true;
    } else {
        return 'defaultValue' in object;
    }
}

export function instanceOfTranslatedString(object: string | TranslatedString): boolean {
    if(typeof object === "string") {
        return true;
    } else {
        return 'defaultValue' in object;
    }
}