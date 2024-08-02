// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import fetch from 'node-fetch';
import * as os from "os";
import * as path from "path";
export namespace GeneralUtils {
    const apiCenterFolder = ".api-center";

    export async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    export interface Succeeded<T> {
        readonly succeeded: true;
        readonly result: T;
    }

    export interface Failed {
        readonly succeeded: false;
        readonly error: string;
    }

    export type Errorable<T> = Succeeded<T> | Failed;

    export function succeeded<T>(e: Errorable<T>): e is Succeeded<T> {
        return e.succeeded;
    }

    export function failed<T>(e: Errorable<T>): e is Failed {
        return !e.succeeded;
    }

    export function errMap<T, U>(e: Errorable<T>, fn: (t: T) => U): Errorable<U> {
        if (failed(e)) {
            return { succeeded: false, error: e.error };
        }
        return { succeeded: true, result: fn(e.result) };
    }

    export function getErrorMessage(error: unknown) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }

    export function bindAsync<T, U>(e: Errorable<T>, fn: (t: T) => Promise<Errorable<U>>): Promise<Errorable<U>> {
        if (failed(e)) {
            return Promise.resolve(e);
        }
        return fn(e.result);
    }

    export function getApiCenterWorkspacePath(): string {
        return path.join(os.homedir(), apiCenterFolder);
    }

    export async function fetchDataFromLink(link: string): Promise<string> {
        try {
            const res = await fetch(link);
            const rawData = await res.json();
            return JSON.stringify(rawData);
        }
        catch (err) {
            throw err;
        }
    }
}
