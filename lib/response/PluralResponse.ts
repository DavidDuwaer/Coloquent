import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {JsonApiDoc} from "../JsonApiDoc";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {AxiosResponse} from "axios";

export class PluralResponse extends RetrievalResponse
{
    protected data: Model[];

    protected pageNumber: number;

    constructor(
        axiosResponse: AxiosResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody,
        pageNumber: number = 1
    ) {
        super(axiosResponse, modelType, responseBody);
        this.pageNumber = pageNumber;
    }

    public getPageNumber(): number
    {
        return Math.max(this.pageNumber, 1);
    }

    public getData(): Model[]
    {
        return this.data;
    }

    protected indexRequestedDocs(requestedDocs: JsonApiDoc[] = [])
    {
        for (let doc of requestedDocs) {
            this.indexDoc(doc);
        }
    }

    protected makeModelIndex(requestedDocs: JsonApiDoc[] = []): void
    {
        for (let doc of requestedDocs) {
            this.indexAsModel(doc, this.modelType);
        }
    }

    protected makeDataArray(requestedDocs: JsonApiDoc[] = [])
    {
        this.data = [];
        for (let doc of requestedDocs) {
            this.data.push(
                this.modelIndex.get(doc.type).get(doc.id)
            );
        }
    }
}