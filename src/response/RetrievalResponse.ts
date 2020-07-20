import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {Resource} from "../Resource";
import {Model} from "../Model";
import {ToManyRelation} from "../relation/ToManyRelation";
import {ResourceStub} from "../ResourceStub";
import {Relation} from "../relation/Relation";
import {ToOneRelation} from "../relation/ToOneRelation";
import {Map} from "../util/Map";
import {Response} from "./Response";
import {AxiosResponse} from "axios";
import {HttpClientResponse} from "../httpclient/HttpClientResponse";
import {Query} from "../Query";

export abstract class RetrievalResponse extends Response
{
    protected modelType: any;

    protected resourceIndex: Map<Map<Resource>>;

    protected modelIndex: Map<Map<Model>>;

    protected included: Resource[];

    constructor(
        query: Query,
        httpClientResponse: HttpClientResponse,
        modelType: typeof Model,
        responseBody: JsonApiResponseBody
    ) {
        super(query, httpClientResponse);
        this.modelType = modelType;
        this.resourceIndex = new Map<Map<Resource>>();
        this.modelIndex = new Map<Map<Model>>();

        // Index the JsonApiDocs
        this.indexIncludedDocs(responseBody.included);
        this.indexRequestedResources(responseBody.data);

        // Build Models from the JsonApiDocs, for which the previously built indexes come in handy
        this.makeModelIndex(responseBody.data);

        // Prepare arrays for immediate access through this.getData() and this.getIncluded()
        this.makeDataArray(responseBody.data);
        this.makeIncludedArray(responseBody.included);
    }

    public abstract getData(): any;

    public getIncluded(): Resource[]
    {
        return this.included;
    }

    protected abstract makeModelIndex(requested: Resource | Resource[] | null | undefined): void;

    private indexIncludedDocs(includedDocs: Resource[] = []): void
    {
        for (let doc of includedDocs) {
            this.indexDoc(doc);
        }
    }

    protected abstract indexRequestedResources(requested: Resource | Resource[] | null | undefined);

    protected indexDoc(doc: Resource)
    {
        let type = doc.type;
        let id = doc.id;
        if (!this.resourceIndex.get(type)) {
            this.resourceIndex.set(type, new Map<Resource>());
        }
        this.resourceIndex.get(type).set(id, doc);
    }

    protected indexAsModel(doc: Resource, modelType, includeTree: any): Model
    {
        let type = doc.type;
        let id = doc.id;
        if (!this.modelIndex.get(type)) {
            this.modelIndex.set(type, new Map<Model>());
        }
        let model: Model = new modelType();
        model.populateFromResource(doc);
        this.modelIndex.get(type).set(id, model);
        for (let resourceRelationName in {...includeTree, ...doc.relationships}) {
            const modelRelationName = this.convertRelationNameToCamelCase(resourceRelationName);

            if (model[modelRelationName] === undefined) {
                continue;
            }

            const includeSubtree = includeTree ? includeTree[resourceRelationName] : {};
            let relation: Relation = model[modelRelationName]();
            if (relation instanceof ToManyRelation) {
                let relatedStubs: ResourceStub[] = (doc.relationships !== undefined && doc.relationships[resourceRelationName] !== undefined)
                    ?
                    doc.relationships[resourceRelationName].data
                    :
                    undefined;
                let r: Model[] = [];
                if (relatedStubs) {
                    for (let stub of relatedStubs) {
                        let relatedDoc: Resource = this.resourceIndex.get(stub.type).get(stub.id);
                        let relatedModel: Model = this.indexAsModel(relatedDoc, relation.getType(), includeSubtree);
                        r.push(relatedModel);
                    }
                }
                model.setRelation(modelRelationName, r);
            } else if (relation instanceof ToOneRelation) {
                let stub: ResourceStub = (doc.relationships !== undefined && doc.relationships[resourceRelationName] !== undefined)
                    ?
                    doc.relationships[resourceRelationName].data
                    :
                    undefined;
                let relatedModel: Model | null = null;
                if (stub) {
                    let typeMap = this.resourceIndex.get(stub.type);
                    if (typeMap) {
                        let relatedDoc: Resource = typeMap.get(stub.id);
                        relatedModel = this.indexAsModel(relatedDoc, relation.getType(), includeSubtree);
                    }
                }
                model.setRelation(modelRelationName, relatedModel);
            } else {
                throw new Error('Unknown type of Relation encountered: ' + typeof relation);
            }
        }
        return model;
    }

    protected abstract makeDataArray(requestedDocs: Resource | Resource[] | null | undefined): void;

    protected makeIncludedArray(includedDocs: Resource[] = [])
    {
        this.included = [];
        for (let doc of includedDocs) {
            const models = this.resourceIndex.get(doc.type);
            if (models !== undefined) {
                this.included.push(models.get(doc.id));
            }
        }
    }

    protected convertRelationNameToCamelCase(relationName: string): string
    {
        return relationName.replace(/-\w/g, (m) => m[1].toUpperCase());
    }

    protected static coalesceUndefinedIntoNull<T>(value: T | undefined | null): T | null
    {
        return value !== undefined
            ?
            value
            :
            null;
    }
}
