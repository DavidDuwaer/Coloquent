import {WorpResponse} from "./WorpResponse";
import {Model} from "./Model";
import {JsonApiDoc} from "./JsonApiDoc";
import {JsonApiResponseBody} from "./JsonApiResponseBody";

export class SingularWorpResponse extends WorpResponse
{
    protected data: Model;

    private dataComesAsArray: boolean;

    constructor(modelType: typeof Model, responseBody: JsonApiResponseBody, dataComesAsArray: boolean = false) {
        super(modelType, responseBody);
        this.dataComesAsArray = dataComesAsArray;
    }

    public getData(): Model
    {
        return this.data;
    }

    protected makeModelIndex(data: JsonApiDoc|JsonApiDoc[]): void
    {
        let doc: JsonApiDoc = null;
        if (this.dataComesAsArray) {
            let doc = data[0];
        } else {
            let doc = data;
        }
        this.indexAsModel(doc, this.modelType);
    }

    protected indexRequestedDocs(data: JsonApiDoc|JsonApiDoc[])
    {
        let doc: JsonApiDoc = null;
        if (this.dataComesAsArray) {
            let doc = data[0];
        } else {
            let doc = data;
        }
        this.indexDoc(doc);
    }

    protected makeDataArray(data: JsonApiDoc|JsonApiDoc[]): void
    {
        let doc: JsonApiDoc = null;
        if (this.dataComesAsArray) {
            let doc = data[0];
        } else {
            let doc = data;
        }
        this.data = this.modelIndex.get(doc.type).get(doc.id);
    }
}