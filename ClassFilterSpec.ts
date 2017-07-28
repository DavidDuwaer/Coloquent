import {FilterSpec} from "./FilterSpec";

export class ClassFilterSpec extends FilterSpec
{
    private clazz: string;

    constructor(clazz: string, attribute: string, value: string)
    {
        super(attribute, value);
        this.clazz = clazz;
    }

    getClass(): string
    {
        return this.clazz;
    }
}