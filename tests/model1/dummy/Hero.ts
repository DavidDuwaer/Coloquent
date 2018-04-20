import {BaseModel} from './BaseModel';
import {ToManyRelation} from "../../../dist";

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

    public getName(): string
    {
        return this.getAttribute('name');
    }

    public getFoes(): Hero[]
    {
        return this.getRelation('foes');
    }
}