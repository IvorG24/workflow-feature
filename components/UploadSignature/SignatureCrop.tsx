import getCroppedImg, { convertAspectRatio } from "@/utils/cropImage";
import { Button, Container, Flex, Slider } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
  file: File;
  setFile: (payload: File | null) => void;
  onClose: () => void;
  onSaveChanges: (payload: File | null) => void;
};

const SignatureCrop = ({ file, setFile, onClose, onSaveChanges }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<File | null>(null);

  useEffect(() => {
    const getFileUrl = async () => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setFileUrl(url);
        };

        const resizedImage = await convertAspectRatio(file);
        setConvertedImage(resizedImage);

        reader.readAsDataURL(resizedImage);
      }
    };
    getFileUrl();
  }, [file]);

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = useCallback(async () => {
    setIsLoading(true);
    if (!croppedAreaPixels) return;
    if (!convertedImage) return;
    try {
      const croppedImageFile = await getCroppedImg(
        convertedImage,
        croppedAreaPixels
      );

      setFile(croppedImageFile);
      onSaveChanges(croppedImageFile);
      onClose();
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }, [croppedAreaPixels, file, onClose, onSaveChanges, setFile]);

  const onCancel = useCallback(() => {
    setFile(null);
    onClose();
  }, []);

  return (
    <Container fluid p={0} m={0}>
      {fileUrl && (
        <Container w={250} pos="relative" h={200} bg="dark">
          <Cropper
            image={fileUrl}
            crop={crop}
            zoom={zoom}
            cropSize={{ height: 200, width: 250 }}
            aspect={1.25 / 1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: {
                background: "white",
                border: `1.5px solid #e7e7e7`,
              },
              mediaStyle: { background: "red" },
            }}
          />
        </Container>
      )}
      <Flex direction="column" mt="xs" gap="md">
        <Slider
          label={null}
          value={zoom}
          onChange={setZoom}
          min={1}
          max={3}
          step={0.1}
        />

        <Flex align="center" justify="center" gap="md">
          <Button
            size="xs"
            type="submit"
            aria-label="save changes"
            loading={isLoading}
            onClick={showCroppedImage}
          >
            Save Changes
          </Button>
          <Button
            onClick={onCancel}
            size="xs"
            aria-label="cancel"
            variant="subtle"
          >
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
};

export default SignatureCrop;
