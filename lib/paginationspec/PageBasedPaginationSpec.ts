import {PaginationSpec} from "./PaginationSpec";

export class PageBasedPaginationSpec extends PaginationSpec
{
    protected pageNumberParamName: string;

    protected pageSizeParamName: string;

    protected pageLimit: number;

    protected pageNumber: number;

    constructor(
        pageNumberParamName: string,
        pageSizeParamName: string,
        pageLimit: number
    ) {
        super();
        this.pageNumberParamName = pageNumberParamName;
        this.pageSizeParamName = pageSizeParamName;
        this.pageLimit = pageLimit;
    }

    public getPaginationParameters(): string[]
    {
        return this.pageNumber !== undefined
            ? [
                `page[${this.pageNumberParamName}]=${this.pageNumber}`,
                `page[${this.pageSizeParamName}]=${this.pageLimit}`
            ]
            : [];
    }

    public setPage(page: number)
    {
        page = Math.max(page, 1);
        this.pageNumber = page;
    }

    public setPageLimit(pageLimit: number)
    {
        this.pageLimit = pageLimit;
    }
}