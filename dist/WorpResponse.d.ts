import { JsonApiResponseBody } from "./JsonApiResponseBody";
import { JsonApiDoc } from "./JsonApiDoc";
import { Model } from "./Model";
import { Map } from "./util/Map";
export declare abstract class WorpResponse<T extends Model> {
    protected prototype: Model;
    protected T: string;
    protected docIndex: Map<Map<JsonApiDoc>>;
    protected modelIndex: Map<Map<Model>>;
    protected included: Model[];
    constructor(prototype: Model, responseBody: JsonApiResponseBody);
    abstract getData(): any;
    getIncluded(): Model[];
    protected abstract makeModelIndex(requested: any): void;
    private indexIncludedDocs(includedDocs);
    protected abstract indexRequestedDocs(requested: any): any;
    protected indexDoc(doc: JsonApiDoc): void;
    protected indexAsModel(doc: JsonApiDoc, modelType: any): Model;
    protected abstract makeDataArray(requestedDocs: any): void;
    protected makeIncludedArray(includedDocs: JsonApiDoc[]): void;
}
