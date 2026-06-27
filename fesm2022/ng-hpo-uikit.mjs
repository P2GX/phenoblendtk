import * as i0 from '@angular/core';
import { Component, inject, input, output, computed, ViewEncapsulation, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as i1 from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import * as i2 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i3 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { openUrl } from '@tauri-apps/plugin-opener';
import * as i1$2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i5 from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import * as i1$1 from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as i2$1 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import * as i4 from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as i2$2 from '@angular/material/progress-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as i1$3 from '@angular/material/snack-bar';

class NgHpoUikit {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: NgHpoUikit, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.0.2", type: NgHpoUikit, isStandalone: true, selector: "lib-ng-hpo-uikit", ngImport: i0, template: ` <p>ng-hpo-uikit works!</p> `, isInline: true, styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: NgHpoUikit, decorators: [{
            type: Component,
            args: [{ selector: 'lib-ng-hpo-uikit', imports: [], template: ` <p>ng-hpo-uikit works!</p> ` }]
        }] });

class FooterComponent {
    sanitizer = inject(DomSanitizer);
    appName = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appName" }] : /* istanbul ignore next */ []));
    appVersion = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appVersion" }] : /* istanbul ignore next */ []));
    gitHubIssuesUrl = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "gitHubIssuesUrl" }] : /* istanbul ignore next */ []));
    currentYear = input(2026, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentYear" }] : /* istanbul ignore next */ [])); // Sensible default
    helpRequested = output();
    sanitizedIssuesUrl = computed(() => this.sanitizer.bypassSecurityTrustUrl(this.gitHubIssuesUrl()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sanitizedIssuesUrl" }] : /* istanbul ignore next */ []));
    onHelpClick() {
        this.helpRequested.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: FooterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.2", type: FooterComponent, isStandalone: true, selector: "lib-shared-footer", inputs: { appName: { classPropertyName: "appName", publicName: "appName", isSignal: true, isRequired: true, transformFunction: null }, appVersion: { classPropertyName: "appVersion", publicName: "appVersion", isSignal: true, isRequired: true, transformFunction: null }, gitHubIssuesUrl: { classPropertyName: "gitHubIssuesUrl", publicName: "gitHubIssuesUrl", isSignal: true, isRequired: true, transformFunction: null }, currentYear: { classPropertyName: "currentYear", publicName: "currentYear", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { helpRequested: "helpRequested" }, ngImport: i0, template: "<!-- Inside your UI library: shared-footer.component.html -->\n<footer class=\"site-footer\">\n  <div class=\"footer-content\">\n    <p>&copy; {{ currentYear() }} {{ appName() }} v{{ appVersion() }}</p>\n    \n    <button \n      (click)=\"onHelpClick()\"\n      class=\"footer-link\"\n      title=\"Open help documentation\"\n    >\n      <span>Help</span>\n      <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\n      </svg>\n    </button>\n\n    <!-- The link now uses a reactive input bound to href -->\n    <a\n      [href]=\"sanitizedIssuesUrl()\"\n      target=\"_blank\"\n      rel=\"noopener noreferrer\"\n      class=\"footer-link\"\n      title=\"Report a bug or problem on GitHub\"\n    >\n      <span>Report bug</span>\n      <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 8l1.5-1.5M5 8L3.5 6.5M12 1v2M12 5a4 4 0 00-4 4v2H8 a4 4 0 008 0h0V9a4 4 0 00-4-4zM4 13h16M4 17h16M12 21v2\" />\n      </svg>\n    </a>\n  </div>\n</footer>", styles: [".site-footer{background-color:#f3f4f6;text-align:center;padding:1rem 0;font-size:14px;color:#4b5563;box-shadow:inset 0 2px 4px #0000000d}.footer-content{display:flex;align-items:center;justify-content:center;gap:16px}.footer-link{display:flex;align-items:center;gap:4px;color:#2563eb;text-decoration:underline;background:none;border:none;padding:0;cursor:pointer;font-size:inherit;transition:color .2s ease}.footer-link:hover{color:#1e40af}.site-footer .icon{height:16px;width:16px}@media(max-width:480px){.footer-content{flex-direction:column;gap:8px}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: FooterComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-shared-footer', standalone: true, template: "<!-- Inside your UI library: shared-footer.component.html -->\n<footer class=\"site-footer\">\n  <div class=\"footer-content\">\n    <p>&copy; {{ currentYear() }} {{ appName() }} v{{ appVersion() }}</p>\n    \n    <button \n      (click)=\"onHelpClick()\"\n      class=\"footer-link\"\n      title=\"Open help documentation\"\n    >\n      <span>Help</span>\n      <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\" />\n      </svg>\n    </button>\n\n    <!-- The link now uses a reactive input bound to href -->\n    <a\n      [href]=\"sanitizedIssuesUrl()\"\n      target=\"_blank\"\n      rel=\"noopener noreferrer\"\n      class=\"footer-link\"\n      title=\"Report a bug or problem on GitHub\"\n    >\n      <span>Report bug</span>\n      <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n        <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 8l1.5-1.5M5 8L3.5 6.5M12 1v2M12 5a4 4 0 00-4 4v2H8 a4 4 0 008 0h0V9a4 4 0 00-4-4zM4 13h16M4 17h16M12 21v2\" />\n      </svg>\n    </a>\n  </div>\n</footer>", styles: [".site-footer{background-color:#f3f4f6;text-align:center;padding:1rem 0;font-size:14px;color:#4b5563;box-shadow:inset 0 2px 4px #0000000d}.footer-content{display:flex;align-items:center;justify-content:center;gap:16px}.footer-link{display:flex;align-items:center;gap:4px;color:#2563eb;text-decoration:underline;background:none;border:none;padding:0;cursor:pointer;font-size:inherit;transition:color .2s ease}.footer-link:hover{color:#1e40af}.site-footer .icon{height:16px;width:16px}@media(max-width:480px){.footer-content{flex-direction:column;gap:8px}}\n"] }]
        }], propDecorators: { appName: [{ type: i0.Input, args: [{ isSignal: true, alias: "appName", required: true }] }], appVersion: [{ type: i0.Input, args: [{ isSignal: true, alias: "appVersion", required: true }] }], gitHubIssuesUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "gitHubIssuesUrl", required: true }] }], currentYear: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentYear", required: false }] }], helpRequested: [{ type: i0.Output, args: ["helpRequested"] }] } });

