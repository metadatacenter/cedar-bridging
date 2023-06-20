import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {HttpClient} from '@angular/common/http';
import {UiService} from '../../../../services/ui.service';
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'datacite-create-instance',
  templateUrl: './datacite-create-instance.component.html',
  styleUrls: ['./datacite-create-instance.component.scss']
})
export class DataciteCreateInstanceComponent extends CedarPageComponent implements OnInit {

  public ceeConfig: object = {};
  public template: object | null = null;

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService,
    private http: HttpClient
  ) {
    super(localSettings, translateService, notify, router, route, keycloak, uiService);
  }

  override ngOnInit() {
    super.ngOnInit();
    let localCeeConfig = {
      "ceeConfig": {
        "sampleTemplateLocationPrefix": "http://localhost:4240/cedar-embeddable-editor-sample-templates/",
        "showSampleTemplateLinks": true,
        "loadSampleTemplateName": "01",
        "terminologyProxyUrl": "https://api-php.cee.metadatacenter.orgx/index.php",
        "collapseStaticComponents": false
      },
      "apiUrl": "https://open.metadatacenter.org/",
      "cedarUrl": "https://cedar.metadatacenter.org/",
      "terminologyUrl": "https://terminology.metadatacenter.org/"
    }

    let localTemplate = {
      "@id": "https://repo.metadatacenter.org/templates/ec3f500f-ddca-4ec1-9196-29932f9304fd",
      "@type": "https://schema.metadatacenter.org/core/Template",
      "@context": {
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "pav": "http://purl.org/pav/",
        "bibo": "http://purl.org/ontology/bibo/",
        "oslc": "http://open-services.net/ns/core#",
        "schema": "http://schema.org/",
        "schema:name": {
          "@type": "xsd:string"
        },
        "schema:description": {
          "@type": "xsd:string"
        },
        "pav:createdOn": {
          "@type": "xsd:dateTime"
        },
        "pav:createdBy": {
          "@type": "@id"
        },
        "pav:lastUpdatedOn": {
          "@type": "xsd:dateTime"
        },
        "oslc:modifiedBy": {
          "@type": "@id"
        }
      },
      "type": "object",
      "title": "single field template schema",
      "description": "single field template schema generated by the CEDAR Template Editor 2.5.0",
      "_ui": {
        "pages": [],
        "order": [
          "Single Text Field"
        ],
        "propertyLabels": {
          "Single Text Field": "Single Text Field"
        },
        "propertyDescriptions": {
          "Single Text Field": "Help Text"
        }
      },
      "properties": {
        "@context": {
          "type": "object",
          "properties": {
            "rdfs": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://www.w3.org/2000/01/rdf-schema#"
              ]
            },
            "xsd": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://www.w3.org/2001/XMLSchema#"
              ]
            },
            "pav": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://purl.org/pav/"
              ]
            },
            "schema": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://schema.org/"
              ]
            },
            "oslc": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://open-services.net/ns/core#"
              ]
            },
            "skos": {
              "type": "string",
              "format": "uri",
              "enum": [
                "http://www.w3.org/2004/02/skos/core#"
              ]
            },
            "rdfs:label": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:string"
                  ]
                }
              }
            },
            "schema:isBasedOn": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "@id"
                  ]
                }
              }
            },
            "schema:name": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:string"
                  ]
                }
              }
            },
            "schema:description": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:string"
                  ]
                }
              }
            },
            "pav:derivedFrom": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "@id"
                  ]
                }
              }
            },
            "pav:createdOn": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:dateTime"
                  ]
                }
              }
            },
            "pav:createdBy": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "@id"
                  ]
                }
              }
            },
            "pav:lastUpdatedOn": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:dateTime"
                  ]
                }
              }
            },
            "oslc:modifiedBy": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "@id"
                  ]
                }
              }
            },
            "skos:notation": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "enum": [
                    "xsd:string"
                  ]
                }
              }
            },
            "Single Text Field": {
              "enum": [
                "https://schema.metadatacenter.org/properties/358717f4-91aa-4aeb-829f-830ba88113bb"
              ]
            }
          },
          "required": [
            "xsd",
            "pav",
            "schema",
            "oslc",
            "schema:isBasedOn",
            "schema:name",
            "schema:description",
            "pav:createdOn",
            "pav:createdBy",
            "pav:lastUpdatedOn",
            "oslc:modifiedBy"
          ],
          "additionalProperties": false
        },
        "@id": {
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "@type": {
          "oneOf": [
            {
              "type": "string",
              "format": "uri"
            },
            {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "string",
                "format": "uri"
              },
              "uniqueItems": true
            }
          ]
        },
        "schema:isBasedOn": {
          "type": "string",
          "format": "uri"
        },
        "schema:name": {
          "type": "string",
          "minLength": 1
        },
        "schema:description": {
          "type": "string"
        },
        "pav:derivedFrom": {
          "type": "string",
          "format": "uri"
        },
        "pav:createdOn": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "pav:createdBy": {
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "pav:lastUpdatedOn": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "oslc:modifiedBy": {
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "Single Text Field": {
          "@type": "https://schema.metadatacenter.org/core/TemplateField",
          "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "pav": "http://purl.org/pav/",
            "bibo": "http://purl.org/ontology/bibo/",
            "oslc": "http://open-services.net/ns/core#",
            "schema": "http://schema.org/",
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "schema:name": {
              "@type": "xsd:string"
            },
            "schema:description": {
              "@type": "xsd:string"
            },
            "skos:prefLabel": {
              "@type": "xsd:string"
            },
            "skos:altLabel": {
              "@type": "xsd:string"
            },
            "pav:createdOn": {
              "@type": "xsd:dateTime"
            },
            "pav:createdBy": {
              "@type": "@id"
            },
            "pav:lastUpdatedOn": {
              "@type": "xsd:dateTime"
            },
            "oslc:modifiedBy": {
              "@type": "@id"
            }
          },
          "type": "object",
          "title": "Single Text Field field schema",
          "description": "Single Text Field field schema generated by the CEDAR Template Editor 2.5.0",
          "_ui": {
            "inputType": "textfield"
          },
          "_valueConstraints": {
            "requiredValue": false
          },
          "properties": {
            "@type": {
              "oneOf": [
                {
                  "type": "string",
                  "format": "uri"
                },
                {
                  "type": "array",
                  "minItems": 1,
                  "items": {
                    "type": "string",
                    "format": "uri"
                  },
                  "uniqueItems": true
                }
              ]
            },
            "@value": {
              "type": [
                "string",
                "null"
              ]
            },
            "rdfs:label": {
              "type": [
                "string",
                "null"
              ]
            }
          },
          "required": [
            "@value"
          ],
          "schema:name": "Single Text Field",
          "schema:description": "Help Text",
          "pav:createdOn": "2020-07-17T15:47:51-07:00",
          "pav:createdBy": "https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d",
          "pav:lastUpdatedOn": "2020-07-17T15:47:51-07:00",
          "oslc:modifiedBy": "https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d",
          "schema:schemaVersion": "1.6.0",
          "additionalProperties": false,
          "@id": "https://repo.metadatacenter.org/template-fields/175416dd-ce4e-48b6-bc19-c05d3b520489",
          "$schema": "http://json-schema.org/draft-04/schema#"
        }
      },
      "required": [
        "@context",
        "@id",
        "schema:isBasedOn",
        "schema:name",
        "schema:description",
        "pav:createdOn",
        "pav:createdBy",
        "pav:lastUpdatedOn",
        "oslc:modifiedBy",
        "Single Text Field"
      ],
      "schema:name": "single field",
      "schema:description": "description",
      "pav:createdOn": "2020-07-17T15:47:51-07:00",
      "pav:createdBy": "https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d",
      "pav:lastUpdatedOn": "2020-07-17T15:47:51-07:00",
      "oslc:modifiedBy": "https://metadatacenter.org/users/2fa8910d-96e7-4e2f-ae60-4dfa8ec9877d",
      "schema:schemaVersion": "1.6.0",
      "additionalProperties": false,
      "pav:version": "0.0.1",
      "bibo:status": "bibo:draft",
      "$schema": "http://json-schema.org/draft-04/schema#",
      "schema:identifier": "identifier"
    }

    setTimeout(() => {
      this.ceeConfig = localCeeConfig;
      this.template = localTemplate;
    }, 1000);
  }

}


