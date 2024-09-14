export interface DownloadArtifactAvailableResponse {
  available: boolean;
  accessible: boolean;
  artifactType: string | null;
  schemaName: string | null;
  schemaDescription: string | null;
  availableFormats: string[];
  templateAvailable: boolean;
  templateAccessible: boolean;
  downloadUri: string | null;
}
