import i18n from 'i18n-js';
import { config } from './config';

export type Ad = {
    ad_id: number;
    ad_img: string;
    ad_url: string;
    ad_weight: number;
};

export type GeoJSONProperties = {
    n: string;
    s?: string;
    t?: string;
    w?: string;
    o?: string;
    f?: string;
    d?: number;
};

export type GeoJSONFeature = {
    type: 'Feature';
    id?: number;
    properties: GeoJSONProperties;
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
};

export type GeoJSONCollection = {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
};


export default class ServerAPI {
    static terminal = '';

    static get(url: string): Promise<Record<string, unknown>> {
        return fetch(ServerAPI.getUrl(url), {
            mode: 'cors'
        })
            .then((r) => r.json());
    }

    static getUrl(url: string): string {
        return `https://data.velivole.fr/${url}`;
    }

    static getAd(): Promise<Ad> {
        return ServerAPI.get(`user/_a_d_/get/0/${config.terminal}`) as Promise<Ad>;
    }

    static getDB(db: string): Promise<GeoJSONCollection> {
        return ServerAPI.get(`data/${db}.min.geojson`) as Promise<GeoJSONCollection>;
    }

    static geoResolve(db: string, lng: number, lat: number): Promise<GeoJSONProperties> {
        return ServerAPI.get(`geo/locate/${db}/${lng}/${lat}`)
            .then((r) => {
                if (r.d === undefined || r.d as number > 5000)
                    throw new Error(i18n.t('Not found'));
                return r as GeoJSONProperties;
            });
    }
}
