import { Pass as Base } from './Pass';
import { Setup } from '../Setup';

import { createISO8601, URL_PREFIX } from '../utils';

import { WalletImage } from '../WalletImage';
import { instanceOfLocalizedString, Langs, LocalizedString } from '../Langs';
import { Barcode, RotatingBarcode } from '../types/Barcode';
import { AnimationType } from '../types/AnimationType';
import { MultipleDevicesAndHoldersAllowedStatusType } from '../types/MultipleDevicesAndHoldersAllowedStatusType';
import { ViewUnlockRequirementType } from '../types/ViewUnlockRequirementType';
import { State } from '../types/State';

class GenericPass extends Base {
    _object_template: any = {
        "cardTitle": {}, // LocalizedString!
        "subheader": {}, // LocalizedString!
        "header": {}, // LocalizedString!
        "logo": {}, // Image!
        "hexBackgroundColor": "",
        "notifications": {
            "expiryNotification": {},
            "upcomingNotification": {}
        },
        "id": "",
        "classId": "",
        "barcode": {},
        "heroImage": {}, // Image!
        "validTimeInterval": {
            "start": {},
            "end": {}
        },
        "imageModulesData": [ // _imdTemp
        ],
        "textModulesData": [ // _tmdTemp
        ],
        "linksModuleData": {
            "uris": [ // _lmdTemp
            ]
        },
        "detailsModulesData": [ // custom field
        ],
        "groupingInfo": {},
        "smartTapRedemptionValue": "",
        "rotatingBarcode": { // interface RotatingBarcode
        },
        "state": "",
        "passConstraints": {
            "screenshotEligibility": "SCREENSHOT_ELIGIBILITY_UNSPECIFIED",
            "nfcConstraint": ["NFC_CONSTRAINT_UNSPECIFIED"]
        }
    };

    _lmdTemp = {
        "uri": "",
        "description": "",
        "localizedDescription": {}, // LocalizedString!
        "id": ""
    }

    _tmdTemp = {
        "header": "",
        "body": "",
        "localizedHeader": {}, // LocalizedString!
        "localizedBody": {}, // LocalizedString!
        "id": ""
    }

    _imdTemp = {
        "mainImage": {}, // Image!
        "id": ""
    }

    _class_template: any = {
        "id": "",
        "classTemplateInfo": {
            "cardTemplateOverride": {
                "cardRowTemplateInfos": []
            },
            "detailsTemplateOverride": {
                "detailsItemInfo": []
            }
        },
        "imageModulesData": [ // _imdTemp
        ],
        "textModulesData": [ // _tmdTemp
        ],
        "linksModuleData": {
            "uris": [ // _lmdTemp
            ]
        },
        "enableSmartTap": false,
        "redemptionIssuers": [],
        "securityAnimation": {
            "animationType": "ANIMATION_UNSPECIFIED" // type AnimationType
        },
        "multipleDevicesAndHoldersAllowedStatus": "STATUS_UNSPECIFIED", // type MultipleDevicesAndHoldersAllowedStatusType
        "viewUnlockRequirement": "VIEW_UNLOCK_REQUIREMENT_UNSPECIFIED", // type ViewUnlockRequirementType
        "callbackOptions": {}
    };

    constructor(uid: string, setup: Setup) {
        let objectUrl = URL_PREFIX + 'genericObject';
        let classUrl = URL_PREFIX + 'genericClass';
        super(objectUrl, classUrl, setup);

        this._className = `${uid.replace(/[^\w.-]/g, '_').replace(/([\.])/g, '_')}`;
        this._objectId = `${this._init.issuer_id}.${uid.replace(/[^\w.-]/g, '_').replace(/([\.])/g, '_')}`
        this._classId = `${this._init.issuer_id}.${this._className}`
        
        this.dataC = this._class_template;
        this.dataC.id = this._classId;
        
        this.dataO = this._object_template;
        this.dataO.classId = `${this._init.issuer_id}.${this._className}`;
        this.dataO.id = this._objectId;
    };

