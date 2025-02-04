import React, {useEffect} from "react";
import {usePrevious} from "../../common/usePrevious";

export function useSelectedModelBannerControl(props) {
    const [open, setOpen] = React.useState(true);

    const hasCards = (props) => props.selectedModels.length > 0;

    const toggleOpen = () => setOpen((prev) => !prev);

    const screenIsLargeEnough = () => true;//window.innerWidth > 925;

    const previousProps = usePrevious(props);

    useEffect(() => {
        if (!open && hasCards(props) && !hasCards(previousProps) && screenIsLargeEnough())
            toggleOpen();
        else if (open && !hasCards(props) && hasCards(previousProps))
            toggleOpen();
    }, [props])

    return {open, toggleOpen};
}