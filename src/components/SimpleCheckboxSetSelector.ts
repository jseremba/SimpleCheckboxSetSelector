import { Component, createElement, ChangeEvent, ReactNode } from "react";
import * as classNames from "classnames";
import { Alert } from "./Alert";

interface SimpleCheckboxSetSelectorProps {
    alertMessage: string;
    alignment: Alignment;
    checkboxItems: CheckboxOptions[];
    formOrientation: Alignment;
    handleChange: (isChecked: boolean, guid: string) => void;
    labelCaption: string;
    labelWidth: number;
    readOnly?: boolean;
    showLabel: boolean;
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

export type Alignment = "horizontal" | "vertical";
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
        let labelClassName = "control-label checkboxLabel";

        return createElement("div", { className: classNames("form-group widget-checkbox-set-selector") },
            createElement("label", {
                className: classNames(this.formOrientation(), this.props.showLabel
                    ? labelClassName
                    : labelClassName += " hidden")
            }, this.state.labelCaption),

            this.props.formOrientation === "horizontal"
                ? createElement("div", { className: "col-sm-" + (12 - this.props.labelWidth) }, this.createCheckboxNodes())
                : this.createCheckboxNodes(),
            this.renderAlertMessage(),
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
                if (this.props.alignment === "horizontal") {
                    return this.checkboxLabel(checkbox.caption, checkbox.isChecked, "checkbox-inline", checkbox.guid);
                } else {
                    return createElement("div", { className: classNames("checkbox") },
                        this.checkboxLabel(checkbox.caption, checkbox.isChecked, "", checkbox.guid));
                }
            });
        }
        return [];
    }

    private formOrientation = () => {
        const { labelWidth } = this.props;
        if (this.props.formOrientation === "horizontal") {
            // width needs to be between 1 and 11
            let checkboxLabelWidth = labelWidth < 1 ? 1 : labelWidth;
            checkboxLabelWidth = labelWidth > 11 ? 11 : labelWidth;

            return "col-sm-" + checkboxLabelWidth;
        }

        return " ";
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

    private renderAlertMessage(): ReactNode {
        return !this.props.readOnly
            ? createElement(Alert, { message: this.props.alertMessage })
            : null;
    }

    private handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.handleChange(event.target.checked, event.target.value);
    }
}
