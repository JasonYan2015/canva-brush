import React, { useState } from 'react';
import { FileInput, ImageCard, Text } from '@canva/app-ui-kit';

interface IUploadLocalImage {
  onUpload: (p: { file: string }) => void;
  url?: string;
}
export const UploadLocalImage: React.FC<IUploadLocalImage> = ({
  onUpload,
  url,
}) => {
  const [fileBase64, setFileBase64] = useState(url);

  const handleUploadFile = async (files: File[]) => {
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // 这里e.target.result就是base64编码的图片数据
        const imageBase64 = e.target?.result as string;

        setFileBase64(imageBase64);
        onUpload({ file: imageBase64 });
      };
      reader.onerror = error => {
        console.error('Read error', error);
      };

      reader.readAsDataURL(file);
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
