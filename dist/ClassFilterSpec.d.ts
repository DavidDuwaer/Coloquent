import { FilterSpec } from "./FilterSpec";
export declare class ClassFilterSpec extends FilterSpec {
    private clazz;
    constructor(clazz: string, attribute: string, value: string);
    getClass(): string;
}
