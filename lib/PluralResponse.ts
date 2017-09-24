import {Response} from "./Response";
import {Model} from "./Model";
import {JsonApiDoc} from "./JsonApiDoc";

export class PluralResponse extends Response
{
    protected data: Model[];

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