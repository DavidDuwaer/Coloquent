
import * as moxios from 'moxios';
import {AxiosInstance} from "axios";
import {Model} from "../../../dist";
import {PaginationStrategy} from "../../../dist";

export abstract class BaseModel extends Model {
    protected static jsonApiBaseUrl = 'http://coloquent.app/api/';

    constructor() {
        super();
        moxios.install((<AxiosInstance> BaseModel.getHttpClient().getImplementingClient()));
    }

    public static setPaginationStrategy(paginationStrategy: PaginationStrategy): void
    {
        BaseModel.paginationStrategy = paginationStrategy;
    }
}
