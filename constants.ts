
import type { Style } from './types';

export const STYLES: Style[] = [
  {
    title: 'Siêu Thực Ám Ảnh',
    description: '3D thực tế, không khí lạnh lẽo, hiệu ứng Uncanny Valley gây ám ảnh.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: 3D photorealistic, eerie atmosphere, cold lighting, isolated subject, uncanny valley effect. Desaturated colors. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Siêu thực Điện ảnh',
    description: 'Photorealistic, ánh sáng 3 điểm chuyên nghiệp, độ chi tiết 8K.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Photorealistic, cinematic 8k movie still, high budget production, 3-point professional lighting, shallow depth of field. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Cổ tích Việt Nam',
    description: '3D tả thực hiện đại, bối cảnh kiến trúc và trang phục thuần Việt.',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Modern 3D realism, Vietnamese culture aesthetic. Traditional architecture, ancient village vibes, emotional lighting. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Người Que (Stickman)',
    description: 'Nghệ thuật người que tối giản nhưng cực kỳ điện ảnh và năng động.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Cinematic Stickman art, thick black outlines on high contrast background, dynamic poses, expressive minimalist face. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Màu Nước (Watercolor)',
    description: 'Nét vẽ loang nghệ thuật, mộc mạc trên nền giấy vân canson.',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Artistic Watercolor painting, bleeding colors, wet-on-wet technique, visible paper texture, messy ink splashes. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Bộ Xương (Skeleton)',
    description: 'Dark Fantasy, các nhân vật dưới hình dạng bộ xương chi tiết.',
    imageUrl: 'https://images.unsplash.com/photo-1530546171585-cc042ea5d7ab?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Dark Fantasy, skeleton anatomy detail, mystical blue soul fire, gothic atmosphere, high detail bone texture. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Pixel Art (16-bit)',
    description: 'Phong cách trò chơi điện tử Retro thập niên 90.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: 16-bit Pixel Art, SNES aesthetic, dithered shading, limited vibrant palette, retro game character design. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Đất Sét (Claymation)',
    description: 'Hoạt hình đất sét nặn thủ công, có dấu vân tay thực tế.',
    imageUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Claymation, stop-motion clay art, handmade texture with subtle fingerprint details, studio lighting. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Cyberpunk Neon',
    description: 'Tương lai Sci-fi rực rỡ với đèn Neon Cyan và Magenta.',
    imageUrl: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Cyberpunk futuristic, neon-drenched streets, rain reflections, glowing cyan and magenta lights, high tech low life. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Phác Thảo Chì (Pencil)',
    description: 'Nét chì thô sơ, vẽ tay trên giấy, đậm chất phác họa.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Hand-drawn pencil sketch, rough lead lines, cross-hatching shadows, messy artistic graphite on white paper. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Anime Nhật Bản',
    description: 'Hoạt hình Modern Anime, nét vẽ sạch, màu sắc lung linh.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Modern Japanese Anime, clean line art, vibrant colors, magical glow effects, expressive character eyes. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Tranh Cắt Giấy (Paper)',
    description: 'Nghệ thuật xếp giấy nhiều lớp, tạo chiều sâu vật lý.',
    imageUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Paper Cutout art, multi-layered paper stacks, realistic drop shadows, textured craft paper, diorama feel. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Tranh Sơn Dầu (Oil)',
    description: 'Kết cấu cọ dày (impasto), màu sắc đậm đà phong cách phục hưng.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Classic Oil Painting, heavy impasto brushstrokes, canvas texture, dramatic chiaroscuro lighting, rich pigments. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Cybernetic Robot',
    description: 'Cơ khí hóa nhân vật với dây cáp và mạch điện chi tiết.',
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Hard-surface robotic design, exposed wires and hydraulic cylinders, polished metal finish, cybernetic enhancements. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Tối Giản (Minimalist)',
    description: 'Nghệ thuật Vector phẳng, màu sắc chọn lọc, tinh tế.',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Minimalist Vector Illustration, flat design, limited color palette, clean geometric shapes, modern aesthetic. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: '3D Disney/Pixar',
    description: 'Hoạt hình 3D dễ thương, mắt to, biểu cảm thân thiện.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: 3D Animation Disney/Pixar style, cute character proportions, soft warm lighting, vibrant and friendly colors. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Truyện Tranh Cổ (Retro)',
    description: 'Comics thập niên 60, hiệu ứng chấm Ben-Day dots.',
    imageUrl: 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Silver Age Comic Book, Ben-Day dots texture, bold black outlines, vintage CMYK color palette, action-oriented. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Huyền Ảo (Dark Fantasy)',
    description: 'Gothic, ma mị, lâu đài cổ và sương mù huyền bí.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Dark Fantasy Gothic, misty graveyard atmosphere, haunting moonlight, intricate lace and iron details. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Vẩy Mực Neon (Splash)',
    description: 'Trừu tượng, vẩy mực đen kết hợp ánh sáng Neon rực rỡ.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Ink Splash art, chaotic black ink drips mixed with glowing neon energy, abstract and high energy composition. Context: [A]. [CHARACTER_STYLE]`
  },
  {
    title: 'Đa Giác (Low-Poly)',
    description: 'Tạo hình từ các mảng khối đa giác hiện đại.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    tooltip: '', locked: false,
    promptTemplate: `Style: Low-Poly Polygonal art, sharp geometric facets, faceted lighting, modern digital sculpture aesthetic. Context: [A]. [CHARACTER_STYLE]`
  }
];

export const PRESET_PROMPT_SEGMENT = `Chia nhỏ kịch bản trên ra thành các dòng ngắn 7-15 chữ...`;
export const PRESET_PROMPT_CONTEXT = `”Phân tích kịch bản gốc đã được cung cấp...`;
