import {JsonApiResponseBody} from "../JsonApiResponseBody";
import {JsonApiDoc} from "../JsonApiDoc";
import {Model} from "../Model";
import {ToManyRelation} from "../ToManyRelation";
import {JsonApiStub} from "../JsonApiStub";
import {Relation} from "../Relation";
import {ToOneRelation} from "../ToOneRelation";
import {Map} from "../util/Map";

export abstract class Response
{
    private axiosResponse: AxiosResponse;


    public getHttpClientResponse(): AxiosResponse
    {
        return this.axiosResponse;
    }
}