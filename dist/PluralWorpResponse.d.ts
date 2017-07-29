import { WorpResponse } from "./WorpResponse";
import { Model } from "./Model";
import { JsonApiDoc } from "./JsonApiDoc";
export declare class PluralWorpResponse<T extends Model> extends WorpResponse<T> {
    protected data: T[];
    getData(): T[];
    protected indexRequestedDocs(requestedDocs: JsonApiDoc[]): void;
    protected makeModelIndex(requestedDocs: JsonApiDoc[]): void;
    protected makeDataArray(requestedDocs: JsonApiDoc[]): void;
}
