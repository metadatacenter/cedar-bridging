import {TargetOptions} from '@angular-builders/custom-webpack';

export default (targetOptions: TargetOptions, indexHtml: string) => {
  // should be
  // if (targetOptions.configuration.includes('production')) {
  // but that does not work
  // This is a workaround for now
  if (targetOptions.target === 'serve') {
    indexHtml = indexHtml.replaceAll('metadatacenter.org', 'metadatacenter.orgx');
  }

  return indexHtml;

};
