# tauri-app-template

This is a template for an HPO-related Tauri Angular application.

## Features

The template runs already as a tauri app and shows how to load the HPO and the MAxO ontology. It has a few design decisions/features that we have found to be useful

- an application status service that listens to OntologyLoad events (these are used to update the view in the Home page)
- a configutation status service that serves as the central bridge between typescript frontend and rust backend code.
- User of [ng-hpo-uikit](https://p2gx.github.io/ng-hpo-uikit/)

## Usage

- You can use this as a template for new Tauri applications
- The template is partially based on the [phenoboard](https://github.com/P2GX/phenoboard) application
- Probably most use cases will profit from adding the navbar component from phenoboard and adapting it to the needs of the new app.


## For testing

Replace this line
```json
    "ng-hpo-uikit": "github:P2GX/ng-hpo-uikit#dist-build",
```
in the package.json file with
```json
"ng-hpo-uikit": "file:../path/to/your/library/dist/ng-hpo-uikit"
```
