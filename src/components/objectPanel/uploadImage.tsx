import React, { useState } from 'react';
import { FileInput, ImageCard, Text } from '@canva/app-ui-kit';

interface IUploadLocalImage {
  onUpload: (p: { file: string }) => void;
}
export const UploadLocalImage: React.FC<IUploadLocalImage> = ({ onUpload }) => {
  const [fileBase64, setFileBase64] = useState('');

  const handleUploadFile = async (files: File[]) => {
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      // 开始读取文件的第一个 chunk
      // 在 onload 里会递归地读后续部分
      reader.readAsArrayBuffer(file);

      reader.onload = async event => {
        if (!event.target) return;

        const arrayBuffer = event.target.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setFileBase64(url);
        onUpload({ file: url });
      };

      reader.onerror = error => {
        console.error('Read error', error);
      };
    } else {
      onUpload({ file: '' });
    }
  };

  const removeImage = () => {
    setFileBase64('');
    onUpload({ file: '' });
  };

  return (
    <>
      {!fileBase64 ? (
        <>
          <Text size='small'>1. Upload A Target Image</Text>
          <FileInput
            stretchButton
            accept={['image/*']}
            onDropAcceptedFiles={handleUploadFile}
          />
        </>
      ) : (
        <>
          <Text size='small' tone='tertiary'>
            This image is the Target Mesh.And you can click this image to delete
            it.
          </Text>
          <ImageCard
            ariaLabel='target image'
            thumbnailUrl={fileBase64}
            onClick={removeImage}
          />
        </>
      )}
    </>
  );
};
