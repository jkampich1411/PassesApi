import * as google from 'google-auth-library';
import { sign as JwtSign } from 'jsonwebtoken';

const URL_PREFIX = "https://walletobjects.googleapis.com/walletobjects/v1/";
const SCOPES = [
    "https://www.googleapis.com/auth/wallet_object.issuer"
];

const images: any = {
    "austrian airlines": {
        "hero": "https://www.dropbox.com/s/ashagvo9r45ttf7/austrian-airlines-logo.png?dl=1",
        "logo": "https://www.dropbox.com/s/zxkg92plt3wx65j/austrian-airlines-icon.png?dl=1"
    }
};

class Setup {
    google_client: any;
    issuer_id: string | number;
    credentials: any;

    constructor(credentials: any, issuerId: string | number) {
        this.google_client = new google.GoogleAuth({
            scopes: SCOPES,
            credentials: credentials
        });

        this.issuer_id = issuerId

        this.credentials = credentials;
    }
}

class Pass {
    _objectId = ""
    _object_template: any = {}
    _objectUrl = ""

    _classId = ""
    _class_template: any = {}
    _classUrl = ""

    _postable = true

    _init: Setup;

    constructor(objectUrl: string, classUrl: string, setup: Setup) {
        this._objectUrl = objectUrl;
        this._classUrl = classUrl;

        this._init = setup
    }

    getFinalObjects() {
        if(this._class_template["id"] && this._class_template["id"] !== "") {
            return {
                "class": this._class_template,
                "object": this._object_template
            }
        } else {
            return {
                "object": this._object_template
            }
        }
    }

    createJwt() {
        return JwtSign({
            "iss": this._init.credentials.client_email,
            "aud": "google",
            "origins": ["https://apis.jkdev.run/"],
            "typ": "savetowallet",
            "payload": {
                "genericObjects": [{ "id": this._objectId }]
            }
        }, this._init.credentials.private_key, { algorithm: "RS256" })
    }

    getId() {
        return this._objectId
    }

    saveUrl() {
        return `https://pay.google.com/gp/v/save/${this.createJwt()}`
    }

    async admitObjToGoogle(performPut = false) {
        let resp;

        if(this._postable === false) performPut = true;
        
        if(performPut) {
            resp = await this._init.google_client.request({
                url: `${this._objectUrl}/${this._objectId}`,
                method: "PUT",
                data: this._object_template
            });
            return;
        };
        
        try {
            resp = await this._init.google_client.request({
                url: `${this._objectUrl}/${this._objectId}`,
                method: "GET",
            });
        } catch (error: any) {
            resp = error.response;

            if (resp && resp.status === 404) {

                resp = await this._init.google_client.request({
                    url: this._objectUrl,
                    method: "POST",
                    data: this._object_template
                });
            }
        }

        return resp;
    }

    async admitClsToGoogle(performPut = false) {
        let resp;

        if(this._postable === false) performPut = true;
        
        if(performPut) {
            resp = await this._init.google_client.request({
                url: `${this._classUrl}/${this._classId}`,
                method: "PUT",
                data: this._class_template
            });
            return;
        };
        
        try {
            resp = await this._init.google_client.request({
                url: `${this._classUrl}/${this._classId}`,
                method: "GET",
            });
        } catch (error: any) {
            resp = error.response;

            if (resp && resp.status === 404) {

                resp = await this._init.google_client.request({
                    url: this._classUrl,
                    method: "POST",
                    data: this._class_template
                });
            }
        }

        return resp;
    }

}

class BoardingPass extends Pass {
   _object_template: any = {
        "passengerName": "",
        "boardingAndSeatingInfo": {
            "boardingGroup": "",
            "seatNumber": "",
            "seatClass": "",
            "seatAssignment": {} // LocalizedString!
        },
        "reservationInfo": {
            "confirmationCode": "",
            "frequentFlyerInfo": {
                "frequentFlyerProgramName": {}, // LocalizedString!
                "frequentFlyerNumber": ""
            }
        },
        "hexBackgroundColor": "",
        "id": "",
        "classId": "",
        "state": "active",
        "barcode": {
            "type": "",
            "value": "",
            "alternateText": ""
        }
    }

