import {Model} from "../../../dist";
import {PaginationStrategy} from "../../../dist";

export abstract class BaseModel extends Model {
    protected static jsonApiBaseUrl = 'http://coloquent.app/api/';

    public static setPaginationStrategy(paginationStrategy: PaginationStrategy): void
    {
        BaseModel.paginationStrategy = paginationStrategy;
    }
}
