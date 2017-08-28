import {PaginationSpec} from "./PaginationSpec";

export class OffsetBasedPaginationSpec extends PaginationSpec
{
    protected pageOffsetParamName: string;

    protected pageLimitParamName: string;

    protected pageLimit: number;

    protected pageOffset: number;

    constructor(
        pageOffsetParamName: string,
        pageLimitParamName: string,
        limit: number
    ) {
        super();
        this.pageOffsetParamName = pageOffsetParamName;
        this.pageLimitParamName = pageLimitParamName;
        this.pageLimit = limit;
    }

    public getPaginationParameters(): string[]
    {
        return this.pageOffset !== undefined
            ? [
                `page[${this.pageOffsetParamName}]=${this.pageOffset}`,
                `page[${this.pageLimitParamName}]=${this.pageLimit}`
            ]
            : [];
    }

    public setPage(page: number)
    {
        page = Math.max(page, 1);
        this.pageOffset = (page - 1) * this.pageLimit;
    }

    public setPageLimit(pageLimit: number)
    {
        this.pageLimit = pageLimit;
    }
}