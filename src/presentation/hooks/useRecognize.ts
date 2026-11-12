import { useState, useCallback } from 'react';
import { recognizeDishUseCase } from '../../di/container';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';

export function useRecognize() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [candidates, setCandidates] = useState<RecognitionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognize = useCallback(async (imageUri: string): Promise<RecognitionResult[]> => {
    setIsRecognizing(true);
    setError(null);
    setCandidates([]);
    try {
      const result = await recognizeDishUseCase.execute(imageUri);
      if (result.success) {
        setCandidates(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return [];
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Nhận diện món ăn thất bại. Vui lòng thử lại.';
      setError(msg);
      return [];
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSelectedImage(null);
    setCandidates([]);
    setError(null);
    setIsRecognizing(false);
  }, []);

  return {
    selectedImage,
    setSelectedImage,
    isRecognizing,
    candidates,
    error,
    recognize,
    reset,
  };
}
