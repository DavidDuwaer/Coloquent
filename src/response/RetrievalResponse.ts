import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {JsonApiDoc} from "../JsonApiDoc";
import {Model} from "../Model";
import {ToManyRelation} from "../relation/ToManyRelation";
import {JsonApiStub} from "../JsonApiStub";
import {Relation} from "../relation/Relation";
import {ToOneRelation} from "../relation/ToOneRelation";
import {Map} from "../util/Map";
import {Response} from "./Response";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";

export abstract class RetrievalResponse extends Response
{
    protected modelType: any;

    protected docIndex: Map<Map<JsonApiDoc>>;

    protected modelIndex: Map<Map<Model>>;

    protected included: Model[];

    constructor(
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody
    ) {
        super(httpClientResponse);
        this.modelType = modelType;
        this.docIndex = new Map<Map<JsonApiDoc>>();
        this.modelIndex = new Map<Map<Model>>();

        // Index the JsonApiDocs
        this.indexIncludedDocs(responseBody.included);
        this.indexRequestedDocs(responseBody.data);

        // Build Models from the JsonApiDocs, for which the previously built indexes come in handy
        this.makeModelIndex(responseBody.data);

        // Prepare arrays for immediate access through this.getData() and this.getIncluded()
        this.makeDataArray(responseBody.data);
        this.makeIncludedArray(responseBody.included);
    }

    public abstract getData(): any;

    public getIncluded(): Model[]
    {
        return this.included;
    }

    protected abstract makeModelIndex(requested: any): void;

    private indexIncludedDocs(includedDocs: JsonApiDoc[] = []): void
    {
        for (let doc of includedDocs) {
            this.indexDoc(doc);
        }
    }

    protected abstract indexRequestedDocs(requested: any);

    protected indexDoc(doc: JsonApiDoc)
    {
        let type = doc.type;
        let id = doc.id;
        if (!this.docIndex.get(type)) {
            this.docIndex.set(type, new Map<JsonApiDoc>());
        }
        this.docIndex.get(type).set(id, doc);
    }

    protected indexAsModel(doc: JsonApiDoc, modelType): Model
    {
        let type = doc.type;
        let id = doc.id;
        if (!this.modelIndex.get(type)) {
            this.modelIndex.set(type, new Map<Model>());
        }
        let model: Model = new modelType();
        model.populateFromJsonApiDoc(doc);
        this.modelIndex.get(type).set(id, model);
        for (let relationName in doc.relationships) {
            let relation: Relation = model[relationName]();
            if (relation instanceof ToManyRelation) {
                let relatedStubs: JsonApiStub[] = doc.relationships[relationName].data;
                if (relatedStubs) {
                    let r: Model[] = [];
                    for (let stub of relatedStubs) {
                        let relatedDoc: JsonApiDoc = this.docIndex.get(stub.type).get(stub.id);
                        let relatedModel: Model = this.indexAsModel(relatedDoc, relation.getType());
                        r.push(relatedModel);
                    }
                    model.setRelation(relationName, r);
                }
            } else if (relation instanceof ToOneRelation) {
                let stub: JsonApiStub = doc.relationships[relationName].data;
                if (stub) {
                    let typeMap = this.docIndex.get(stub.type);
                    if (typeMap) {
                        let relatedDoc: JsonApiDoc = typeMap.get(stub.id);
                        let relatedModel: Model = this.indexAsModel(relatedDoc, relation.getType());
                        model.setRelation(relationName, relatedModel);
                    }
                }
            } else {
                throw new Error('Unknown type of Relation encountered: ' + typeof relation);
            }
        }
        return model;
    }

    protected abstract makeDataArray(requestedDocs: any): void;

    protected makeIncludedArray(includedDocs: JsonApiDoc[] = [])
    {
        this.included = [];
        for (let doc of includedDocs) {
            this.included.push(
                this.modelIndex.get(doc.type).get(doc.id)
            );
        }
    }
}