    static async genFromGoogle(id: string, setup: Setup) {
        let that = new this(id, setup);

        that._className = id;
        that._classId = `${that._init.issuer_id}.${id}`;
        that._objectId = `${that._init.issuer_id}.${id}`;

        try {

            let classRes = await that._init.google_client.request({
                url: `${that._classUrl}/${that._classId}`,
                method: "GET"
            });


            let objecRes = await that._init.google_client.request({
                url: `${that._objectUrl}/${that._objectId}`,
                method: "GET"
            });
            
            let classD = classRes.data;
            let objecD = objecRes.data;

            objecD.classReference = undefined;
            
            that.dataC = classD;
            that.dataO = objecD;

            that._postable = false;

            return that;

        } catch (e: any) {
            let r = e.response;

            if(r && r.status === 404) {
                return false;
            }
        }
    }

    setValidTimeInterval(start: Date, end?: Date) {
        let startIso = createISO8601(start);
        this.dataO["validTimeInterval"]["start"].date = startIso;
        
        if(end) {
            let endIso = createISO8601(end);
            this.dataO["validTimeInterval"]["end"].date = endIso;
        }
    }

    enableNotifications(notifications: "all" | "expiry" | "upcoming") {
        if(notifications === "all") {
            let n = this.dataO["notifications"];
            n["expiryNotification"].enableNotification = true;
            n["upcomingNotification"].enableNotification = true;
        } else {
            this.dataO["notifications"][notifications + "Notification"].enableNotification = true;
        }
    }

    setCardTitle(title: LocalizedString) {
        this.dataO.cardTitle = title;
    }

    setSubHeader(subHeader: LocalizedString) {
        this.dataO.subheader = subHeader;
    }

    setHeader(header: LocalizedString) {
        this.dataO.header = header;
    }

    setHeroImage(image: WalletImage) {
        this.dataO.heroImage = image;
    }

    setLogoImage(image: WalletImage) {
        this.dataO.logo = image;
    }

    setBarcode(barcode: Barcode) {
        this.dataO.barcode["type"] = barcode["format"];
        this.dataO.barcode["value"] = barcode["message"];
        this.dataO.barcode["alternateText"] = barcode["altText"];
    }

    setBackgroundColour(hex: string) {
        this.dataO.hexBackgroundColor = hex;
    }

    addRedemptionIssuer(issuerId: string | number) {
        this.dataC.enableSmartTap = true;
        this.dataC.redemptionIssuers.push(issuerId);
    }

    setSecurityAnimation(securityAnimation: AnimationType) {
        this.dataC.securityAnimation.animationType = securityAnimation;
    }

    setMultipleDevicesAndHoldersAllowedStatus(status: MultipleDevicesAndHoldersAllowedStatusType) {
        this.dataC.multipleDevicesAndHoldersAllowedStatus = status;
    }

    setViewUnlockRequirement(viewUnlockRequirement: ViewUnlockRequirementType) {
        this.dataC.viewUnlockRequirement = viewUnlockRequirement;
    }

    setRotatingBarcode(barcode: RotatingBarcode) {
        this.dataO.rotatingBarcode = barcode;
    }

    setState(state: State) {
        this.dataO.state = state;
    }

    setSmartTapRedemptionValue(value: string) {
        this.dataO.smartTapRedemptionValue = value
    }

    setGrouping(id: string, index: Number) {
        this.dataO.groupingInfo.groupingId = id;
        this.dataO.groupingInfo.sortIndex = index;
    }