   _class_template: any = {
        "localScheduledDepartureDateTime": "", // IN UTCTIME
        "localBoardingDateTime": "", // IN UTCTIME
        "flightHeader": {
            "carrier": {
                "carrierIataCode": "",
                "airlineName": {}, // LocalizedString!!
                "airlineLogo": {} // Image!!
            },
            "flightNumber": "",
            "operatingCarrier": {
                "carrierIataCode": "",
                "airlineName": {}, // LocalizedString!!
                "airlineLogo": {} // Image!!
            },
            "operatingFlightNumber": "",
            "flightNumberDisplayOverride": ""
        },
        "origin": {
            "airportIataCode": "",
            "terminal": "",
            "gate": ""
        },
        "destination": {
            "airportIataCode": "",
            "terminal": "",
            "gate": ""
        },
        "locations": [],
        "flightStatus": "FLIGHT_STATUS_UNSPECIFIED",
        "id": "",
        "issuerName": "", // This equiv to airlineName
        "reviewStatus": "UNDER_REVIEW",
        "heroImage": {}, // Image!!
        "hexBackgroundColor": ""
    }

    _className
    dataC
    dataO

    constructor(uid: string, setup: Setup) {
        let url = URL_PREFIX + 'flightObject';
        let classUrl = URL_PREFIX + 'flightClass';

        super(url, classUrl, setup);

        this._className = `${uid.replace(/[^\w.-]/g, '_').replace(/([\.])/g, '_')}`;
        this._objectId = `${this._init.issuer_id}.${uid.replace(/[^\w.-]/g, '_').replace(/([\.])/g, '_')}`
        this._classId = `${this._init.issuer_id}.${this._className}`
        
        this.dataC = this._class_template;
        this.dataC.id = this._classId;
        
        this.dataO = this._object_template;
        this.dataO.classId = `${this._init.issuer_id}.${this._className}`
        this.dataO.id = this._objectId
    }

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
            
            that._class_template = classD;
            that._object_template = objecD;

            that._postable = false;

