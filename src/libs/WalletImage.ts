import { Langs, TranslatedString } from "./Langs"

export abstract class WalletImage {
    static generate = (imageUrl: string, translations: Array<TranslatedString>, defaultText: TranslatedString) => {
        return {
            "sourceUri": { "uri": imageUrl },
            "contentDescription": Langs.genLocalString(translations, defaultText)
        }
    }
}