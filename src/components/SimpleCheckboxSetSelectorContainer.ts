import { Component, createElement } from "react";

import { SimpleCheckboxSetSelector } from "./SimpleCheckboxSetSelector";

export default class SimpleCheckboxSetSelectorContainer extends Component<{}, {}> {
    render() {
        return createElement(SimpleCheckboxSetSelector);
    }
}
