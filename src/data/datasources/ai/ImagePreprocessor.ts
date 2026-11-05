export interface PreprocessedImage {
  uri: string;
  width: number;
  height: number;
  channels: number;
}

export class ImagePreprocessor {
  private targetSize = 224;

  /**
   * Prepares the image tensor shape and parameters for inference.
   * In a full on-device setup, this normalizes RGB pixels to [0, 1] or [-1, 1].
   */
  async preprocess(imageUri: string): Promise<PreprocessedImage> {
    if (!imageUri) {
      throw new Error('Image URI cannot be empty');
    }

    return {
      uri: imageUri,
      width: this.targetSize,
      height: this.targetSize,
      channels: 3,
    };
  }
}

