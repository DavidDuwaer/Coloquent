import {BaseModel} from './BaseModel';
import {ToManyRelation} from "../../../lib";

export class Hero extends BaseModel
{
    protected jsonApiType = 'heros';

    public friends(): ToManyRelation
    {
        return this.hasMany(Hero);
    }

    public foes(): ToManyRelation
    {
        return this.hasMany(Hero, 'enemies');
    }
}