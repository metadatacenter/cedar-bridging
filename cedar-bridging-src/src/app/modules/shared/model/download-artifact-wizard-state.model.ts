export class DownloadArtifactWizardState {
  serializationFormat: 'json' | 'yaml' | 'yamlc' = 'json';
  packageContent: 'instance' | 'with-template' = 'instance';
  downloadFormat: 'raw' | 'zip' = 'raw';
  deliver: 'download' | 'in-browser' = 'download';
}
