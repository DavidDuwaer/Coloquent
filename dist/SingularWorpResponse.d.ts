import { WorpResponse } from "./WorpResponse";
import { Model } from "./Model";
import { JsonApiDoc } from "./JsonApiDoc";
export declare class SingularWorpResponse<T extends Model> extends WorpResponse<T> {
    protected data: T;
    getData(): T;
    protected makeModelIndex(doc: JsonApiDoc): void;
    protected indexRequestedDocs(doc: JsonApiDoc): void;
    protected makeDataArray(doc: JsonApiDoc): void;
}
