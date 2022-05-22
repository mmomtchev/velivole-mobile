import { Platform } from 'react-native';

import * as SQLite from 'expo-sqlite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import i18n from 'i18n-js';

import ServerAPI, { GeoJSONCollection, GeoJSONFeature } from './server';

export function siteName(site: GeoJSONFeature): string {
    return site.properties.n + (site.properties.s ? ` : ${site.properties.s}` : '');
}

export interface IGeoDB {
    op: number;
    search(text: string): Promise<GeoJSONFeature[]>;
    all(): Promise<GeoJSONFeature[]>;
    load(): Promise<void>;
    add(item: GeoJSONFeature): Promise<void>;
    delete(item: GeoJSONFeature): Promise<void>;
}

export class GeoDB implements GeoDB {
    db: SQLite.WebSQLDatabase;
    table: string;
    op: number;

    constructor(table: string) {
        this.db = SQLite.openDatabase('geo.db', '1.0.0', 'database');
        this.table = table;
        this.op = 0;
    }

    exec(query: string, args?: unknown[], rw?: boolean): Promise<(SQLite.ResultSet)[]> {
        return new Promise((resolve, reject) => {
            this.db.exec([{ sql: query, args: args || [] }], false, (error, result) => {
                this.op++;
                if (error) reject(error);
                resolve((result || []) as SQLite.ResultSet[]);
            });
        });
    }

    async load() {
        const last = parseInt(await AsyncStorage.getItem(`@lastUpdate_${this.table}`).catch(() => undefined) || '0');
        if (last + 1000 * 3600 * 2 < Date.now()) {
            Toast.show(i18n.t('Updating sites'), { duration: Toast.durations.LONG });
            console.debug(`Updating GeoDB ${this.table}`);
            const geojson = await ServerAPI.getDB(this.table);
            await this.inject(geojson);
            Toast.show(i18n.t('Sites updated'), { duration: Toast.durations.LONG });
            console.debug(`GeoDB ${this.table} updated`);

            AsyncStorage.setItem(`@lastUpdate_${this.table}`, JSON.stringify(Date.now()));
        }
    }


    async inject(geo: GeoJSONCollection): Promise<void> {
        await this.exec(`DROP TABLE IF EXISTS ${this.table};`, [], true);
        await this.exec(`CREATE TABLE IF NOT EXISTS ${this.table} (n TEXT, s TEXT, t TEXT, o TEXT, lng NUMBER, lat NUMBER);`, [], true);
        for (const item of geo.features) {
            if (!item.geometry) continue;
            await this.exec(`INSERT INTO ${this.table} (n, s, t, o, lng, lat) VALUES (?, ?, ?, ?, ?, ?);`,
                [
                    item.properties.n,
                    item.properties.s,
                    item.properties.t,
                    item.properties.o,
                    item.geometry.coordinates[0],
                    item.geometry.coordinates[1]
                ], true);
        }
    }

    async all(): Promise<GeoJSONFeature[]> {
        return this.search('');
    }

    async add(item: GeoJSONFeature): Promise<void> {
        await this.exec(`CREATE TABLE IF NOT EXISTS ${this.table} (n TEXT, s TEXT, t TEXT, o TEXT, lng NUMBER, lat NUMBER);`, [], true);
        await this.exec(`INSERT INTO ${this.table} (n, s, t, o, lng, lat) VALUES (?, ?, ?, ?, ?, ?);`,
            [
                item.properties.n,
                item.properties.s,
                item.properties.t,
                item.properties.o,
                item.geometry.coordinates[0],
                item.geometry.coordinates[1]
            ], true);
    }

    async search(text: string): Promise<GeoJSONFeature[]> {
        const r: GeoJSONFeature[] = [];
        const pattern = `%${text}%`;
        const db = await this.exec(`SELECT rowid, n, s, t, o, lng, lat FROM ${this.table} WHERE n LIKE ? OR s LIKE ?;`, [pattern, pattern]);
        if (!db[0].rows) return r;
        for (const row of db[0].rows) {
            r.push({
                type: 'Feature',
                id: row.rowid,
                properties: {
                    n: row.n, s: row.s, t: row.t, o: row.o
                },
                geometry: {
                    type: 'Point',
                    coordinates: [row.lng, row.lat]
                }
            });
        }
        return r;
    }

    async delete(item: GeoJSONFeature): Promise<void> {
        await this.exec(`DELETE FROM ${this.table} WHERE rowid=?;`, [item.id]);
    }
}

export function init(name: string): IGeoDB {
    console.debug('init', name);

    if (Platform.OS === 'web') {
        // Used only in web debug mode, requires geodata from velivole.fr
        // It avoids relying on SQLite on PC
        const mapping: Record<string, string> = {
            launch_sites: 'launch',
            airport_sites: 'airport',
            towns: 'place',
            favorites: 'launch'
        };
        if (name !== 'favorites') {
            const mock: IGeoDB = {
                op: 0,
                search: (query: string) => fetch(`http://localhost:8008/search/${mapping[name]}/${query}`)
                    .then((r) => r.json()),
                all: () => Promise.resolve([]),
                load: () => Promise.resolve(undefined),
                add: () => Promise.resolve(undefined),
                delete: () => Promise.resolve(undefined)
            };
            return mock;
        }
        const data: GeoJSONFeature[] = [];
        let uid = 0;
        const mock: IGeoDB = {
            op: uid,
            all: () => Promise.resolve(data),
            search: () => Promise.resolve(data),
            load: () => Promise.resolve(undefined),
            add: (item: GeoJSONFeature) => {
                data.push({...item, id: uid++});
                return Promise.resolve(undefined);
            },
            delete: (item: GeoJSONFeature) => {
                data.splice(data.findIndex((i) => i.id === item.id), 1);
                return Promise.resolve(undefined);
            }
        };
        return mock;

    }

    return new GeoDB(name);
}
