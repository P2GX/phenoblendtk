import * as _angular_core from '@angular/core';
import * as _angular_platform_browser from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

declare class NgHpoUikit {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgHpoUikit, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgHpoUikit, "lib-ng-hpo-uikit", never, {}, {}, never, never, true, never>;
}

declare class FooterComponent {
    private sanitizer;
    appName: _angular_core.InputSignal<string>;
    appVersion: _angular_core.InputSignal<string>;
    gitHubIssuesUrl: _angular_core.InputSignal<string>;
    currentYear: _angular_core.InputSignal<number>;
    helpRequested: _angular_core.OutputEmitterRef<void>;
    protected sanitizedIssuesUrl: _angular_core.Signal<_angular_platform_browser.SafeUrl>;
    onHelpClick(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FooterComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<FooterComponent, "lib-shared-footer", never, { "appName": { "alias": "appName"; "required": true; "isSignal": true; }; "appVersion": { "alias": "appVersion"; "required": true; "isSignal": true; }; "gitHubIssuesUrl": { "alias": "gitHubIssuesUrl"; "required": true; "isSignal": true; }; "currentYear": { "alias": "currentYear"; "required": false; "isSignal": true; }; }, { "helpRequested": "helpRequested"; }, never, never, true, never>;
}

declare class HelpButtonComponent {
    title: _angular_core.InputSignal<string>;
    lines: _angular_core.InputSignal<string[]>;
    helpUrl: _angular_core.InputSignal<string | undefined>;
    openDocs(): Promise<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<HelpButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<HelpButtonComponent, "ui-help-button", never, { "title": { "alias": "title"; "required": true; "isSignal": true; }; "lines": { "alias": "lines"; "required": true; "isSignal": true; }; "helpUrl": { "alias": "helpUrl"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

interface OrcidDialogData {
    currentOrcid?: string;
}
declare class OrcidDialogComponent {
    private fb;
    private dialogRef;
    data: OrcidDialogData;
    externalLinkClicked: _angular_core.OutputEmitterRef<string>;
    orcidForm: FormGroup;
    onLinkClick(event: Event): void;
    onCancel(): void;
    onSave(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<OrcidDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<OrcidDialogComponent, "lib-orcid-dialog", never, {}, { "externalLinkClicked": "externalLinkClicked"; }, never, never, true, never>;
}

declare class LoadOntologyComponent {
    label: _angular_core.InputSignal<string>;
    isLoading: _angular_core.InputSignal<boolean>;
    isLoaded: _angular_core.InputSignal<boolean>;
    statusMessage: _angular_core.InputSignal<string>;
    termCount: _angular_core.InputSignal<number | undefined>;
    helpUrl: _angular_core.InputSignal<string>;
    helpLines: _angular_core.InputSignal<string[]>;
    onLoad: _angular_core.OutputEmitterRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<LoadOntologyComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<LoadOntologyComponent, "ui-load-ontology", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "isLoading": { "alias": "isLoading"; "required": true; "isSignal": true; }; "isLoaded": { "alias": "isLoaded"; "required": true; "isSignal": true; }; "statusMessage": { "alias": "statusMessage"; "required": true; "isSignal": true; }; "termCount": { "alias": "termCount"; "required": false; "isSignal": true; }; "helpUrl": { "alias": "helpUrl"; "required": false; "isSignal": true; }; "helpLines": { "alias": "helpLines"; "required": false; "isSignal": true; }; }, { "onLoad": "onLoad"; }, never, never, true, never>;
}

declare class NotificationService {
    private snackBar;
    constructor(snackBar: MatSnackBar);
    showError(message: string, duration?: number): void;
    showSuccess(message: string, duration?: number): void;
    showWarning(message: string, duration?: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NotificationService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NotificationService>;
}

/**
 * Represents a standardized hit returned by an arbitrary ontology search provider.
 * * This model serves as the common data contract for generic autocomplete and UI lookup
 * elements within the component toolkit.
 * * @example
 * ```typescript
 * const hpoHit: OntologyMatch = {
 * id: 'HP:0001250',
 * label: 'Seizure',
 * matchedText: 'Epilepsy' // Matched on a synonym
 * };
 * ```
 */
interface OntologyMatch {
    /**
     * The unique alphanumeric identifier for the ontology term.
     * @example 'HP:0001250', 'GO:0008150'
     */
    id: string;
    /**
     * The canonical, primary clinical label designated to the term.
     */
    label: string;
    /**
     * The exact literal string matched during the query search execution.
     * This may differ from the primary `label` if the match occurred on an
     * alternative term synonym.
     */
    matchedText: string;
}

export { FooterComponent, HelpButtonComponent, LoadOntologyComponent, NgHpoUikit, NotificationService, OrcidDialogComponent };
export type { OntologyMatch, OrcidDialogData };
