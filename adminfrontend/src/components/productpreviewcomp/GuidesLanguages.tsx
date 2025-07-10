import { Users } from 'lucide-react';
import type { Product } from '../../types/index.ts';


export const GuidesLanguages = ({ product }: {product: Product}) => {
  if (!product.guides || !Array.isArray(product.guides) || product.guides.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Guides</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-3">
          {product.guides.map((guide: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
              <div className="font-medium text-gray-900">{guide.language}</div>
              <div className="flex items-center space-x-4">
                {guide.inPerson && (
                  <div className="flex items-center text-blue-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">In-person</span>
                  </div>
                )}
                {guide.audio && (
                  <div className="flex items-center text-green-600">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114a4 4 0 100 1.772V6.114l8-1.6v4.9a4 4 0 100 1.772V3z" />
                    </svg>
                    <span className="text-sm">Audio</span>
                  </div>
                )}
                {guide.written && (
                  <div className="flex items-center text-purple-600">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Written</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};