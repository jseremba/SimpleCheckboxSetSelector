import { Component, createElement } from "react";

import { SimpleCheckboxSetSelector, CheckboxOptions, Direction, SortOrder } from "./SimpleCheckboxSetSelector";

interface WrapperProps {
    "class": string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
    style: string;
    readOnly: boolean;
}

interface SimpleCheckboxSetSelectorContainerProps extends WrapperProps {
    dataSourceType: "xpath" | "microflow";
    associationReference: string;
    dataSourceMicroflow: string;
    constraint: string;
    showLabel: string;
    labelCaption: string;
    sortAttribute: string;
    sortOrder: SortOrder;
    labelAttribute: string;
    formOrientation: string;
    direction: Direction;
    labelWidth: string;
    showMore: string;
    editable: "default" | "never";
    onChangeMicroflow: string;
    onChangeNanoflow: Nanoflow;
    onChangeDelay: string;
}

interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

interface SimpleCheckboxSetSelectorContainerState {
    checkboxItems: CheckboxOptions[];
    isChecked: boolean;
    alertMessage: string;
}

export default class SimpleCheckboxSetSelectorContainer extends Component<SimpleCheckboxSetSelectorContainerProps, SimpleCheckboxSetSelectorContainerState> {
    private entity: string;
    private reference: string;
    private subscriptionHandles: number[] = [];

    constructor(props: SimpleCheckboxSetSelectorContainerProps) {
        super(props);

        this.state = {
            alertMessage: "",
            checkboxItems: [],
            isChecked: false
        };

        this.entity = this.props.associationReference.split("/")[1];
        this.reference = this.props.associationReference.split("/")[0];
    }
    render() {
        return createElement(SimpleCheckboxSetSelector, {
            alertMessage: this.state.alertMessage,
            labelCaption: this.props.labelCaption,
            checkboxItems: this.state.checkboxItems,
            direction: this.props.direction,
            handleChange: this.handleChange,
            readOnly: this.isReadOnly()
        });
    }

    componentDidMount() {
        this.fetchData(this.props.mxObject);
    }

    componentWillReceiveProps(nextProps: SimpleCheckboxSetSelectorContainerProps) {
        if (nextProps.mxObject !== this.props.mxObject) {
            this.fetchData(nextProps.mxObject);
            this.resetSubscriptions(nextProps.mxObject);
        }
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private isReadOnly = (): boolean => {
        return !this.props.mxObject || this.props.editable === "never" ||
            this.props.mxObject.isReadonlyAttr(this.reference)
    }

    private resetSubscriptions = (mxObject?: mendix.lib.MxObject) => {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                guid: mxObject.getGuid(),
                val: true,
                callback: () => this.handleValidations
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                guid: mxObject.getGuid(),
                callback: () => this.fetchData(mxObject)
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                guid: mxObject.getGuid(),
                attr: this.reference,
                callback:() => this.fetchData(mxObject)
            }));
        }
    }

    private handleValidations = (validations: mendix.lib.ObjectValidation[]) => {
        const alertMessage = validations[0].getErrorReason(this.reference);
        validations[0].removeAttribute(this.reference);
        if (alertMessage) {
            this.setState({ alertMessage });
        }
    }

    private handleChange = (value: boolean, guid: string) => {
        const { mxObject } = this.props;
        if (value && guid) {
            mxObject.addReference(this.reference, guid);
        } else {
            mxObject.removeReferences(this.reference, [guid]);
        }
        this.executeAction();
    }

    private executeAction() {
        const { mxform, mxObject, onChangeMicroflow, onChangeNanoflow } = this.props;
        if (mxObject) {
            if (onChangeMicroflow) {
                window.mx.ui.action(onChangeMicroflow, {
                    error: error =>
                        window.mx.ui.error(`Error while executing microflow: ${onChangeMicroflow}: ${error.message}`),
                    origin: mxform,
                    params: {
                        applyto: "selection",
                        guids: [mxObject.getGuid()]
                    }
                });
            }

            if (onChangeNanoflow.nanoflow) {
                const context = new mendix.lib.MxContext();
                context.setContext(mxObject.getEntity(), mxObject.getGuid());
                window.mx.data.callNanoflow({
                    context,
                    error: error => window.mx.ui.error(
                        `An error occurred while executing the on change nanoflow: ${error.message}`
                    ),
                    nanoflow: onChangeNanoflow,
                    origin: mxform
                });
            }
        }
    }

    private fetchData(contextObject?: mendix.lib.MxObject) {
        const { dataSourceType, dataSourceMicroflow } = this.props;

        if (contextObject) {
            if (dataSourceType === "xpath") {
                this.getDataFromXPath(contextObject.getGuid());
            } else if (dataSourceType === "microflow" && dataSourceMicroflow) {
                this.getDataFromMicroflow(contextObject);
            }
        }
    }

    private getDataFromXPath = (guid: string) => {
        const constraint = this.props.constraint
            ? this.props.constraint.replace(/\[\%CurrentObject\%\]/gi, guid)
            : "";
        const XPath = "//" + this.entity + constraint;
        mx.data.get({
            xpath: XPath,
            filter: {
                sort: [[this.props.sortAttribute, this.props.sortOrder]],
                offset: 0,
                amount: 50
            },
            callback: objects => this.processCheckboxItems(objects)
        });
    }

    private getDataFromMicroflow = (contextObject?: mendix.lib.MxObject) => {
        const { dataSourceMicroflow } = this.props;
            if (contextObject && dataSourceMicroflow) {
                window.mx.ui.action(dataSourceMicroflow, {
                    callback: (mxObjects: mendix.lib.MxObject[]) => this.processCheckboxItems(mxObjects),
                    error: error => window.mx.ui.error(`Error while executing microflow: ${dataSourceMicroflow}: ${error.message}`),
                    params: {
                        applyto: "selection",
                        guids: contextObject ? [contextObject.getGuid()] : []
                    }
                });
            }
    }

    private processCheckboxItems = (contextObject: mendix.lib.MxObject[]) => {
        const checkboxItems = contextObject.map(mxObj => {
            let isChecked = false;
            const guid = mxObj.getGuid();
            const caption = mxObj.get(this.props.labelAttribute);
            const referencedObjects = this.props.mxObject.getReferences(this.reference) as string[];
            if (referencedObjects !== null && referencedObjects.length > 0) {
                referencedObjects.map(value => {
                    if (mxObj.getGuid() === value) {
                        isChecked = true;
                    }
                });
            }

            return {
                guid,
                caption,
                isChecked
            };
        });
        this.setState({ checkboxItems });
    }
}