    setText(textModules: Array<TextRow>) {
        this.dataC.classTemplateInfo.cardTemplateOverride.cardRowTemplateInfos = [];
        this.dataO.textModulesData = [];

        if(textModules.length > 3) {
            throw Error("Only 3 extra rows are supported!");
        }

        textModules.forEach(e => {
            if(e.items.length !== 1 && e.type === "oneItem") { 
                throw Error("Too many items for 'oneItem' or too few items provided");
            }

            if(e.items.length !== 2 && e.type === "twoItems") { 
                throw Error("Too many items for 'twoItems' or too few items provided");
            }

            if(e.items.length !== 3 && e.type === "threeItems") { 
                throw Error("Too many items for 'threeItems' or too few items provided");
            }

            if(e.type === "oneItem") {
                let item = e.items[0]

                let oneItemJson: OneItem;
                oneItemJson.oneItem.item.firstValue.fields.push({
                    "fieldPath": `object.textModulesData['${item.item.id}']`
                });

                this.dataC.classTemplateInfo.cardTemplateOverride.cardRowTemplateInfos.push(oneItemJson);
                
                let itemData: TextItem_Localized | TextItem_Unlocalized;

                itemData = {
                    "id": item.item.id,
                    "header": instanceOfLocalizedString(item.item.header) ? undefined : item.item.header,
                    "body": instanceOfLocalizedString(item.item.body) ? undefined : item.item.body,
                    "localizedHeader": instanceOfLocalizedString(item.item.header) ? item.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(item.item.body) ? item.item.body : undefined
                }

                this.dataO.textModulesData.push(itemData);
            }

            if(e.type === "twoItems") {
                let firstElement = e.items.filter(item => item.location === "start")[0];
                let lastElement = e.items.filter(item => item.location === "end")[0];

                let twoItemsJson: TwoItems;

                twoItemsJson.twoItems.startItem.firstValue.fields.push({
                    fieldPath: `object.textModulesData['${firstElement.item.id}']`
                });
                twoItemsJson.twoItems.endItem.firstValue.fields.push({
                    fieldPath: `object.textModulesData['${lastElement.item.id}']`
                });

                this.dataC.classTemplateInfo.cardTemplateOverride.cardRowTemplateInfos.push(twoItemsJson);

                let firstItemData: TextItem_Localized | TextItem_Unlocalized = {
                    "id": firstElement.item.id,
                    "header": instanceOfLocalizedString(firstElement.item.header) ? undefined : firstElement.item.header,
                    "body": instanceOfLocalizedString(firstElement.item.body) ? undefined : firstElement.item.body,
                    "localizedHeader": instanceOfLocalizedString(firstElement.item.header) ? firstElement.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(firstElement.item.body) ? firstElement.item.body : undefined
                }

                let lastItemData: TextItem_Localized | TextItem_Unlocalized = {
                    "id": lastElement.item.id,
                    "header": instanceOfLocalizedString(lastElement.item.header) ? undefined : lastElement.item.header,
                    "body": instanceOfLocalizedString(lastElement.item.body) ? undefined : lastElement.item.body,
                    "localizedHeader": instanceOfLocalizedString(lastElement.item.header) ? lastElement.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(lastElement.item.body) ? lastElement.item.body : undefined
                }

                this.dataO.textModulesData.push(firstItemData);
                this.dataO.textModulesData.push(lastItemData);
            }

            if(e.type === "threeItems") {
                let firstElement = e.items.filter(item => item.location === "start")[0];
                let middleElement = e.items.filter(item => item.location === "middle")[0];
                let lastElement = e.items.filter(item => item.location === "end")[0];

                let threeItemsJson: ThreeItems;

                threeItemsJson.threeItems.startItem.firstValue.fields.push({
                    fieldPath: `object.textModulesData['${firstElement.item.id}']`
                });
                threeItemsJson.threeItems.middleItem.firstValue.fields.push({
                    fieldPath: `object.textModulesData['${middleElement.item.id}']`
                });
                threeItemsJson.threeItems.endItem.firstValue.fields.push({
                    fieldPath: `object.textModulesData['${lastElement.item.id}']`
                });

                this.dataC.classTemplateInfo.cardTemplateOverride.cardRowTemplateInfos.push(threeItemsJson);

                let firstItemData: TextItem_Localized | TextItem_Unlocalized = {
                    "id": firstElement.item.id,
                    "header": instanceOfLocalizedString(firstElement.item.header) ? undefined : firstElement.item.header,
                    "body": instanceOfLocalizedString(firstElement.item.body) ? undefined : firstElement.item.body,
                    "localizedHeader": instanceOfLocalizedString(firstElement.item.header) ? firstElement.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(firstElement.item.body) ? firstElement.item.body : undefined
                }

                let middleItemData: TextItem_Localized | TextItem_Unlocalized = {
                    "id": middleElement.item.id,
                    "header": instanceOfLocalizedString(middleElement.item.header) ? undefined : middleElement.item.header,
                    "body": instanceOfLocalizedString(middleElement.item.body) ? undefined : middleElement.item.body,
                    "localizedHeader": instanceOfLocalizedString(middleElement.item.header) ? middleElement.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(middleElement.item.body) ? middleElement.item.body : undefined
                }

                let lastItemData: TextItem_Localized | TextItem_Unlocalized = {
                    "id": lastElement.item.id,
                    "header": instanceOfLocalizedString(lastElement.item.header) ? undefined : lastElement.item.header,
                    "body": instanceOfLocalizedString(lastElement.item.body) ? undefined : lastElement.item.body,
                    "localizedHeader": instanceOfLocalizedString(lastElement.item.header) ? lastElement.item.header : undefined,
                    "localizedBody": instanceOfLocalizedString(lastElement.item.body) ? lastElement.item.body : undefined
                }

                this.dataO.textModulesData.push(firstItemData);
                this.dataO.textModulesData.push(middleItemData);
                this.dataO.textModulesData.push(lastItemData);
            }
        })
    }

