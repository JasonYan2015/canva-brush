import React, { useState } from 'react';
import { FileInput, ImageCard, Text, Title } from '@canva/app-ui-kit';
import { getAuthToken } from 'src/utils/auth';

export const UploadLocalImage = () => {
  const [fileUrl, setFileUrl] = useState('');

  const handleUploadFile = async (files: File[]) => {
    const file = files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const fileName = `tempImage_${Date.now()}.${file.type.split('/')[1]}`;
      const result: { url: string } = await(
        await fetch(
          `https://fusion-brush-cf.xiongty.workers.dev/api/uploads/${fileName}`,
          {
            method: 'POST',
            headers: {
              Authorization: await getAuthToken(),
            },
            body: formData,
          }
        )
      ).json();

      console.log(`🚧 || result`, result);
      setFileUrl(result.url);
    }
  };

  const removeImage = () => {
    setFileUrl('');
  };

  return (
    <>
      {!fileUrl ? (
        <FileInput
          stretchButton
          accept={['image/*']}
          onDropAcceptedFiles={handleUploadFile}
        />
      ) : (
        <>
          <Title size='small'>Local image</Title>
          <Text size='small' tone='tertiary'>
            This local image is made draggable via drag and drop and asset
            upload.
          </Text>
          <ImageCard
            ariaLabel='Add image to design'
            alt='dog image'
            thumbnailUrl={fileUrl}
            onClick={removeImage}
          />
        </>
      )}
    </>
  );
};

