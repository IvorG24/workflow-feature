import getCroppedImg from "@/utils/cropImage";
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

  useEffect(() => {
    const getFileUrl = async () => {
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const url = e.target?.result as string;
          setFileUrl(url);
        };

        reader.readAsDataURL(file);
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
    try {
      const croppedImageFile = await getCroppedImg(file, croppedAreaPixels, 0);

      setFile(croppedImageFile);
      onSaveChanges(croppedImageFile);
      onClose();
    } catch (e) {
      console.log("e", e);
      console.error(e);
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
        <Container w="100%" pos="relative" h={200} bg="dark">
          <Cropper
            image={fileUrl}
            crop={crop}
            zoom={zoom}
            aspect={3 / 2}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: { background: "white" },
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

        <Flex align="center" gap="md">
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
