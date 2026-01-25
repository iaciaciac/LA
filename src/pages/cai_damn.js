import React from 'react';
import Navbar from './components/Navbar';
import PhotoGallery from './components/PhotoGallery';
import StoryTray from './components/StoryTray';
import { client } from '../sanity/lib/client';
import { groq } from 'next-sanity';


// DAMN Page Component / DAMN 页面组件
function CaiDamn({ photos }) {

  const [selectedPhoto, setSelectedPhoto] = React.useState(null);

  // Filter photos for StoryTray - must have tags
  // 过滤用于 StoryTray 的照片 - 必须包含标签
  const storyPhotos = photos?.filter(p => Array.isArray(p.tags) && p.tags.length > 0) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Navbar />
      <div className="pt-[400px] mb-4 px-2 md:px-16 lg:px-40 2xl:px-48">
        <StoryTray photos={storyPhotos} onClick={setSelectedPhoto} />
      </div>
      {/* Photo Gallery Grid / 照片墙网格 */}
      <PhotoGallery
        photos={photos}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
      />
    </div>
  );
}

// Fetch photos from Sanity / 从 Sanity 获取照片数据
export const getStaticProps = async () => {
  // Sort by created time (newest first). Added _id desc as tiebreaker for bulk uploads.
  // 按创建时间排序（最新的在最前）。添加 _id 倒序作为批量上传的辅助排序。
  const query = groq`*[_type == "photo"] | order(_createdAt desc, _id desc) {
    _id,
    title,
    caption,
    image {
      asset->{
        _id,
        url,
        mimeType,
        originalFilename,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    },
    video {
      asset->{
        url
      }
    },
    gallery[] {
      title,
      mediaType,
      isLivePhoto,
      image {
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      },
      video {
        asset->{
          url
        }
      }
    },
    isLivePhoto,
    tags,
    _createdAt
  }`;

  const photos = await client.fetch(query);

  return {
    props: {
      photos: photos || [],
    },
    revalidate: 1, // Reduced to 1s for immediate updates during debugging
  };
};

export default CaiDamn;