class HelpButtonComponent {
    title = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "title" }] : /* istanbul ignore next */ []));
    lines = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lines" }] : /* istanbul ignore next */ []));
    helpUrl = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "helpUrl" }] : /* istanbul ignore next */ []));
    /* Open page safely in system browser via Tauri opener */
    async openDocs() {
        const url = this.helpUrl();
        if (url) {
            try {
                await openUrl(url);
            }
            catch (err) {
                console.error("Failed to open documentation via Tauri Opener:", err);
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: HelpButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.2", type: HelpButtonComponent, isStandalone: true, selector: "ui-help-button", inputs: { title: { classPropertyName: "title", publicName: "title", isSignal: true, isRequired: true, transformFunction: null }, lines: { classPropertyName: "lines", publicName: "lines", isSignal: true, isRequired: true, transformFunction: null }, helpUrl: { classPropertyName: "helpUrl", publicName: "helpUrl", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<button mat-icon-button [matMenuTriggerFor]=\"helpMenu\" class=\"help-trigger\" type=\"button\">\n  <mat-icon>help_outline</mat-icon>\n</button>\n\n<mat-menu #helpMenu=\"matMenu\" panelClass=\"help-bubble-menu\">\n  <div class=\"help-content\" (click)=\"$event.stopPropagation()\">\n    <h3 class=\"help-title\">{{ title() }}</h3>\n    \n    @for (line of lines(); track line) {\n      <p class=\"help-text\" [innerHTML]=\"line\"></p>\n    }\n\n    @if (helpUrl()) {\n      <hr class=\"help-divider\">\n      <button class=\"btn-docs\" (click)=\"openDocs()\">\n        <mat-icon>open_in_new</mat-icon>\n        <span>Learn more</span>\n      </button>\n    }\n  </div>\n</mat-menu>", styles: [".help-bubble-menu{max-width:280px!important;border-radius:8px!important;background-color:#fff;box-shadow:0 4px 12px #00000026}.help-bubble-menu .help-content{padding:12px 16px}.help-bubble-menu .help-content .help-title{margin:0 0 8px;font-size:.95rem;font-weight:600;color:#333}.help-bubble-menu .help-content .help-text{margin:0 0 6px;font-size:.85rem;line-height:1.4;color:#555}.help-bubble-menu .help-content .help-text:last-of-type{margin-bottom:0}.help-bubble-menu .help-content .help-divider{border:0;border-top:1px solid #eef0f2;margin:10px 0}.help-bubble-menu .help-content .btn-docs{display:flex;align-items:center;gap:6px;background:none;border:none;color:#0288d1;font-size:.85rem;font-weight:500;cursor:pointer;padding:4px 0;width:100%;text-align:left}.help-bubble-menu .help-content .btn-docs mat-icon{font-size:16px;width:16px;height:16px}.help-bubble-menu .help-content .btn-docs:hover{color:#01579b;text-decoration:underline}\n"], dependencies: [{ kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i1.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "directive", type: i1.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: HelpButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-help-button', standalone: true, imports: [MatMenuModule, MatButtonModule, MatIconModule], encapsulation: ViewEncapsulation.None, template: "<button mat-icon-button [matMenuTriggerFor]=\"helpMenu\" class=\"help-trigger\" type=\"button\">\n  <mat-icon>help_outline</mat-icon>\n</button>\n\n<mat-menu #helpMenu=\"matMenu\" panelClass=\"help-bubble-menu\">\n  <div class=\"help-content\" (click)=\"$event.stopPropagation()\">\n    <h3 class=\"help-title\">{{ title() }}</h3>\n    \n    @for (line of lines(); track line) {\n      <p class=\"help-text\" [innerHTML]=\"line\"></p>\n    }\n\n    @if (helpUrl()) {\n      <hr class=\"help-divider\">\n      <button class=\"btn-docs\" (click)=\"openDocs()\">\n        <mat-icon>open_in_new</mat-icon>\n        <span>Learn more</span>\n      </button>\n    }\n  </div>\n</mat-menu>", styles: [".help-bubble-menu{max-width:280px!important;border-radius:8px!important;background-color:#fff;box-shadow:0 4px 12px #00000026}.help-bubble-menu .help-content{padding:12px 16px}.help-bubble-menu .help-content .help-title{margin:0 0 8px;font-size:.95rem;font-weight:600;color:#333}.help-bubble-menu .help-content .help-text{margin:0 0 6px;font-size:.85rem;line-height:1.4;color:#555}.help-bubble-menu .help-content .help-text:last-of-type{margin-bottom:0}.help-bubble-menu .help-content .help-divider{border:0;border-top:1px solid #eef0f2;margin:10px 0}.help-bubble-menu .help-content .btn-docs{display:flex;align-items:center;gap:6px;background:none;border:none;color:#0288d1;font-size:.85rem;font-weight:500;cursor:pointer;padding:4px 0;width:100%;text-align:left}.help-bubble-menu .help-content .btn-docs mat-icon{font-size:16px;width:16px;height:16px}.help-bubble-menu .help-content .btn-docs:hover{color:#01579b;text-decoration:underline}\n"] }]
        }], propDecorators: { title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: true }] }], lines: [{ type: i0.Input, args: [{ isSignal: true, alias: "lines", required: true }] }], helpUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "helpUrl", required: false }] }] } });