            return that;

        } catch (e: any) {
            let r = e.response;

            if(r && r.status === 404) {
                return false;
            }
        }
    }

    prepare(data: BoardingPass_Pass) {
        this.setBarcode(data["barcode"]);
        // Barcode set!

        this.dataO.hexBackgroundColor = data["bgcolor"];
        this.dataC.hexBackgroundColor = data["bgcolor"];
        // Background color set!

        this.dataO.passengerName = data["person"]["name"];
        // Passenger name set!

        this.setBrdStnInfo(data["flight"]);
        // Boarding Seating Info set!

        this.setReservInfo(data["person"]);
        // Reservation Info set!

        this.setDepartTime(data["flight"]);
        // Local Scheduled Departure set!

        this.setBoardingTime(data["flight"]);
        // Boarding Time set!

        this.setCarrier(data["flight"]);
        // Carrier set!

        this.setOrigin(data["flight"]);
        // Origin set!

        this.setDestination(data["flight"]);
        // Destination set!

        this.setHeroImage(data["flight"]["carrier_label"]);
        // Hero Image set!

        this.dataC["issuerName"] = data["flight"]["carrier_label"];
        // Airline name set!

        this.setLocations(data["locations"]);
    }

    setBarcode(barcode: Barcode) {
        this.dataO.barcode["type"] = barcode["format"];
        this.dataO.barcode["value"] = barcode["message"];
        this.dataO.barcode["alternateText"] = barcode["altText"];
    }
    
    setBrdStnInfo(flight: Partial<BoardingPass_Flight>) {
        let brdstn = this.dataO.boardingAndSeatingInfo;

        brdstn["boardingGroup"] = flight["boarding_group"];
        brdstn["seatClass"] = flight["class"];

        let hasSeat = !isNaN(Number(flight["seat"].substring(0, 1)));

        if(!hasSeat) {

            let trnslt = Langs.genLocalString([
                    {"language": "en", "value": "assigned at gate"},
                    {"language": "de", "value": "am Gate zugewiesen"},
                    {"language": "fr", "value": "assigné à la porte"},
                    {"language": "it", "value": "assegnato alla porta"}
                ],
                {"language": "en", "value": "assigned at gate"}
            )

            brdstn.seatAssignment = trnslt;
            brdstn.seatNumber = undefined;

            return
        }

        brdstn["seatNumber"] = flight["seat"];
        delete brdstn["seatAssignment"];
    }
    
    setReservInfo(person: Partial<BoardingPass_Person>) {
        let reserv = this.dataO.reservationInfo;

        reserv["confirmationCode"] = person["reference"];

        if(person["ff_program"] === "" || person["ff_number"]) {
            delete reserv.frequentFlyerInfo;
            return;
        }

        let trnslt = Langs.genLocalString(
            [{"language": "en", "value": person["ff_program"]}],
            {"language": "en", "value": person["ff_program"]}
        )

        reserv.frequentFlyerInfo["frequentFlyerProgramName"] = trnslt;
        reserv.frequentFlyerInfo["frequentFlyerNumber"] = person["ff_number"];
    }
    
    setDepartTime(flight: Partial<BoardingPass_Flight>) {
        let depTimeUtc = new Date(flight["departure_time_utc"]);
        let depTime = flight["departure_time"];
        let depHour = depTime.split(":")[0];
        let depMin = depTime.split(":")[1];

        let departDate = new Date();
        departDate.setDate(depTimeUtc.getDate());
        departDate.setMonth(depTimeUtc.getMonth());
        departDate.setFullYear(depTimeUtc.getFullYear());
        departDate.setHours(Number(depHour));
        departDate.setMinutes(Number(depMin));
        departDate.setSeconds(0);
        departDate.setMilliseconds(0);

        let monthPlusOne: string | number = departDate.getMonth() + 1;
        if(monthPlusOne < 10) {
            monthPlusOne = `0${monthPlusOne}`;
        }

        let day: string | number = departDate.getDate();
        if(day < 10) {
            day = `0${day}`;
        }

        let hour: string | number = departDate.getHours();
        if(hour < 10) {
            hour = `0${hour}`;
        }

        let min: string | number = departDate.getMinutes();
        if(min < 10) {
            min = `0${min}`;
        }

        let tempIso = [
            departDate.getFullYear(), "-",
            monthPlusOne, "-",
            day, "T",
            hour, ":",
            min, ":",
            "00.000"
        ];

        this.dataC.localScheduledDepartureDateTime = tempIso.join("");
    }
    
    setBoardingTime(flight: Partial<BoardingPass_Flight>) {
        let depTime = new Date(flight["departure_time_utc"]);
        let brdTime = flight["boarding_time"];
        let brdHour = brdTime.split(":")[0];
        let brdMin = brdTime.split(":")[1];

        let boardingDate = new Date();
        boardingDate.setDate(depTime.getDate());
        boardingDate.setMonth(depTime.getMonth());
        boardingDate.setFullYear(depTime.getFullYear());
        boardingDate.setHours(Number(brdHour));
        boardingDate.setMinutes(Number(brdMin));
        boardingDate.setSeconds(0);
        boardingDate.setMilliseconds(0);

        let monthPlusOne: string | number = boardingDate.getMonth() + 1;
        if(monthPlusOne < 10) {
            monthPlusOne = `0${monthPlusOne}`;
        }

        let day: string | number = boardingDate.getDate();
        if(day < 10) {
            day = `0${day}`;
        }

        let hour: string | number = boardingDate.getHours();
        if(hour < 10) {
            hour = `0${hour}`;
        }

        let min: string | number = boardingDate.getMinutes();
        if(min < 10) {
            min = `0${min}`;
        }

        let tempIso = [
            boardingDate.getFullYear(), "-",
            monthPlusOne, "-",
            day, "T",
            hour, ":",
            min, ":",
            "00.000"
        ];

        this.dataC.localBoardingDateTime = tempIso.join("");
    }
    
    setCarrier(flight: Partial<BoardingPass_Flight>) {
        this.dataC.flightHeader["flightNumber"] = flight["flightnumber"]
        this.dataC.flightHeader["operatingFlightNumber"] = flight["flightnumber"]

        this.dataC.flightHeader["flightNumberDisplayOverride"] = flight["flightnumber_label"]

        let airLnLogo = WalletImage.generate(images[flight["carrier_label"].toLowerCase()]["logo"],
            [{"language": "en", "value": flight["carrier_label"] + " Logo Image"}],
            {"language": "en", "value": flight["carrier_label"] + " Logo Image"}
        );

        let airLnName = Langs.genLocalString(
            [{"language": "en", "value": flight["carrier_label"]}],
            {"language": "en", "value": flight["carrier_label"]}
        );

        let carrier = this.dataC.flightHeader["carrier"];
        carrier["carrierIataCode"] = flight["carrier"]
        carrier["airlineLogo"] = airLnLogo;
        carrier["airlineName"] = airLnName;

        this.dataC.flightHeader["operatingCarrier"] = carrier;

        return;
    }

    setOrigin(flight: Partial<BoardingPass_Flight>) {
        this.dataC.origin["airportIataCode"] = flight["from_to"][0]["short"];

        let ter = flight["departure_terminal"];
        if (ter === "") {
            ter = "...."
        } else {
            ter = ter.split(" ")[1];
        }

        this.dataC.origin["terminal"] = ter;
        this.dataC.origin["gate"] = flight["gate"];
    }

    setDestination(flight: Partial<BoardingPass_Flight>) {
        this.dataC.destination["airportIataCode"] = flight["from_to"][1]["short"];
    }
    
    setHeroImage(carrier_label: string) {
        let heroImage = WalletImage.generate(images[carrier_label.toLowerCase()]["hero"], 
            [{"language": "en", "value": carrier_label + " Hero Image"}],
            {"language": "en", "value": carrier_label + " Hero Image"}
        )

        this.dataC.heroImage = heroImage;
    }

    setLocations(loc: Array<Location>) {
        loc.forEach(each => {
            let loc = {
                "latitude": each["latitude"],
                "longitude": each["longitude"],
            }
            this.dataC["locations"].push(loc);
        });
    }
}


