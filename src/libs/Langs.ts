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

export function instanceOfLocalizedString(object: any): object is LocalizedString {
    return 'defaultValue' in object;
}

export function instanceOfTranslatedString(object: any): object is TranslatedString {
    return 'value' in object;
}