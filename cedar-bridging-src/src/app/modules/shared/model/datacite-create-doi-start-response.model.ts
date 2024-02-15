export interface DataCiteCreateDOIStartResponse {
  sourceArtifactType: string;
  sourceArtifact: object;
  dataCiteTemplate: object;
  existingDataCiteMetadata: object | null
  draftDoi: object | null,
  errorKey: string
}
