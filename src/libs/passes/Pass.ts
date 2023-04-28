import { sign as JwtSign } from 'jsonwebtoken';

import { Setup } from "../Setup"

class Pass {
    _objectId = ""
    _object_template: any = {}
    _objectUrl = ""

    _classId = ""
    _class_template: any = {}
    _classUrl = ""

    _postable = true

    _init: Setup;

    _className: string;
    dataC: any;
    dataO: any;

    constructor(objectUrl: string, classUrl: string, setup: Setup) {
        this._objectUrl = objectUrl;
        this._classUrl = classUrl;

        this._init = setup
    }

    getFinalObjects() {
        if(this.dataC["id"] && this.dataC["id"] !== "") {
            return {
                "class": this.dataC,
                "object": this.dataO
            }
        } else {
            return {
                "object": this.dataO
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
                data: this.dataO
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
                    data: this.dataO
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
                data: this.dataC
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
                    data: this.dataC
                });
            }
        }

        return resp;
    }

    async submitAll(performPut = false) {
        await this.admitClsToGoogle(performPut);
        await this.admitObjToGoogle(performPut);
    }

}

export {
    Pass
}