// How to make an image
// () => {
//     let image = WalletImage.generate("<url>", [
//             {"language": "en", "value": "Image Description"},
//             {"language": "de", "value": "Bildbeschreibung"},
//             {"language": "fr", "value": "Description de l'image"},
//             {"language": "it", "value": "Descrizione dell'immagine"}
//         ],
//         {"language": "en", "value": "Image Description"}
//     );

//     console.log(image);
//     return image;
// }

// How to make an LocalizedString
// () => {
//     let localizedString = Langs.genLocalString([
//             {"language": "en", "value": "Localized String value for English"},
//             {"language": "de", "value": "Localized String value for German"},
//             {"language": "fr", "value": "Localized String value for French"},
//             {"language": "it", "value": "Localized String value for Italian"}
//         ],
//         {"language": "en", "value": "Localized String value for English"}
//     );

//     console.log(localizedString);
//     return localizedString;
// }

abstract class WalletImage {
    static generate = (imageUrl: string, translations: Array<TranslatedString>, defaultText: TranslatedString) => {
        return {
            "sourceUri": { "uri": imageUrl },
            "contentDescription": Langs.genLocalString(translations, defaultText)
        }
    }
}

abstract class Langs {
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

interface LocalizedString {
    translatedValues: Array<TranslatedString> | [];
    defaultValue: TranslatedString;
}

interface TranslatedString {
    language: "en" | "de" | "fr" | "it";
    value: string;
}

export interface Barcode {
    format: "AZTEC";
    altText: string;
    message: string;
}

export interface Location {
    latitude: Number;
    longitude: Number;
    relevantText: string;
}




export interface BoardingPass_Pass {
    boardingIdentifier: string;
    bgcolor: string;
    locations: Array<Location>;

    flight: BoardingPass_Flight;
    person: BoardingPass_Person;
    barcode: Barcode;

    backFields: any;
}

export interface BoardingPass_Person {
    name: string;
    ff_program: string;
    ff_number: string;
    reference: string;
}

export interface BoardingPass_Flight {
    carrier: string;
    carrier_label: string;

    flightnumber: string;
    flightnumber_label: string;

    date: string;
    boarding_group: string;
    boarding_time: string;
    departure_time: string;
    departure_time_utc: string;

    departure_terminal: string;
    gate: string;
    from_to: Array<{ "short": string, "long": string }>;

    class: string;
    seat: string;
}

export {
    BoardingPass,

    Setup
}