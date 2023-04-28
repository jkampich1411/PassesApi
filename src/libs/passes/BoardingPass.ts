import { Pass } from './Pass';
import { Setup } from '../Setup';

import { WalletImage } from '../WalletImage';
import { Langs } from '../Langs';
import { Barcode } from '../types/Barcode';

import { URL_PREFIX } from '../utils';

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
        this.dataO.classId = `${this._init.issuer_id}.${this._className}`;
        this.dataO.id = this._objectId;
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

            that.dataC = classD;
            that.dataO = objecD;

            return that;

        } catch (e: any) {
            let r = e.response;

            if(r && r.status === 404) {
                return false;
            }
        }
    }

    setAirlineName(carrier_label: string) {
        this.dataC["issuerName"] = carrier_label;
    }

    setBackgroundColour(hex: string) {
        this.dataO.hexBackgroundColor = hex;
        this.dataC.hexBackgroundColor = hex;
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
    
    setReservInfo(person: BoardingPass_Person) {
        this.dataO.passengerName = person.name;

        let reserv = this.dataO.reservationInfo;

        reserv["confirmationCode"] = person["reference"];

        if(person["ff_program"] === "" || person["ff_number"] === "" || person["ff_program"] === undefined || person["ff_number"] === undefined || person["ff_program"] === null || person["ff_number"] === null) {
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

    setAirlineLogo(label: string, url: string) {
        let airLnLogo = WalletImage.generate(url,
            [{"language": "en", "value": label + " Logo Image"}],
            {"language": "en", "value": label + " Logo Image"});
            
        this.dataC.flightHeader["carrier"]["airlineLogo"] = airLnLogo;
    }
    
    setCarrier(flight: Partial<BoardingPass_Flight>) {
        this.dataC.flightHeader["flightNumber"] = flight["flightnumber"]
        this.dataC.flightHeader["operatingFlightNumber"] = flight["flightnumber"]

        this.dataC.flightHeader["flightNumberDisplayOverride"] = flight["flightnumber_label"]

        let airLnName = Langs.genLocalString(
            [{"language": "en", "value": flight["carrier_label"]}],
            {"language": "en", "value": flight["carrier_label"]}
        );

        let carrier = this.dataC.flightHeader["carrier"];
        carrier["carrierIataCode"] = flight["carrier"]
        carrier["airlineName"] = airLnName;

        this.dataC.flightHeader["operatingCarrier"] = carrier;

        return;
    }

    setOrigin(flight: Partial<BoardingPass_Flight>) {
        this.dataC.origin["airportIataCode"] = flight["from_to"][0]["short"];
        
        let ter: string | string[] = flight["departure_terminal"];

        if (ter === "") {
            ter = "...."
        } else {
            ter = ter.split(" ");
            ter = ter[ter.length-1];
        }

        this.dataC.origin["terminal"] = ter;
        this.dataC.origin["gate"] = flight["gate"];
    }

    setDestination(flight: Partial<BoardingPass_Flight>) {
        this.dataC.destination["airportIataCode"] = flight["from_to"][1]["short"];
    }
    
    setHeroImage(label: string, url: string) {
        let heroImage = WalletImage.generate(url,
            [{"language": "en", "value": label + " Hero Image"}],
            {"language": "en", "value": label + " Hero Image"});
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
    BoardingPass
}