    addDetail(detail: Detail) {
        let detailsItemJson: DetailsItem;
        detailsItemJson.item.firstValue.fields.push({
            "fieldPath": `object.detailsModulesData['${detail.id}']`
        });

        this.dataC.classTemplateInfo.detailsTemplateOverride.detailsItemInfo.push(detailsItemJson);

        let itemData: TextItem_Localized | TextItem_Unlocalized = {
            "id": detail.id,
            "header": instanceOfLocalizedString(detail.header) ? undefined : detail.header,
            "body": instanceOfLocalizedString(detail.body) ? undefined : detail.body,
            "localizedHeader": instanceOfLocalizedString(detail.header) ? detail.header : undefined,
            "localizedBody": instanceOfLocalizedString(detail.body) ? detail.body : undefined
        }

        this.dataO.detailsModulesData.push(itemData);
    }
    
    allowScreenshots(allow: boolean) {
        if(allow) {
            this.dataO.passConstraints.screenshotEligibility = "ELEGIBLE"
        } else if (!allow) {
            this.dataO.passConstraints.screenshotEligibility = "INELEGIBLE"
        }
    }

    setCallback(url: string) {
        this.dataC.callbackOptions.url = url;
    }

    setNfcConstraint(blockPayment: boolean, blockTransitCard: boolean) {
        if(!blockPayment && !blockTransitCard) {
            this.dataO.passConstraints.nfcConstraint = ["NFC_CONSTRAINT_UNSPECIFIED"];
        }

        if(blockPayment && !blockTransitCard) {
            this.dataO.passConstraints.nfcConstraint = ["BLOCK_PAYMENT"];
        }

        if(!blockPayment && blockTransitCard) {
            this.dataO.passConstraints.nfcConstraint = ["BLOCK_CLOSED_LOOP_TRANSIT"];
        }

        if(blockPayment && !blockTransitCard) {
            this.dataO.passConstraints.nfcConstraint = ["BLOCK_PAYMENT", "BLOCK_CLOSED_LOOP_TRANSIT"];
        }
    }
}


interface OneItem {
    "oneItem": {
        "item": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>
            }
        }
    }
}

interface TwoItems {
    "twoItems": {
        "startItem": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>
            }
        },
        "endItem": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>
            }
        }
    }
}

interface ThreeItems {
    "threeItems": {
        "startItem": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>
            },
        },
        "middleItem": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>,
            },
        },
        "endItem": {
            "firstValue": {
                "fields": Array<{
                    "fieldPath": string;
                }>,
            },
        },
    }
}

interface DetailsItem {
    "item": {
        "firstValue": {
            "fields": Array<{
                "fieldPath": string;
            }>
        }
    }
}

interface TextItem_Localized {
    id: string;
    localizedHeader: LocalizedString;
    localizedBody: LocalizedString;
}

interface TextItem_Unlocalized {
    id: string;
    header: string;
    body: string;
}

export interface TextRow {
    type: "oneItem" | "twoItems" | "threeItems";
    items: Array<RowItem>;
}

export interface RowItem {
    location: "start" | "middle" | "end";
    item: Text;
}

export interface Text {
    id: string;
    header: string | LocalizedString;
    body: string | LocalizedString;
}

export interface Detail {
    id: string;
    header: string | LocalizedString;
    body: string | LocalizedString;
}

export {
    GenericPass as Pass
}
