import { Area } from "react-easy-crop/types";

export const createImage = async (url: string): Promise<HTMLImageElement> => {
  return new Promise(async (resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues
    image.src = url;
  });
};

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc: File,
  pixelCrop: Area
): Promise<File | null> {
  const fileUrl = URL.createObjectURL(imageSrc);
  const image = await createImage(fileUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);

  canvas.width = maxSize;
  canvas.height = maxSize;

  if (!ctx) return null;

  ctx.drawImage(
    image,
    maxSize / 2 - image.width * 0.5,
    maxSize / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, maxSize, maxSize);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    0 - maxSize / 2 + image.width * 0.5 - pixelCrop.x,
    0 - maxSize / 2 + image.height * 0.5 - pixelCrop.y
  );

  const imageBlob = (await new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (!file) return;
      resolve(file);
    }, imageSrc.type);
  })) as Blob;

  return new File([imageBlob], imageSrc.name, {
    type: imageSrc.type,
  });
}

export const convertAspectRatio = async (file: File): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid file type. Please provide an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const img = new Image();

        if (event.target && event.target.result) {
          img.src = event.target.result as string;

          await new Promise((imgLoadResolve) => {
            img.onload = imgLoadResolve;
          });

          const targetAspectRatio = 1.25;
          const originalAspectRatio = img.width / img.height;
          let newWidth, newHeight;

          if (originalAspectRatio > targetAspectRatio) {
            newWidth = img.width;
            newHeight = Math.round(img.width / targetAspectRatio);
          } else {
            newWidth = Math.round(img.height * targetAspectRatio);
            newHeight = img.height;
          }

          const canvas = document.createElement("canvas");
          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const offsetX = (canvas.width - img.width) / 2;
            const offsetY = (canvas.height - img.height) / 2;

            ctx.drawImage(img, offsetX, offsetY);

            canvas.toBlob((blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: file.type,
                });

                resolve(newFile);
              } else {
                reject(new Error("Failed to convert canvas content to Blob."));
              }
            }, file.type);
          } else {
            reject(new Error("Failed to get 2D context from canvas."));
          }
        } else {
          reject(new Error("Failed to load the file."));
        }
      } catch (e) {
        reject(e);
      }
    };

    reader.readAsDataURL(file);
  });
};
