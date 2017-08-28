import {BaseModel} from './BaseModel';
import {PaginationStrategy} from "../../lib/PaginationStrategy";

export class Hero extends BaseModel {
    protected jsonApiType = 'heros';
}