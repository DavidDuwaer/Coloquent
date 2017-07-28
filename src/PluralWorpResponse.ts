import {WorpResponse} from "./WorpResponse";
import {Model} from "./Model";
import {JsonApiDoc} from "./JsonApiDoc";

export class PluralWorpResponse<T extends Model> extends WorpResponse<T>
{
    protected data: T[];

    public getData(): T[]
    {
        return this.data;
    }

    protected indexRequestedDocs(requestedDocs: JsonApiDoc[])
    {
        for (let doc of requestedDocs) {
            this.indexDoc(doc);
        }
    }

    protected makeModelIndex(requestedDocs: JsonApiDoc[]): void
    {
        for (let doc of requestedDocs) {
            this.indexAsModel(doc, Object.getPrototypeOf(this.prototype).constructor);
        }
    }

    protected makeDataArray(requestedDocs: JsonApiDoc[])
    {
        this.data = [];
        for (let doc of requestedDocs) {
            this.data.push(
                <T> this.modelIndex.get(doc.type).get(doc.id)
            );
        }
    }
}