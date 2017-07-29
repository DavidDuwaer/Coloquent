import {WorpResponse} from "./WorpResponse";
import {Model} from "./Model";
import {JsonApiDoc} from "./JsonApiDoc";

export class SingularWorpResponse<T extends Model> extends WorpResponse<T>
{
    protected data: T;

    public getData(): T
    {
        return this.data;
    }

    protected makeModelIndex(doc: JsonApiDoc): void
    {
        this.indexAsModel(doc, Object.getPrototypeOf(this.prototype).constructor);
    }

    protected indexRequestedDocs(doc: JsonApiDoc)
    {
        this.indexDoc(doc);
    }

    protected makeDataArray(doc: JsonApiDoc): void
    {
        this.data = <T> this.modelIndex.get(doc.type).get(doc.id);
    }
}