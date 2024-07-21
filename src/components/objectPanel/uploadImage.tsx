import React, { useState } from 'react';
import { FileInput, ImageCard, Text } from '@canva/app-ui-kit';

interface IUploadLocalImage {
  onUpload: (p: { file: string }) => void;
}
export const UploadLocalImage: React.FC<IUploadLocalImage> = ({ onUpload }) => {
  const [fileBase64, setFileBase64] = useState('');

  const handleUploadFile = async (files: File[]) => {
    const file = files[0];
    const chunkSize = 1024 * 1024; // 1MB chunk size
    let fileIndex = 0;

    if (file) {
      const reader = new FileReader();
      // 开始读取文件的第一个 chunk
      // 在 onload 里会递归地读后续部分
      reader.readAsArrayBuffer(file.slice(0, chunkSize));

      let fileBase64 = `data:${file.type};base64,`;
      reader.onload = async event => {
        if (!event.target) return;

        const arrayBuffer = event.target.result as ArrayBuffer;
        // 处理 ArrayBuffer，例如发送到服务器或转换为 base64
        // 这里仅演示将 ArrayBuffer 转换为 base64 编码
        const base64String = arrayBufferToBase64(arrayBuffer);

        // 累加 base64 编码的片段
        fileBase64 += base64String;

        // 检查是否还有更多的文件需要读取
        fileIndex += chunkSize;
        if (fileIndex < file.size) {
          setTimeout(() => {
            reader.readAsArrayBuffer(
              file.slice(fileIndex, fileIndex + chunkSize)
            );
          }, 100);
        } else {
          fileBase64 += base64String;
          console.log(`🚧 || fileBase64`, fileBase64);
          setFileBase64(fileBase64);
          onUpload({ file: fileBase64 });
        }
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

// ArrayBuffer 转换为 base64 编码的辅助函数
function arrayBufferToBase64(buffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(buffer);
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
}