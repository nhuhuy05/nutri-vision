export interface PreprocessedImage {
  uri: string;
  width: number;
  height: number;
  channels: number;
}

export class ImagePreprocessor {
  private targetSize = 224;

  /**
   * Chuẩn bị thông số hình ảnh cho On-Device TFLite (kích thước chuẩn 224x224x3).
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

  /**
   * Chuyển đổi URI ảnh (từ Camera/Gallery) thành chuỗi Base64 nguyên chất
   * phục vụ gửi lên Cloud Vision API (Gemini 1.5 Flash).
   */
  async toBase64(imageUri: string): Promise<string> {
    if (!imageUri) {
      throw new Error('Image URI cannot be empty');
    }

    if (imageUri.startsWith('data:image')) {
      const parts = imageUri.split(',');
      return parts[1] || imageUri;
    }

    // Nếu đã là chuỗi Base64 thuần túy
    if (
      !imageUri.startsWith('file://') &&
      !imageUri.startsWith('http://') &&
      !imageUri.startsWith('https://') &&
      !imageUri.startsWith('content://') &&
      imageUri.length > 200
    ) {
      return imageUri;
    }

    const response = await fetch(imageUri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || dataUrl;
        resolve(base64);
      };
      reader.onerror = (err) => reject(new Error(`Failed to convert image to base64: ${err}`));
      reader.readAsDataURL(blob);
    });
  }
}
