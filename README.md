
# CEDAR Bridging

CEDAR Bridging, the frontend application designed for requesting Digital Object Identifiers (DOIs) for templates and instances. It empowers users to fill out CEDAR DataCite templates, supplying essential details about templates or instances to generate DOIs. This component is an essential part of the comprehensive CEDAR application. CEDAR documentation is at [metadatacenter.org](https://metadatacenter.org/).

## Features

**User-Friendly Interface:**  
CEDAR Bridging integrates the [Cedar Embeddable Editor](https://github.com/metadatacenter/cedar-embeddable-editor)(CEE) to render the CEDAR DataCite templates. The image below showcases the initial interface when a user is creating a DOI for a template or instance.
![Initial Interface](cedar-bridging-dist/assets/images/initial_interface.png)   

If a draft has been previously saved, a notification will appear at the top of the page, allowing users to resume editing the pre-saved metadata.
![Initial Interface](cedar-bridging-dist/assets/images/draft_DOI_existing_notification.png)

## Getting Started

First, navigate to the cedar-bridging-src directory:
```shell
$ cd <...>/<clone directory>/cedar-bridging/cedar-bridging-src
```

### Install Dependencies

`npm install --legacy-peer-deps`

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4340/`. The application will automatically reload if you change any of the source files.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

Run `ng test` to execute the unit tests with Vitest in headless Chromium.

### Running Browser Tests

The browser tests in `../browser` drive the built application in Chromium with Playwright. Run
`ng build` here, then `npm install` and `npm test` in `../browser`.

## Questions

If you have questions about this repository, please subscribe to the
[CEDAR Developer Support mailing list](https://mailman.stanford.edu/mailman/listinfo/cedar-developers).

After subscribing, send messages to cedar-developers at lists.stanford.edu.



