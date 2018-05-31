import { Component, createElement } from "react";
import { SimpleCheckboxSetSelector } from "./components/SimpleCheckboxSetSelector";

// tslint:disable-next-line class-name
export class preview extends Component<{}, {}> {
    render() {
        return createElement(SimpleCheckboxSetSelector);
    }
}
