import {BaseModel} from './BaseModel';
import {PaginationStrategy} from "../../lib/PaginationStrategy";
import {ToManyRelation} from "../../lib/relation/ToManyRelation";

export class Hero extends BaseModel {
    protected jsonApiType = 'heros';

    public friends(): ToManyRelation
    {
        return this.hasMany(Hero);
    }
}