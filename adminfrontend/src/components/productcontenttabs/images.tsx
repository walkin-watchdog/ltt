import type { ProductImagesTabProps } from "@/types.ts";
import { ImageUploader } from "../gallery/ImageUploader";



export const ProductImagesTab = ({ formData, updateFormData }: ProductImagesTabProps) => {
return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Product Images</h4>
              <p className="text-sm text-gray-600 mb-6">Upload high-quality images to showcase your product</p>
            </div>
            <ImageUploader
              images={formData.images || []}
              onChange={(images) => updateFormData({ images })}
              maxImages={10}
              folder="products"
              title="Product Images *"
            />
          </div>
        );
    }