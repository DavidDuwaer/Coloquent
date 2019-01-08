import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {Resource} from "../Resource";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";

export class PluralResponse extends RetrievalResponse
{
    protected data: Model[];

    protected pageNumber: number;

    constructor(
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody,
        pageNumber: number = 1
    ) {
        super(httpClientResponse, modelType, responseBody);
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

    protected indexRequestedResources(requestedResources: Resource[] = [])
    {
        for (let doc of requestedResources) {
            this.indexDoc(doc);
        }
    }

    protected makeModelIndex(requestedResources: Resource[] = []): void
    {
        for (let doc of requestedResources) {
            this.indexAsModel(doc, this.modelType);
        }
    }

    protected makeDataArray(requestedDocs: Resource[] = [])
    {
        this.data = [];
        for (let doc of requestedDocs) {
            this.data.push(
                this.modelIndex.get(doc.type).get(doc.id)
            );
        }
    }
}
