import { LoaderContext } from "webpack";
import { Schema } from "schema-utils/declarations/validate";
export interface Layer {
    path?: string;
    name: string;
}
export interface LoaderOptions {
    layers: Layer[];
}
export declare const OPTIONS_SCHEMA: Schema;
export default function (this: LoaderContext<LoaderOptions>, source: string): string;
