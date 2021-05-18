import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {Resource} from "../Resource";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class PluralResponse<M extends Model = Model> extends RetrievalResponse<M>
{
    protected data: M[];

    protected pageNumber: number;

    protected limit: number | undefined;

    constructor(
        query: Query,
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody,
        pageNumber: number = 1
    ) {
        super(query, httpClientResponse, modelType, responseBody);
        this.pageNumber = pageNumber;
        this.limit = query.getLimit();
    }

    public getPageNumber(): number
    {
        return Math.max(this.pageNumber, 1);
    }

    public getData(): M[]
    {
        if (this.limit !== undefined && Array.isArray(this.data)){
            return this.data.slice(0, this.limit);
        } else {
            return this.data;
        }
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
            this.indexAsModel(doc, this.modelType, this.includeTree);
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
