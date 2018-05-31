import { Component, createElement, ChangeEvent } from "react";
import * as classNames from "classnames";

interface SimpleCheckboxSetSelectorProps {
    caption: string;
    isChecked?: boolean;
    defaultChecked?: boolean;
    handleChange?: (value: boolean) => void;
    readOnly?: boolean;
    checkboxItems?: CheckboxOptions[];
}

export interface CheckboxOptions {
    guid: string;
    value: string | number | boolean;
    checked: boolean;
}

export class SimpleCheckboxSetSelector extends Component<SimpleCheckboxSetSelectorProps, { isChecked: boolean }> {

    constructor(props: SimpleCheckboxSetSelectorProps) {
        super(props);

        this.state = { isChecked : this.props.isChecked || false };
    }

    render() {
        return createElement("div", { className: classNames("form-group checkboxMainContainer") },
            createElement("label", { className: classNames("control-label checkboxLabel") }, this.props.caption),
            createElement("div", {}, this.createCheckboxNodes()),
            createElement("div", { className: classNames("showmoreButton") })
        );
    }

    private createCheckboxNodes = () => {
        return createElement("input", {
            checked: this.props.isChecked,
            defaultChecked: this.props.defaultChecked,
            onChange: this.handleOnChange,
            type: "checkbox"
        });
    }

    private handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({ isChecked: event.target.checked });
        this.props.handleChange(event.target.checked);
    }
}
