import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {JsonApiDoc} from "../JsonApiDoc";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {AxiosResponse} from "axios";

export class SingularResponse extends RetrievalResponse
{
    protected data: Model;

    constructor(
        axiosResponse: AxiosResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody
    ) {
        super(axiosResponse, modelType, responseBody);
    }

    public getData(): Model
    {
        return this.data;
    }

    protected makeModelIndex(data: JsonApiDoc|JsonApiDoc[]): void
    {
        let doc: JsonApiDoc = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.indexAsModel(doc, this.modelType);
        }
    }

    protected indexRequestedDocs(data: JsonApiDoc|JsonApiDoc[])
    {
        let doc: JsonApiDoc = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.indexDoc(doc);
        }
    }

    protected makeDataArray(data: JsonApiDoc|JsonApiDoc[]): void
    {
        let doc: JsonApiDoc = null;
        if (Array.isArray(data)) {
            doc = data[0];
        } else {
            doc = data;
        }
        if (doc) {
            this.data = this.modelIndex.get(doc.type).get(doc.id);
        }
    }
}