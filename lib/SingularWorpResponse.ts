import {WorpResponse} from "./WorpResponse";
import {Model} from "./Model";
import {JsonApiDoc} from "./JsonApiDoc";

export class SingularWorpResponse extends WorpResponse
{
    protected data: Model;

    public getData(): Model
    {
        return this.data;
    }

    protected makeModelIndex(doc: JsonApiDoc): void
    {
        this.indexAsModel(doc, this.modelType);
    }

    protected indexRequestedDocs(doc: JsonApiDoc)
    {
        this.indexDoc(doc);
    }

    protected makeDataArray(doc: JsonApiDoc): void
    {
        this.data = this.modelIndex.get(doc.type).get(doc.id);
    }
}