class OrcidDialogComponent {
    fb = inject(FormBuilder);
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    externalLinkClicked = output();
    orcidForm = this.fb.group({
        orcid: [
            this.data?.currentOrcid || '',
            [
                Validators.required,
                Validators.pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/)
            ]
        ]
    });
    onLinkClick(event) {
        event.preventDefault();
        this.externalLinkClicked.emit('https://orcid.org/');
    }
    onCancel() {
        this.dialogRef.close();
    }
    onSave() {
        if (this.orcidForm.valid) {
            this.dialogRef.close(this.orcidForm.value.orcid);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: OrcidDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.2", type: OrcidDialogComponent, isStandalone: true, selector: "lib-orcid-dialog", outputs: { externalLinkClicked: "externalLinkClicked" }, ngImport: i0, template: "<h2 mat-dialog-title class=\"dialog-title\">Enter ORCID researcher identifier</h2>\n\n<mat-dialog-content class=\"dialog-content\">\n  <form [formGroup]=\"orcidForm\" class=\"orcid-form\">\n    <mat-form-field appearance=\"outline\" class=\"form-field-full\" subscriptSizing=\"fixed\">\n      <mat-icon matPrefix class=\"input-icon-prefix\">fingerprint</mat-icon>\n      <input matInput\n             formControlName=\"orcid\"\n             placeholder=\"0000-0000-0000-0000\"\n             maxlength=\"19\"\n             class=\"orcid-input-field\">\n      <mat-hint class=\"custom-hint\">Format: 0000-0000-0000-0000</mat-hint>\n      \n      @if (orcidForm.get('orcid')?.hasError('required')) {\n        <mat-error>ORCID is required</mat-error>\n      }\n      @if (orcidForm.get('orcid')?.hasError('pattern')) {\n        <mat-error>Invalid ORCID format</mat-error>\n      }\n    </mat-form-field>\n  </form>\n\n  <div class=\"orcid-info\">\n  <!-- Adding matTooltip makes this icon fully interactive out of the box -->\n  <mat-icon class=\"info-icon\" \n            matTooltip=\"ORCID helps distinguish you from every other researcher with a matching name.\" \n            matTooltipPosition=\"above\"\n            style=\"cursor: help;\">\n    info\n  </mat-icon>\n  <span>\n  ORCID provides a persistent digital identifier for researchers.\n  <a href=\"https://orcid.org/\" (click)=\"onLinkClick($event)\" class=\"orcid-link\">Learn more</a>\n</span>\n</div>\n</mat-dialog-content>\n\n<div class=\"dialog-actions\">\n  <button type=\"button\"\n          (click)=\"onCancel()\"\n          class=\"btn-outline-primary\">\n    Cancel\n  </button>\n  <button type=\"button\"\n          (click)=\"onSave()\"\n          [disabled]=\"orcidForm.invalid\"\n          class=\"btn-outline-primary btn-save\">\n    Save\n  </button>\n</div>", styles: [":root{--hpo-btn-radius: 6px;--hpo-btn-font-weight: 500;--hpo-btn-transition: all .15s ease-in-out}.hpo-btn-primary,.dialog-actions .btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;font-size:14px;font-weight:var(--hpo-btn-font-weight);border-radius:var(--hpo-btn-radius);cursor:pointer;transition:var(--hpo-btn-transition);border:1px solid transparent}.hpo-btn-primary:disabled,.dialog-actions .btn-primary:disabled{background:#e2e8f0!important;color:#94a3b8!important;border-color:transparent!important;cursor:not-allowed!important;box-shadow:none!important}.hpo-btn-primary,.dialog-actions .btn-primary{background:var(--hpo-ui-primary-color, #0284c7);color:#fff}.hpo-btn-primary:hover:not(:disabled),.dialog-actions .btn-primary:hover:not(:disabled){background:var(--hpo-ui-primary-hover, #0369a1)}.hpo-btn-secondary,.dialog-actions .btn-secondary{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;font-size:14px;font-weight:var(--hpo-btn-font-weight);border-radius:var(--hpo-btn-radius);cursor:pointer;transition:var(--hpo-btn-transition);border:1px solid transparent}.hpo-btn-secondary:disabled,.dialog-actions .btn-secondary:disabled{background:#e2e8f0!important;color:#94a3b8!important;border-color:transparent!important;cursor:not-allowed!important;box-shadow:none!important}.hpo-btn-secondary,.dialog-actions .btn-secondary{border-color:var(--hpo-ui-border-dark, #cbd5e1);background:#fff;color:#475569}.hpo-btn-secondary:hover:not(:disabled),.dialog-actions .btn-secondary:hover:not(:disabled){background:#f8fafc;color:#1e293b;border-color:#94a3b8}:host{display:block;font-family:var(--hpo-ui-font-family, system-ui, sans-serif);--mdc-dialog-container-shape: 12px}.dialog-title{margin:0!important;padding:24px 24px 10px!important;border-bottom:none!important;font-size:1.25rem;font-weight:600;margin-bottom:1rem!important}mat-dialog-content.dialog-content{min-width:400px;overflow:hidden!important;display:block!important;border-top:none!important;border-bottom:none!important;padding-top:12px!important}.orcid-form{margin-top:.5rem}.orcid-form .form-field-full{width:100%}.orcid-form .form-field-full input.mat-mdc-input-element{padding-left:8px!important}.input-icon-prefix{color:var(--hpo-ui-text-muted, #94a3b8);margin-right:12px!important;font-size:20px;width:20px;height:20px}.orcid-info{background:var(--hpo-ui-bg-light, #f8f9fa);padding:12px;border-radius:6px;margin-top:20px;font-size:13px;display:flex;align-items:center;gap:10px;color:var(--hpo-ui-text-muted, #4b5563);border:1px solid var(--hpo-ui-border-light, #e5e7eb)}.orcid-info .orcid-link{color:var(--hpo-ui-link-color, #2563eb);text-decoration:underline}.dialog-actions{padding:16px;display:flex;justify-content:flex-end;gap:12px}.dialog-actions .btn-secondary,.dialog-actions .btn-primary{min-width:100px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1$1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1$1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: i2$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i2$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i2$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i2$1.MatPrefix, selector: "[matPrefix], [matIconPrefix], [matTextPrefix]", inputs: ["matTextPrefix"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i5.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i5.DefaultValueAccessor, selector: "input:not([type=checkbox]):not([ngNoCva])[formControlName],textarea:not([ngNoCva])[formControlName],input:not([type=checkbox]):not([ngNoCva])[formControl],textarea:not([ngNoCva])[formControl],input:not([type=checkbox]):not([ngNoCva])[ngModel],textarea:not([ngNoCva])[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i5.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i5.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],[formArray],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i5.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i5.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i5.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: OrcidDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-orcid-dialog', standalone: true, imports: [
                        CommonModule,
                        MatDialogModule,
                        MatInputModule,
                        MatIconModule,
                        MatTooltipModule,
                        ReactiveFormsModule
                    ], template: "<h2 mat-dialog-title class=\"dialog-title\">Enter ORCID researcher identifier</h2>\n\n<mat-dialog-content class=\"dialog-content\">\n  <form [formGroup]=\"orcidForm\" class=\"orcid-form\">\n    <mat-form-field appearance=\"outline\" class=\"form-field-full\" subscriptSizing=\"fixed\">\n      <mat-icon matPrefix class=\"input-icon-prefix\">fingerprint</mat-icon>\n      <input matInput\n             formControlName=\"orcid\"\n             placeholder=\"0000-0000-0000-0000\"\n             maxlength=\"19\"\n             class=\"orcid-input-field\">\n      <mat-hint class=\"custom-hint\">Format: 0000-0000-0000-0000</mat-hint>\n      \n      @if (orcidForm.get('orcid')?.hasError('required')) {\n        <mat-error>ORCID is required</mat-error>\n      }\n      @if (orcidForm.get('orcid')?.hasError('pattern')) {\n        <mat-error>Invalid ORCID format</mat-error>\n      }\n    </mat-form-field>\n  </form>\n\n  <div class=\"orcid-info\">\n  <!-- Adding matTooltip makes this icon fully interactive out of the box -->\n  <mat-icon class=\"info-icon\" \n            matTooltip=\"ORCID helps distinguish you from every other researcher with a matching name.\" \n            matTooltipPosition=\"above\"\n            style=\"cursor: help;\">\n    info\n  </mat-icon>\n  <span>\n  ORCID provides a persistent digital identifier for researchers.\n  <a href=\"https://orcid.org/\" (click)=\"onLinkClick($event)\" class=\"orcid-link\">Learn more</a>\n</span>\n</div>\n</mat-dialog-content>\n\n<div class=\"dialog-actions\">\n  <button type=\"button\"\n          (click)=\"onCancel()\"\n          class=\"btn-outline-primary\">\n    Cancel\n  </button>\n  <button type=\"button\"\n          (click)=\"onSave()\"\n          [disabled]=\"orcidForm.invalid\"\n          class=\"btn-outline-primary btn-save\">\n    Save\n  </button>\n</div>", styles: [":root{--hpo-btn-radius: 6px;--hpo-btn-font-weight: 500;--hpo-btn-transition: all .15s ease-in-out}.hpo-btn-primary,.dialog-actions .btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;font-size:14px;font-weight:var(--hpo-btn-font-weight);border-radius:var(--hpo-btn-radius);cursor:pointer;transition:var(--hpo-btn-transition);border:1px solid transparent}.hpo-btn-primary:disabled,.dialog-actions .btn-primary:disabled{background:#e2e8f0!important;color:#94a3b8!important;border-color:transparent!important;cursor:not-allowed!important;box-shadow:none!important}.hpo-btn-primary,.dialog-actions .btn-primary{background:var(--hpo-ui-primary-color, #0284c7);color:#fff}.hpo-btn-primary:hover:not(:disabled),.dialog-actions .btn-primary:hover:not(:disabled){background:var(--hpo-ui-primary-hover, #0369a1)}.hpo-btn-secondary,.dialog-actions .btn-secondary{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;font-size:14px;font-weight:var(--hpo-btn-font-weight);border-radius:var(--hpo-btn-radius);cursor:pointer;transition:var(--hpo-btn-transition);border:1px solid transparent}.hpo-btn-secondary:disabled,.dialog-actions .btn-secondary:disabled{background:#e2e8f0!important;color:#94a3b8!important;border-color:transparent!important;cursor:not-allowed!important;box-shadow:none!important}.hpo-btn-secondary,.dialog-actions .btn-secondary{border-color:var(--hpo-ui-border-dark, #cbd5e1);background:#fff;color:#475569}.hpo-btn-secondary:hover:not(:disabled),.dialog-actions .btn-secondary:hover:not(:disabled){background:#f8fafc;color:#1e293b;border-color:#94a3b8}:host{display:block;font-family:var(--hpo-ui-font-family, system-ui, sans-serif);--mdc-dialog-container-shape: 12px}.dialog-title{margin:0!important;padding:24px 24px 10px!important;border-bottom:none!important;font-size:1.25rem;font-weight:600;margin-bottom:1rem!important}mat-dialog-content.dialog-content{min-width:400px;overflow:hidden!important;display:block!important;border-top:none!important;border-bottom:none!important;padding-top:12px!important}.orcid-form{margin-top:.5rem}.orcid-form .form-field-full{width:100%}.orcid-form .form-field-full input.mat-mdc-input-element{padding-left:8px!important}.input-icon-prefix{color:var(--hpo-ui-text-muted, #94a3b8);margin-right:12px!important;font-size:20px;width:20px;height:20px}.orcid-info{background:var(--hpo-ui-bg-light, #f8f9fa);padding:12px;border-radius:6px;margin-top:20px;font-size:13px;display:flex;align-items:center;gap:10px;color:var(--hpo-ui-text-muted, #4b5563);border:1px solid var(--hpo-ui-border-light, #e5e7eb)}.orcid-info .orcid-link{color:var(--hpo-ui-link-color, #2563eb);text-decoration:underline}.dialog-actions{padding:16px;display:flex;justify-content:flex-end;gap:12px}.dialog-actions .btn-secondary,.dialog-actions .btn-primary{min-width:100px}\n"] }]
        }], propDecorators: { externalLinkClicked: [{ type: i0.Output, args: ["externalLinkClicked"] }] } });

