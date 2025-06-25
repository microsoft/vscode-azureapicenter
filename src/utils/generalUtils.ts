// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import axios from 'axios';
import * as os from "os";
import * as path from "path";
import { UiStrings } from '../uiStrings';
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

    export function getTemplatesFolder(): string {
        return path.join(__dirname, "..", "templates");
    }

    export async function fetchDataFromLink(link: string): Promise<string> {
        const res = await axios.get(link);
        return JSON.stringify(res.data);
    }

    export function validateInputForTitle(value: string) {
        if (!value) {
            return UiStrings.ValueNotBeEmpty;
        }
        if (!/[a-zA-Z0-9]/.test(value)) {
            return UiStrings.ValueMustContainLetterOrNumber;
        }
    }

    export function validateURI(value: string) {
        try {
            new URL(value);
            return null; // Valid URL
        } catch (e) {
            return UiStrings.ValidUrlStart; // Invalid URL
        }
    }
}
