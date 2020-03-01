import {BaseModel} from './BaseModel';
import {ToManyRelation, ToOneRelation} from "../../../dist";

export class Hero extends BaseModel
{
    protected jsonApiType = 'heros';

    public friends(): ToManyRelation
    {
        return this.hasMany(Hero, 'friends');
    }

    public foes(): ToManyRelation
    {
        return this.hasMany(Hero, 'enemies');
    }

    public rival(): ToOneRelation
    {
        return this.hasOne(Hero, 'rival');
    }

    public getName(): string
    {
        return this.getAttribute('name');
    }

    public setName(name: string): void
    {
        this.setAttribute('name', name);
    }

    public getFoes(): Hero[]
    {
        return this.getRelation('foes');
    }
}
