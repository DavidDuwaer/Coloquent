import {Resource} from "./Resource";

export class JsonApiResponseBody
{
    public data: Resource | Resource[] | null | undefined;
    public included: Resource[];
}