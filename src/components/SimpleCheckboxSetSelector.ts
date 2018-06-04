import { Component, createElement, ChangeEvent } from "react";
import * as classNames from "classnames";

interface SimpleCheckboxSetSelectorProps {
    alertMessage: string;
    labelCaption: string;
    checkboxItems: CheckboxOptions[];
    direction: Direction;
    handleChange: (value: boolean, guid: string) => void;
    readOnly?: boolean;
}

interface SimpleCheckboxSetSelectorState {
    checkboxItems: CheckboxOptions[];
    labelCaption: string;
}

export interface CheckboxOptions {
    guid: string;
    caption: string | number | boolean;
    isChecked: boolean;
}

export type Direction = "horizontal" | "vertical";
export type SortOrder = "asc" | "desc";

export class SimpleCheckboxSetSelector extends Component<SimpleCheckboxSetSelectorProps, SimpleCheckboxSetSelectorState> {

    constructor(props: SimpleCheckboxSetSelectorProps) {
        super(props);

        this.state = {
            checkboxItems : this.props.checkboxItems,
            labelCaption: this.props.labelCaption
        };
    }

    render() {
        return createElement("div", { className: classNames("form-group widget-checkbox-set-selector") },
            createElement("label", { className: classNames("control-label checkboxLabel") }, this.state.labelCaption),
            this.createCheckboxNodes(),
            createElement("div", { className: classNames("showmoreButton") })
        );
    }

    componentWillReceiveProps(newProps: SimpleCheckboxSetSelectorProps) {
        if (this.state.checkboxItems !== newProps.checkboxItems) {
            this.setState({
                checkboxItems : newProps.checkboxItems,
                labelCaption: newProps.labelCaption
            });
        }
    }

    private createCheckboxNodes = () => {
        const { checkboxItems } = this.state;
        if (checkboxItems && checkboxItems.length > 0) {
            return checkboxItems.map(checkbox => {
                if (this.props.direction === "horizontal") {
                    return this.checkboxLabel(checkbox.caption, checkbox.isChecked, "checkbox-inline", checkbox.guid);
                } else {
                    return createElement("div", { className: classNames("checkbox") },
                        this.checkboxLabel(checkbox.caption, checkbox.isChecked, "", checkbox.guid));
                }
            });
        }
        return [];
    }

    private checkboxLabel = (caption: string | number | boolean, checked: boolean, className: string, guid: string) => {
        return createElement("label", { className },
            createElement("input", {
                checked,
                disabled: this.props.readOnly,
                value: guid,
                onChange: this.handleOnChange,
                type: "checkbox"
            }),
            createElement("span", {}, caption)
        )
    }

    private handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.handleChange(event.target.checked, event.target.value);
    }
}
