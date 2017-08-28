import {Model} from '../../lib/Model';
import {PaginationStrategy} from "../../lib/PaginationStrategy";

export abstract class BaseModel extends Model {
    getJsonApiBaseUrl(): string {
        return 'http://coloquent.app/api/';
    }

    public static setPaginationStrategy(paginationStrategy: PaginationStrategy): void
    {
        BaseModel.paginationStrategy = paginationStrategy;
    }
}