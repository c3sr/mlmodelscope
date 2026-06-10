import React, {useEffect} from "react";
import PageNavigation from "./PageNavigation";
import PageNavigationSummary from "./PageNavigationSummary";

export default function withPagination(WrappedComponent, dataPropertyName, searchText) {

    const defaultProps = {
        data: [],
        itemsPerPage: 24,
        pageCount: 1,
        selectedPage: 1
    }

    function Paginated(givenProps) {
        const props = {...defaultProps, ...givenProps};
        const [selectedPage, setSelectedPage] = React.useState(props.selectedPage);
        const pageCount = Math.max(1, Math.ceil(props.data.length / props.itemsPerPage));
        const currentPage = Math.min(selectedPage, pageCount);
        const start = props.itemsPerPage * (currentPage - 1);
        const pageData = props.data.slice(start, start + props.itemsPerPage);

        useEffect(() => {
            setSelectedPage(1);
        }, [props.data]);

        const selectPage = (nextPage) => {
            setSelectedPage(nextPage);
            setTimeout(() => {
                window.scrollTo(0, document.querySelector(".model-list-page__content").offsetTop);
            }, 250)
        }

        let wrappedProps = {}
        wrappedProps[dataPropertyName] = pageData;

        return (
            <div className="paginated-content">
                <PageNavigationSummary data={pageData} pageCount={pageCount}
                                       selectedPage={currentPage} totalCount={props.data.length}
                                       searchText={searchText} selectPage={selectPage}/>
                <WrappedComponent pageCount={pageCount}
                                  selectedPage={currentPage} {...props} {...wrappedProps} />
                <PageNavigation pageCount={pageCount} selectedPage={currentPage}
                                selectPage={selectPage}/>
            </div>
        );
    }


    return Paginated;
}
