import React, { useState } from 'react';
import { FileInput, ImageCard, Text, Title } from '@canva/app-ui-kit';
import { upload } from '@canva/asset';
import { ui } from '@canva/design';

export const UploadLocalImage = () => {
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
        setFileBase64(`data:${file.type};base64,` + base64String);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const removeImage = () => {
    setFileBase64('');
  };

  return (
    <>
      {!fileBase64 ? (
        <>
          <Title size='small'>Select Target Image</Title>
          <FileInput
            stretchButton
            accept={['image/*']}
            onDropAcceptedFiles={handleUploadFile}
          />
        </>
      ) : (
        <>
          <Title size='small'>Target Image</Title>
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
