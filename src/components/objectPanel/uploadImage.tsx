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
      reader.onload = async event => {
        if (!event.target) return;
        // 读取文件的 ArrayBuffer
        const arrayBuffer = event.target.result as ArrayBuffer;
        // 将 ArrayBuffer 转换为二进制字符串
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = String.fromCharCode(...uint8Array);
        // 将二进制字符串转换为 base64 编码
        const base64String = btoa(binaryString);

        const newFileBase64 = `data:${file.type};base64,` + base64String;
        setFileBase64(newFileBase64);
        onUpload({ file: newFileBase64 });
      };
      reader.readAsArrayBuffer(file);
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
