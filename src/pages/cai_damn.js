import React from 'react';
import Navbar from '../components/Navbar';
import PhotoGallery from '../components/PhotoGallery';
import StoryTray from '../components/StoryTray';
import Typewriter from '../components/Typewriter';
import { client } from '../sanity/lib/client';
import { groq } from 'next-sanity';


// DAMN Page Component / DAMN 页面组件
function CaiDamn({ photos }) {

  const [selectedPhoto, setSelectedPhoto] = React.useState(null);

  // Filter photos for StoryTray - must have tags
  // 过滤用于 StoryTray 的照片 - 必须包含标签
  const storyPhotos = photos?.filter(p => Array.isArray(p.tags) && p.tags.length > 0) || [];

  return (
    <div className="relative min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(rgba(0,0,0,0.08)_5%,transparent_5%)] dark:bg-[radial-gradient(rgba(255,255,255,.18)_5%,transparent_5%)] bg-[position:0%_0%] bg-[length:25px_25px] pointer-events-none z-0"></div>

      {/* Typewriter Header */}
      <div className="absolute top-0 left-0 w-full h-[650px] flex items-center justify-center pointer-events-none z-10 select-none pb-32" style={{
        fontFamily: 'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace'
      }}>
        <h1 className="text-sm font-normal tracking-widest text-black dark:text-white uppercase">
          <Typewriter text="DAMN" delay={150} />
        </h1>
      </div>

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
