
import * as moxios from 'moxios';
import {AxiosInstance} from "axios";
import {Model} from "../../../dist";
import {PaginationStrategy} from "../../../dist";

export abstract class BaseModel extends Model {
    constructor() {
        super();
        moxios.install((<AxiosInstance> BaseModel.getHttpClient().getImplementingClient()));
    }

    getJsonApiBaseUrl(): string {
        return 'http://coloquent.app/api/';
    }

    public static setPaginationStrategy(paginationStrategy: PaginationStrategy): void
    {
        BaseModel.paginationStrategy = paginationStrategy;
    }
}
