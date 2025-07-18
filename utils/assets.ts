import * as path from 'path';

export enum AssetType {
  Lambda = 'lambda',
  Layer = 'layer'
};

const ASSETS_PATH = '/../assets';

export function buildAssetPath(assetName: string, assetType?: AssetType) {
  if (assetType === AssetType.Layer) {
    return path.join(__dirname, `${ASSETS_PATH}/layers/${assetName}/dist`);
  }

  return path.join(__dirname, `${ASSETS_PATH}/lambda-handler/${assetName}/dist/index.zip`);
}
