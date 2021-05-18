import {RetrievalResponse} from "./RetrievalResponse";
import {Model} from "../Model";
import {Resource} from "../Resource";
import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export class SingularResponse<M extends Model = Model> extends RetrievalResponse<M>
{
    protected data: M | null;

    constructor(
        query: Query,
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody
    ) {
        super(query, httpClientResponse, modelType, responseBody);
    }

    public getData(): M | null
    {
        return this.data;
    }

    protected makeModelIndex(data: Resource | Resource[] | null | undefined): void
    {
        const doc: Resource | null = Array.isArray(data)
            ?
            SingularResponse.coalesceUndefinedIntoNull(data[0])
            :
            SingularResponse.coalesceUndefinedIntoNull(data);
        if (doc) {
            this.indexAsModel(doc, this.modelType, this.includeTree);
        }
    }

    protected indexRequestedResources(data: Resource | Resource[] | null | undefined)
    {
        const doc: Resource | null = Array.isArray(data)
            ?
            SingularResponse.coalesceUndefinedIntoNull(data[0])
            :
            SingularResponse.coalesceUndefinedIntoNull(data);
        if (doc) {
            this.indexDoc(doc);
        }
    }

    protected makeDataArray(data: Resource | Resource[] | null | undefined): void
    {
        const doc: Resource | null = Array.isArray(data)
            ?
            SingularResponse.coalesceUndefinedIntoNull(data[0])
            :
            SingularResponse.coalesceUndefinedIntoNull(data);
        if (doc !== null)
        {
            this.data = this.modelIndex.get(doc.type).get(doc.id);
        }
        else
        {
            this.data = null;
        }
    }
}