class LoadOntologyComponent {
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ [])); // e.g., "HPO" or "MAxO"
    isLoading = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoading" }] : /* istanbul ignore next */ []));
    isLoaded = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoaded" }] : /* istanbul ignore next */ []));
    statusMessage = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "statusMessage" }] : /* istanbul ignore next */ []));
    termCount = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "termCount" }] : /* istanbul ignore next */ []));
    helpUrl = input('https://p2gx.github.io/phenoboard/help/start.html', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "helpUrl" }] : /* istanbul ignore next */ []));
    helpLines = input(['Select the ontology file.'], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "helpLines" }] : /* istanbul ignore next */ []));
    onLoad = output();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: LoadOntologyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.2", type: LoadOntologyComponent, isStandalone: true, selector: "ui-load-ontology", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, isLoading: { classPropertyName: "isLoading", publicName: "isLoading", isSignal: true, isRequired: true, transformFunction: null }, isLoaded: { classPropertyName: "isLoaded", publicName: "isLoaded", isSignal: true, isRequired: true, transformFunction: null }, statusMessage: { classPropertyName: "statusMessage", publicName: "statusMessage", isSignal: true, isRequired: true, transformFunction: null }, termCount: { classPropertyName: "termCount", publicName: "termCount", isSignal: true, isRequired: false, transformFunction: null }, helpUrl: { classPropertyName: "helpUrl", publicName: "helpUrl", isSignal: true, isRequired: false, transformFunction: null }, helpLines: { classPropertyName: "helpLines", publicName: "helpLines", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { onLoad: "onLoad" }, ngImport: i0, template: "<div class=\"home-card__row\">\n    <div class=\"action-with-help\">\n        <button (click)=\"onLoad.emit()\" [disabled]=\"isLoading()\" class=\"btn-outline-primary home-card__action-btn\">\n            @if (isLoading()) {\n                <mat-spinner diameter=\"15\"></mat-spinner>\n                <span>Loading...</span>\n            } @else {\n                <span>Load {{ label() }}</span>\n            }\n        </button>\n        \n        <ui-help-button \n            [title]=\"'Loading the ' + label()\" \n            [lines]=\"helpLines()\" \n            [helpUrl]=\"helpUrl()\" />\n    </div>\n    \n    <div class=\"ontology-status\">\n        <span [ngClass]=\"{\n            'ontology-status__text--loading': isLoading(), \n            'ontology-status__text--loaded': isLoaded()}\" \n            class=\"ontology-status__text\">\n            @if(isLoaded()) {\n                <mat-icon class=\"ontology-status__icon\">check_circle</mat-icon> \n                {{ statusMessage() }}\n                <span class=\"ontology-status__terms\">{{ termCount() }} terms available</span>\n            }\n        </span>\n    </div>\n</div>", styles: [".home-card__section-label{font-size:1.1rem;font-weight:600;margin-bottom:12px;color:#333}.home-card__row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}.action-with-help{display:flex;align-items:center;gap:8px}.action-with-help .home-card__action-btn{display:inline-flex;align-items:center;gap:8px;min-width:120px;justify-content:center}.ontology-status{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.ontology-status__text{display:flex;align-items:center;gap:6px;font-size:.9rem;color:#666}.ontology-status__text--loading{color:#0288d1}.ontology-status__text--loaded{color:#388e3c;font-weight:500}.ontology-status__icon{font-size:18px;width:18px;height:18px}.ontology-status__terms{font-size:.8rem;color:#757575}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1$2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: MatProgressSpinnerModule }, { kind: "component", type: i2$2.MatProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "mode", "value", "diameter", "strokeWidth"], exportAs: ["matProgressSpinner"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: HelpButtonComponent, selector: "ui-help-button", inputs: ["title", "lines", "helpUrl"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: LoadOntologyComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-load-ontology', standalone: true, imports: [
                        CommonModule,
                        MatProgressSpinnerModule,
                        MatIconModule,
                        HelpButtonComponent
                    ], template: "<div class=\"home-card__row\">\n    <div class=\"action-with-help\">\n        <button (click)=\"onLoad.emit()\" [disabled]=\"isLoading()\" class=\"btn-outline-primary home-card__action-btn\">\n            @if (isLoading()) {\n                <mat-spinner diameter=\"15\"></mat-spinner>\n                <span>Loading...</span>\n            } @else {\n                <span>Load {{ label() }}</span>\n            }\n        </button>\n        \n        <ui-help-button \n            [title]=\"'Loading the ' + label()\" \n            [lines]=\"helpLines()\" \n            [helpUrl]=\"helpUrl()\" />\n    </div>\n    \n    <div class=\"ontology-status\">\n        <span [ngClass]=\"{\n            'ontology-status__text--loading': isLoading(), \n            'ontology-status__text--loaded': isLoaded()}\" \n            class=\"ontology-status__text\">\n            @if(isLoaded()) {\n                <mat-icon class=\"ontology-status__icon\">check_circle</mat-icon> \n                {{ statusMessage() }}\n                <span class=\"ontology-status__terms\">{{ termCount() }} terms available</span>\n            }\n        </span>\n    </div>\n</div>", styles: [".home-card__section-label{font-size:1.1rem;font-weight:600;margin-bottom:12px;color:#333}.home-card__row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}.action-with-help{display:flex;align-items:center;gap:8px}.action-with-help .home-card__action-btn{display:inline-flex;align-items:center;gap:8px;min-width:120px;justify-content:center}.ontology-status{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.ontology-status__text{display:flex;align-items:center;gap:6px;font-size:.9rem;color:#666}.ontology-status__text--loading{color:#0288d1}.ontology-status__text--loaded{color:#388e3c;font-weight:500}.ontology-status__icon{font-size:18px;width:18px;height:18px}.ontology-status__terms{font-size:.8rem;color:#757575}\n"] }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], isLoading: [{ type: i0.Input, args: [{ isSignal: true, alias: "isLoading", required: true }] }], isLoaded: [{ type: i0.Input, args: [{ isSignal: true, alias: "isLoaded", required: true }] }], statusMessage: [{ type: i0.Input, args: [{ isSignal: true, alias: "statusMessage", required: true }] }], termCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "termCount", required: false }] }], helpUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "helpUrl", required: false }] }], helpLines: [{ type: i0.Input, args: [{ isSignal: true, alias: "helpLines", required: false }] }], onLoad: [{ type: i0.Output, args: ["onLoad"] }] } });

class NotificationService {
    snackBar;
    constructor(snackBar) {
        this.snackBar = snackBar;
    }
    showError(message, duration = 8000) {
        this.snackBar.open(message, 'Dismiss', {
            panelClass: ['error-snackbar'],
            duration,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }
    showSuccess(message, duration = 4000) {
        this.snackBar.open(message, 'OK', {
            panelClass: ['success-snackbar'],
            duration,
            verticalPosition: 'bottom',
        });
    }
    showWarning(message, duration = 6000) {
        this.snackBar.open(message, 'Close', {
            panelClass: ['warning-snackbar'],
            duration,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: NotificationService, deps: [{ token: i1$3.MatSnackBar }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: NotificationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.2", ngImport: i0, type: NotificationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1$3.MatSnackBar }] });

/*
 * Public API Surface of ng-hpo-uikit
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FooterComponent, HelpButtonComponent, LoadOntologyComponent, NgHpoUikit, NotificationService, OrcidDialogComponent };
//# sourceMappingURL=ng-hpo-uikit.mjs.map
