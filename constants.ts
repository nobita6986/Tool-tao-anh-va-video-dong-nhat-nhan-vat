
import type { Style } from './types';

// Template dùng cho dòng có nhân vật (Giữ nguyên logic cũ)
const buildTemplate = (
    mainStyle: string,
    skinStyle: string,
    clothesStyle: string,
    faceStyle: string,
    otherCharsStyle: string,
    bodyRatio: string,
    bgStyle: string
) => {
    return `IMPORTANT REQUIREMENT: Use only the image I provide to extract the character’s appearance and outfit. All background, environment, and actions must be created entirely from the text prompt below. Do not copy or reuse the original image background. This line must appear in every prompt.

Redraw my character with the exact same appearance and outfit, customized in:* ${mainStyle} *

Character details: [CHARACTER_STYLE]
+ Skin/Fur style: ${skinStyle}*
+ Outfit style: ${clothesStyle}*
+ Face style: ${faceStyle}*
+ Other characters (if any): ${otherCharsStyle}*
+ Body proportions (all characters): ${bodyRatio}*
+ Background style: ${bgStyle}*

The scene background is [A]

OUTPUT GUIDE: Do not write any text, title, or description. Your entire response must be only the generated image.*`;
};

// Template MỚI dùng cho dòng KHÔNG có nhân vật (Scene Focused)
const buildSceneTemplate = (
    mainStyle: string,
    skinStyle: string,
    clothesStyle: string,
    faceStyle: string,
    otherCharsStyle: string,
    bodyRatio: string,
    bgStyle: string
) => {
    return `IMPORTANT REQUIREMENT: All characters, environments, and actions must be created entirely based on the text prompt below. Do not reference or use any external images.

Illustrate the scene in:* ${mainStyle} *

Character details: [CHARACTER_STYLE based on script]
+ Skin/Fur style: ${skinStyle.replace('reflecting personality', 'Clean flat tones, minimal texture, clear shadow shapes, reflecting personality')}*
+ Outfit style: ${clothesStyle.replace('consistent outfit', 'outfit appropriate to time and setting, consistent within the same scene')}*
+ Face style: ${faceStyle}*
+ Other characters (if any): ${otherCharsStyle}*
+ Body proportions (all characters): ${bodyRatio}*
+ Background style: ${bgStyle}*

The scene background is [A]

OUTPUT GUIDE: Do not write any text, title, or description. Your entire response must be only the generated image.*`;
};

// Preset prompts for Chat UI
export const PRESET_PROMPT_SEGMENT = `Chia nhỏ kịch bản trên ra thành các dòng ngắn 7-15 chữ...`;
export const PRESET_PROMPT_CONTEXT = `”Phân tích kịch bản gốc đã được cung cấp...`;

export const STYLES: Style[] = [
  {
    title: 'Siêu thực Điện ảnh',
    description: 'Photorealistic, ánh sáng 3 điểm chuyên nghiệp, độ chi tiết 8K.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Lựa chọn tốt nhất cho phim Drama, TVC quảng cáo hoặc phim tài liệu cần độ chân thực cao.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Photorealistic, cinematic 8k movie still, high budget production, 3-point professional lighting, shallow depth of field, shot on ARRI Alexa.",
        "Hyper-realistic texture, visible skin pores, natural subsurface scattering, sweat or oil sheen if appropriate.",
        "High fidelity fabric textures (cotton, silk, leather visible), realistic folding, reaction to lighting.",
        "Cinematic realism, emotional micro-expressions, sharp focus on eyes, realistic skin imperfections.",
        "Photorealistic, blending seamlessly with the environment.",
        "Anatomically correct and realistic human proportions.",
        "Cinematic set design, depth of field (bokeh), dramatic lighting, highly detailed textures."
    ),
    sceneTemplate: buildSceneTemplate(
        "Photorealistic, cinematic 8k movie still, high budget production, 3-point professional lighting, shallow depth of field, shot on ARRI Alexa.",
        "Hyper-realistic texture, visible skin pores.",
        "High fidelity fabric textures, realistic folding.",
        "Cinematic realism, emotional micro-expressions.",
        "Photorealistic, blending seamlessly with the environment.",
        "Anatomically correct and realistic human proportions.",
        "Cinematic set design, depth of field (bokeh), dramatic lighting, highly detailed textures."
    )
  },
  {
    title: 'Hoạt hình Âu Mỹ (Modern 2D)',
    description: 'Phong cách hoạt hình phương Tây hiện đại, nét viền sạch, màu sắc tươi sáng.',
    imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phù hợp cho phim hoạt hình gia đình, video giáo dục, hoặc nội dung giải trí năng động.',
    locked: false,
    promptTemplate: buildTemplate(
        "2D Modern Western Animation style, clean bold lineart with dynamic line weight, controlled vibrant colors, 1–2 layer cel shading, subtle rim light, cinematic framing, energetic and friendly mood, highly expressive face, minimal clutter, looks like a modern Western animated TV frame.",
        "Clean flat tones, minimal texture, clear shadow shapes, personality-driven color.",
        "Strong silhouette, large color blocks, minimal folds, consistent outfit across same-time scenes.",
        "Clear eyes with simple highlights, flexible brows, simplified nose, readable mouth shapes, keep identifying accessories.",
        "Same style, varied shapes, clear color separation.",
        "Balanced Western cartoon proportions, not chibi, flexible limbs.",
        "Stylized 2D, clear shapes, medium detail, depth through color layers, key light + subtle rim light, clean modern look."
    ),
    sceneTemplate: buildSceneTemplate(
        "2D Modern Western Animation style, clean bold lineart with dynamic line weight, controlled vibrant colors, 1–2 layer cel shading, subtle rim light, cinematic framing, energetic and friendly mood, highly expressive face, minimal clutter, looks like a modern Western animated TV frame.",
        "Clean flat tones, minimal texture, clear shadow shapes.",
        "Strong silhouette, large color blocks, minimal folds.",
        "Clear eyes with simple highlights, flexible brows, simplified nose, readable mouth shapes.",
        "Same style, varied shapes, clear color separation.",
        "Balanced modern Western cartoon proportions, not chibi, flexible limbs.",
        "Stylized 2D environment, clear geometric shapes, moderate detail, depth through layered color, key light with subtle rim light, clean cinematic look."
    )
  },
  {
    title: 'Phim Nhựa (Vintage 1990s)',
    description: 'Phong cách phim cũ thập niên 90, nhiễu hạt, màu hoài cổ (VHS).',
    imageUrl: 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tạo cảm giác hoài niệm, video gia đình cũ hoặc phim tài liệu retro.',
    locked: false,
    promptTemplate: buildTemplate(
        "1990s vintage film aesthetic, VHS tape texture, film grain, slightly blurred, retro color grading, flash photography feel.",
        "Soft focus due to film grain, natural skin tones but slightly desaturated or yellow-tinted.",
        "90s fashion textures, slightly washed out colors due to film stock.",
        "Candid expressions, red-eye effect (optional), direct flash look, slightly soft edges.",
        "Vintage aesthetic, matching the grain and color grading.",
        "Realistic human proportions.",
        "Nostalgic atmosphere, cluttered 90s details, low light with camera flash, film grain overlay."
    ),
    sceneTemplate: buildSceneTemplate(
        "1990s vintage film aesthetic, VHS tape texture, film grain, slightly blurred, retro color grading, flash photography feel.",
        "Soft focus due to film grain, natural skin tones.",
        "90s fashion textures, slightly washed out colors.",
        "Candid expressions, red-eye effect (optional).",
        "Vintage aesthetic, matching the grain and color grading.",
        "Realistic human proportions.",
        "Nostalgic atmosphere, cluttered 90s details, low light with camera flash, film grain overlay."
    )
  },
  {
    title: 'Studio Ghibli',
    description: 'Nét vẽ tay thơ mộng, màu sắc tươi sáng, mây trắng trời xanh.',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tuyệt đẹp cho các câu chuyện chữa lành, phiêu lưu nhẹ nhàng.',
    locked: false,
    promptTemplate: buildTemplate(
        "Studio Ghibli animation style, Hayao Miyazaki aesthetic, hand-painted watercolor backgrounds, lush nature.",
        "Flat shading, clean lines, healthy rosy flush on cheeks, simplified textures.",
        "Simple lines, solid colors with minimal shading, movement depicted through flowing fabric.",
        "Large expressive eyes, simplified nose and mouth, emotional and innocent expressions.",
        "Ghibli style, simple and expressive.",
        "Slightly stylized, realistic but simplified proportions.",
        "Hand-painted watercolor style, fluffy cumulus clouds, vibrant greenery, detailed clutter but soft edges."
    ),
    sceneTemplate: buildSceneTemplate(
        "Studio Ghibli animation style, Hayao Miyazaki aesthetic, hand-painted watercolor backgrounds, lush nature.",
        "Flat shading, clean lines, simplified textures.",
        "Simple lines, solid colors with minimal shading.",
        "Large expressive eyes, simplified nose and mouth.",
        "Ghibli style, simple and expressive.",
        "Slightly stylized, realistic but simplified proportions.",
        "Hand-painted watercolor style, fluffy cumulus clouds, vibrant greenery, detailed clutter but soft edges."
    )
  },
  {
    title: 'GTA Game Art',
    description: 'Phong cách loading screen của GTA, nét vẽ Digital Art sắc sảo.',
    imageUrl: 'https://images.unsplash.com/photo-1558742569-fe6d39d05837?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Cực ngầu cho video hành động, giới thiệu nhân vật hoặc gangster.',
    locked: false,
    promptTemplate: buildTemplate(
        "GTA V Loading Screen art style, digital vector illustration, cel-shaded, bold black outlines, vibrant and saturated colors.",
        "Stylized realism, sharp shadows, high contrast skin tones, 'airbrushed' look.",
        "Sharp creases, bold patterns, high contrast shading on fabric.",
        "Cool, tough expressions, sharp jawlines, stylized eyes with bold outlines.",
        "GTA comic book style, high contrast.",
        "Realistic but idealized/stylized proportions.",
        "California vibe, saturated sunsets, stylized cityscapes, bold vector backgrounds."
    ),
    sceneTemplate: buildSceneTemplate(
        "GTA V Loading Screen art style, digital vector illustration, cel-shaded, bold black outlines, vibrant and saturated colors.",
        "Stylized realism, sharp shadows, high contrast skin tones.",
        "Sharp creases, bold patterns, high contrast shading.",
        "Cool, tough expressions, sharp jawlines, stylized eyes.",
        "GTA comic book style, high contrast.",
        "Realistic but idealized/stylized proportions.",
        "California vibe, saturated sunsets, stylized cityscapes, bold vector backgrounds."
    )
  },
  {
    title: 'Siêu Thực Ám Ảnh',
    description: '3D thực tế, không khí lạnh lẽo, hiệu ứng Uncanny Valley gây ám ảnh.',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phù hợp cho phim kinh dị, tâm lý tội phạm (Thriller) hoặc các cảnh mộng mị.', 
    locked: false,
    promptTemplate: buildTemplate(
        "3D photorealistic horror, uncanny valley effect, cold color temperature, psychological thriller aesthetic.",
        "Pale, sickly, or overly perfect 'wax-like' skin texture, cold undertones.",
        "Dark, textured, slightly worn or dirty if horror, or clinical clean if psychological.",
        "Unsettling stares, lack of emotion or exaggerated fear, deep shadows around eyes.",
        "Eerie, shadowy, indistinct or distorted features.",
        "Slightly elongated or distorted to create unease.",
        "Cold lighting, isolated environments, fog, heavy shadows, desaturated colors."
    ),
    sceneTemplate: buildSceneTemplate(
        "3D photorealistic horror, uncanny valley effect, cold color temperature, psychological thriller aesthetic.",
        "Pale, sickly, or overly perfect 'wax-like' skin texture.",
        "Dark, textured, slightly worn or dirty if horror.",
        "Unsettling stares, lack of emotion or exaggerated fear.",
        "Eerie, shadowy, indistinct or distorted features.",
        "Slightly elongated or distorted to create unease.",
        "Cold lighting, isolated environments, fog, heavy shadows, desaturated colors."
    )
  },
  {
    title: 'Cổ tích Việt Nam',
    description: '3D tả thực hiện đại, bối cảnh kiến trúc và trang phục thuần Việt.',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Dành riêng cho các dự án văn hóa, truyện cổ tích hoặc phim bối cảnh làng quê Việt Nam.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Modern 3D realism, Vietnamese folklore aesthetic, cultural heritage focus, soft warm lighting.",
        "Natural Vietnamese skin tones, warm undertones, realistic texture.",
        "Traditional Vietnamese clothing (Ao Dai, Tu Than, Ao Ba Ba), accurate silk/cotton textures.",
        "Asian features, gentle and expressive, culturally accurate styling.",
        "Consistent Vietnamese rural style.",
        "Realistic Vietnamese body proportions.",
        "Ancient Vietnamese village, bamboo, rice fields, temples, red tiles, nostalgic and peaceful atmosphere."
    ),
    sceneTemplate: buildSceneTemplate(
        "Modern 3D realism, Vietnamese folklore aesthetic, cultural heritage focus, soft warm lighting.",
        "Natural Vietnamese skin tones, warm undertones, realistic texture.",
        "Traditional Vietnamese clothing (Ao Dai, Tu Than, Ao Ba Ba), accurate silk/cotton textures.",
        "Asian features, gentle and expressive, culturally accurate styling.",
        "Consistent Vietnamese rural style.",
        "Realistic Vietnamese body proportions.",
        "Ancient Vietnamese village, bamboo, rice fields, temples, red tiles, nostalgic and peaceful atmosphere."
    )
  },
  {
    title: 'Người Que (Stickman)',
    description: 'Nghệ thuật người que tối giản nhưng cực kỳ điện ảnh và năng động.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Thích hợp cho video giải thích (explainer videos), storyboard nhanh hoặc nội dung hài hước.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Cinematic Stickman art, thick black outlines, high contrast, dynamic action composition.",
        "White or solid color (usually white) for the stick figure head/body.",
        "Minimalist, represented by simple shapes or outlines on the stick body.",
        "Expressive minimalist vector face (eyes and mouth only), exaggerated emotions.",
        "Simple stick figures.",
        "Stick figure proportions (large head, thin line body).",
        "Abstract or sketched background, focus on action lines and speed effects."
    ),
    sceneTemplate: buildSceneTemplate(
        "Cinematic Stickman art, thick black outlines, high contrast, dynamic action composition.",
        "White or solid color (usually white) for the stick figure head/body.",
        "Minimalist, represented by simple shapes or outlines on the stick body.",
        "Expressive minimalist vector face (eyes and mouth only), exaggerated emotions.",
        "Simple stick figures.",
        "Stick figure proportions (large head, thin line body).",
        "Abstract or sketched background, focus on action lines and speed effects."
    )
  },
  {
    title: 'Màu Nước (Watercolor)',
    description: 'Nét vẽ loang nghệ thuật, mộc mạc trên nền giấy vân canson.',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Lãng mạn, nhẹ nhàng. Phù hợp cho MV ca nhạc, thơ ca hoặc hồi ức.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Artistic Watercolor painting, wet-on-wet technique, soft edges, dreamy atmosphere.",
        "Translucent watercolor washes, bleeding colors, paper texture visible.",
        "Loose brush strokes, color bleeding into background, soft boundaries.",
        "Soft features, artistic representation, not hyper-detailed.",
        "Watercolor style, blending into the scene.",
        "Artistic and fluid proportions.",
        "Visible paper grain, paint splatters, soft gradients, abstract background elements."
    ),
    sceneTemplate: buildSceneTemplate(
        "Artistic Watercolor painting, wet-on-wet technique, soft edges, dreamy atmosphere.",
        "Translucent watercolor washes, bleeding colors.",
        "Loose brush strokes, color bleeding into background.",
        "Soft features, artistic representation.",
        "Watercolor style, blending into the scene.",
        "Artistic and fluid proportions.",
        "Visible paper grain, paint splatters, soft gradients, abstract background elements."
    )
  },
  {
    title: 'Bộ Xương (Skeleton)',
    description: 'Dark Fantasy, các nhân vật dưới hình dạng bộ xương chi tiết.',
    imageUrl: 'https://images.unsplash.com/photo-1530546171585-cc042ea5d7ab?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Độc đáo cho các dự án kinh dị giả tưởng, Halloween hoặc trừu tượng.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Dark Fantasy, Skeleton character aesthetic, gothic and mystical.",
        "Bone texture, cracked, aged, white or yellowish bone color.",
        "Tattered rags, ancient armor, or dark robes, high texture detail.",
        "Skull face, hollow eye sockets (perhaps with glowing magical pinpoints), fixed skeletal grin.",
        "Skeletal or undead style.",
        "Skeletal anatomy (ribs, spine visible).",
        "Gothic ruins, graveyards, dark magic atmosphere, fog, blue or green soul fire lighting."
    ),
    sceneTemplate: buildSceneTemplate(
        "Dark Fantasy, Skeleton character aesthetic, gothic and mystical.",
        "Bone texture, cracked, aged, white or yellowish bone color.",
        "Tattered rags, ancient armor, or dark robes.",
        "Skull face, hollow eye sockets, fixed skeletal grin.",
        "Skeletal or undead style.",
        "Skeletal anatomy (ribs, spine visible).",
        "Gothic ruins, graveyards, dark magic atmosphere, fog, blue or green soul fire lighting."
    )
  },
  {
    title: 'Pixel Art (16-bit)',
    description: 'Phong cách trò chơi điện tử Retro thập niên 90.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tuyệt vời cho nội dung về game, hoài cổ (Nostalgia) hoặc video phong cách Arcade.', 
    locked: false,
    promptTemplate: buildTemplate(
        "16-bit Pixel Art, SNES era aesthetic, pixelated details, limited color palette.",
        "Pixelated skin tones, dithered shading.",
        "Simplified pixel patterns representing clothes.",
        "Pixelated facial features, limited resolution but expressive.",
        "Pixel art sprites.",
        "Chibi or game-sprite proportions.",
        "Pixelated isometric or side-scrolling background, vibrant retro colors, dithering effects."
    ),
    sceneTemplate: buildSceneTemplate(
        "16-bit Pixel Art, SNES era aesthetic, pixelated details, limited color palette.",
        "Pixelated skin tones, dithered shading.",
        "Simplified pixel patterns representing clothes.",
        "Pixelated facial features, limited resolution but expressive.",
        "Pixel art sprites.",
        "Chibi or game-sprite proportions.",
        "Pixelated isometric or side-scrolling background, vibrant retro colors, dithering effects."
    )
  },
  {
    title: 'Đất Sét (Claymation)',
    description: 'Hoạt hình đất sét nặn thủ công, có dấu vân tay thực tế.',
    imageUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tạo cảm giác thủ công, gần gũi. Thích hợp cho phim hoạt hình Stop-motion.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Claymation style, Aardman animations aesthetic, stop-motion clay texture.",
        "Matte clay texture, visible fingerprints, slightly uneven surfaces.",
        "Thick clay sculpting look, solid colors, fabric texture stamped into clay.",
        "Beady plastic eyes, sculpted mouths, exaggerated expressions.",
        "Clay figures.",
        "Chunky, rounded, cartoonish proportions.",
        "Miniature set design, tilt-shift photography effect, soft studio lighting."
    ),
    sceneTemplate: buildSceneTemplate(
        "Claymation style, Aardman animations aesthetic, stop-motion clay texture.",
        "Matte clay texture, visible fingerprints.",
        "Thick clay sculpting look, solid colors.",
        "Beady plastic eyes, sculpted mouths, exaggerated expressions.",
        "Clay figures.",
        "Chunky, rounded, cartoonish proportions.",
        "Miniature set design, tilt-shift photography effect, soft studio lighting."
    )
  },
  {
    title: 'Cyberpunk Neon',
    description: 'Tương lai Sci-fi rực rỡ với đèn Neon Cyan và Magenta.',
    imageUrl: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Dành cho bối cảnh tương lai, công nghệ cao, Hacker hoặc Sci-fi hành động.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Cyberpunk futuristic, high-tech low-life, neon-drenched, cinematic sci-fi.",
        "Illuminated by neon lights (cyan/magenta), glossy or metallic skin implants.",
        "Tech-wear, latex, holographic fabrics, glowing accessories.",
        "Sharp, intense, possibly cybernetic eye implants, neon face paint.",
        "Futuristic, punk, modified.",
        "Realistic but stylized with tech enhancements.",
        "Night city, rain-slicked streets, towering holograms, neon signs, crowded futuristic architecture."
    ),
    sceneTemplate: buildSceneTemplate(
        "Cyberpunk futuristic, high-tech low-life, neon-drenched, cinematic sci-fi.",
        "Illuminated by neon lights (cyan/magenta), glossy or metallic skin implants.",
        "Tech-wear, latex, holographic fabrics, glowing accessories.",
        "Sharp, intense, possibly cybernetic eye implants, neon face paint.",
        "Futuristic, punk, modified.",
        "Realistic but stylized with tech enhancements.",
        "Night city, rain-slicked streets, towering holograms, neon signs, crowded futuristic architecture."
    )
  },
  {
    title: 'Phác Thảo Chì (Pencil)',
    description: 'Nét chì thô sơ, vẽ tay trên giấy, đậm chất phác họa.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phù hợp để làm Storyboard nháp, minh họa ý tưởng hoặc phong cách nhật ký.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Hand-drawn pencil sketch, graphite on paper, rough artistic style.",
        "Hatched lines shading, monochrome grey tones.",
        "Rough sketch lines, cross-hatching to show texture.",
        "Expressive sketch, focus on key features, loose lines.",
        "Rough sketch outlines.",
        "Artistic, loose proportions.",
        "White paper background, messy graphite smudges, architectural sketch lines, unfinished edges."
    ),
    sceneTemplate: buildSceneTemplate(
        "Hand-drawn pencil sketch, graphite on paper, rough artistic style.",
        "Hatched lines shading, monochrome grey tones.",
        "Rough sketch lines, cross-hatching to show texture.",
        "Expressive sketch, focus on key features, loose lines.",
        "Rough sketch outlines.",
        "Artistic, loose proportions.",
        "White paper background, messy graphite smudges, architectural sketch lines, unfinished edges."
    )
  },
  {
    title: 'Anime Nhật Bản',
    description: 'Hoạt hình Modern Anime, nét vẽ sạch, màu sắc lung linh.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phong cách phổ biến cho Webtoon, Anime series hoặc video cho giới trẻ.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Modern Japanese Anime style, Makoto Shinkai aesthetic, high quality 2D animation.",
        "Smooth, cell-shaded, pale or natural tones with soft blush.",
        "Detailed anime fashion, clean lines, vibrant colors.",
        "Large detailed eyes, small nose/mouth, emotive anime expressions.",
        "Anime style characters.",
        "Stylized anime proportions (slender, large eyes).",
        "Detailed backgrounds, dramatic lighting (lens flares), vibrant sky, polished look."
    ),
    sceneTemplate: buildSceneTemplate(
        "Modern Japanese Anime style, Makoto Shinkai aesthetic, high quality 2D animation.",
        "Smooth, cell-shaded, pale or natural tones.",
        "Detailed anime fashion, clean lines.",
        "Large detailed eyes, small nose/mouth, emotive anime expressions.",
        "Anime style characters.",
        "Stylized anime proportions (slender, large eyes).",
        "Detailed backgrounds, dramatic lighting (lens flares), vibrant sky, polished look."
    )
  },
  {
    title: 'Tranh Cắt Giấy (Paper)',
    description: 'Nghệ thuật xếp giấy nhiều lớp, tạo chiều sâu vật lý.',
    imageUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tạo hiệu ứng thị giác độc đáo, thích hợp cho video kể chuyện hoặc bìa sách.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Paper Cutout art, layered paper craft, diorama style, physical depth.",
        "Textured paper look, flat colors per layer.",
        "Layers of colored paper, sharp edges, no internal gradients.",
        "Simplified paper shapes, minimalist features.",
        "Paper cutout figures.",
        "Stylized, flat paper puppets.",
        "Multi-layered scenery, realistic drop shadows between layers, craft paper texture."
    ),
    sceneTemplate: buildSceneTemplate(
        "Paper Cutout art, layered paper craft, diorama style, physical depth.",
        "Textured paper look, flat colors per layer.",
        "Layers of colored paper, sharp edges.",
        "Simplified paper shapes, minimalist features.",
        "Paper cutout figures.",
        "Stylized, flat paper puppets.",
        "Multi-layered scenery, realistic drop shadows between layers, craft paper texture."
    )
  },
  {
    title: 'Tranh Sơn Dầu (Oil)',
    description: 'Kết cấu cọ dày (impasto), màu sắc đậm đà phong cách phục hưng.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Sang trọng, cổ điển. Phù hợp cho phim lịch sử hoặc nội dung nghệ thuật cao.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Classic Oil Painting, Impasto technique, Renaissance or Impressionist influence.",
        "Rich color blending, visible brush strokes, oil texture.",
        "Painted texture, deep folds in fabric, dramatic lighting on clothes.",
        "Artistic interpretation, soft blending, dramatic chiaroscuro lighting.",
        "Oil painted figures.",
        "Classical realistic proportions.",
        "Canvas texture visible, rich pigments, dramatic lighting contrast, painterly background."
    ),
    sceneTemplate: buildSceneTemplate(
        "Classic Oil Painting, Impasto technique, Renaissance or Impressionist influence.",
        "Rich color blending, visible brush strokes, oil texture.",
        "Painted texture, deep folds in fabric.",
        "Artistic interpretation, soft blending, dramatic chiaroscuro lighting.",
        "Oil painted figures.",
        "Classical realistic proportions.",
        "Canvas texture visible, rich pigments, dramatic lighting contrast, painterly background."
    )
  },
  {
    title: 'Cybernetic Robot',
    description: 'Cơ khí hóa nhân vật với dây cáp và mạch điện chi tiết.',
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Dành cho các ý tưởng về AI, Robot, Transhumanism hoặc chiến tranh tương lai.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Sci-fi Mecha/Robot design, hard-surface modeling, futuristic technology.",
        "Metallic panels, synthetic skin, carbon fiber textures.",
        "Armor plating, exposed hydraulic cables, glowing power cores.",
        "Robotic face, HUD displays, glowing optical sensors, mechanical features.",
        "Robots or cyborgs.",
        "Mechanical, bulky or sleek robotic proportions.",
        "High-tech hangar, futuristic battlefield, metallic surfaces, clean workshop or gritty warzone."
    ),
    sceneTemplate: buildSceneTemplate(
        "Sci-fi Mecha/Robot design, hard-surface modeling, futuristic technology.",
        "Metallic panels, synthetic skin, carbon fiber textures.",
        "Armor plating, exposed hydraulic cables, glowing power cores.",
        "Robotic face, HUD displays, glowing optical sensors.",
        "Robots or cyborgs.",
        "Mechanical, bulky or sleek robotic proportions.",
        "High-tech hangar, futuristic battlefield, metallic surfaces, clean workshop or gritty warzone."
    )
  },
  {
    title: 'Tối Giản (Minimalist)',
    description: 'Nghệ thuật Vector phẳng, màu sắc chọn lọc, tinh tế.',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Hiện đại, sạch sẽ. Thích hợp cho thiết kế UI/UX, icon hoặc minh họa báo chí.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Minimalist Vector Art, Flat Design, corporate Memphis style.",
        "Solid flat colors, no gradients, no texture.",
        "Geometric shapes representing clothes, flat colors.",
        "Faceless or extremely simplified (dots for eyes), neutral expressions.",
        "Flat vector figures.",
        "Exaggerated or geometric proportions.",
        "Solid color backgrounds, abstract geometric shapes, clean composition, negative space."
    ),
    sceneTemplate: buildSceneTemplate(
        "Minimalist Vector Art, Flat Design, corporate Memphis style.",
        "Solid flat colors, no gradients, no texture.",
        "Geometric shapes representing clothes, flat colors.",
        "Faceless or extremely simplified (dots for eyes), neutral expressions.",
        "Flat vector figures.",
        "Exaggerated or geometric proportions.",
        "Solid color backgrounds, abstract geometric shapes, clean composition, negative space."
    )
  },
  {
    title: '3D Disney/Pixar',
    description: 'Hoạt hình 3D dễ thương, mắt to, biểu cảm thân thiện.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Lựa chọn số 1 cho nội dung thiếu nhi, giáo dục hoặc phim gia đình.', 
    locked: false,
    promptTemplate: buildTemplate(
        "3D Animation, Disney/Pixar style, RenderMan rendering, cute and friendly.",
        "Soft, smooth skin, subsurface scattering (gummy feel), warm tones.",
        "Detailed fabric textures but stylized shapes, bright colors.",
        "Large expressive eyes, rounded features, friendly expressions, 'bean' shaped head structure.",
        "Cute 3D animated characters.",
        "Cartoon proportions (larger head and eyes, smaller hands/feet).",
        "Soft volumetric lighting, vibrant colors, detailed but inviting environment, magical atmosphere."
    ),
    sceneTemplate: buildSceneTemplate(
        "3D Animation, Disney/Pixar style, RenderMan rendering, cute and friendly.",
        "Soft, smooth skin, subsurface scattering (gummy feel).",
        "Detailed fabric textures but stylized shapes, bright colors.",
        "Large expressive eyes, rounded features, friendly expressions.",
        "Cute 3D animated characters.",
        "Cartoon proportions (larger head and eyes, smaller hands/feet).",
        "Soft volumetric lighting, vibrant colors, detailed but inviting environment, magical atmosphere."
    )
  },
  {
    title: 'Truyện Tranh Cổ (Retro)',
    description: 'Comics thập niên 60, hiệu ứng chấm Ben-Day dots.',
    imageUrl: 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phong cách Pop-art mạnh mẽ, phù hợp cho nội dung siêu anh hùng hoặc hành động.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Vintage American Comic Book, Pop Art, Roy Lichtenstein style, halftone patterns.",
        "Ben-Day dots for skin shading, bold black outlines.",
        "Solid primary colors (CMYK), heavy black inking for shadows.",
        "Dramatic expressions, bold lines, comic book features.",
        "Comic book heroes/villains.",
        "Heroic, muscular or idealized proportions.",
        "Halftone dot background, speech bubbles (optional), action lines, bold colors."
    ),
    sceneTemplate: buildSceneTemplate(
        "Vintage American Comic Book, Pop Art, Roy Lichtenstein style, halftone patterns.",
        "Ben-Day dots for skin shading, bold black outlines.",
        "Solid primary colors (CMYK), heavy black inking for shadows.",
        "Dramatic expressions, bold lines, comic book features.",
        "Comic book heroes/villains.",
        "Heroic, muscular or idealized proportions.",
        "Halftone dot background, speech bubbles (optional), action lines, bold colors."
    )
  },
  {
    title: 'Huyền Ảo (Dark Fantasy)',
    description: 'Gothic, ma mị, lâu đài cổ và sương mù huyền bí.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Tạo không khí bí ẩn, phép thuật đen tối. Phù hợp cho game RPG hoặc tiểu thuyết giả tưởng.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Dark Fantasy, Gothic RPG art style, moody and atmospheric.",
        "Pale, shadowed, realistic texture but desaturated.",
        "Intricate armor, leather, velvet, gothic patterns, dark colors.",
        "Serious, mysterious, brooding expressions, sharp features.",
        "Fantasy creatures or gothic figures.",
        "Realistic heroic proportions.",
        "Ancient castles, mist-covered forests, moonlight, stone textures, magical particles."
    ),
    sceneTemplate: buildSceneTemplate(
        "Dark Fantasy, Gothic RPG art style, moody and atmospheric.",
        "Pale, shadowed, realistic texture but desaturated.",
        "Intricate armor, leather, velvet, gothic patterns.",
        "Serious, mysterious, brooding expressions, sharp features.",
        "Fantasy creatures or gothic figures.",
        "Realistic heroic proportions.",
        "Ancient castles, mist-covered forests, moonlight, stone textures, magical particles."
    )
  },
  {
    title: 'Vẩy Mực Neon (Splash)',
    description: 'Trừu tượng, vẩy mực đen kết hợp ánh sáng Neon rực rỡ.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Cực kỳ ấn tượng về thị giác. Dành cho poster, ảnh bìa hoặc video ca nhạc sôi động.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Ink Splash Art mixed with Glowing Neon, abstract and energetic.",
        "Formed by chaotic ink splatters, high contrast black and white.",
        "Abstract ink forms representing clothes with glowing neon edges.",
        "Partially obscured by ink drips, glowing eyes, intense contrast.",
        "Ink silhouette figures.",
        "Abstract, fluid proportions.",
        "White or black void, exploding ink splashes, glowing neon geometric lines, energy effects."
    ),
    sceneTemplate: buildSceneTemplate(
        "Ink Splash Art mixed with Glowing Neon, abstract and energetic.",
        "Formed by chaotic ink splatters, high contrast black and white.",
        "Abstract ink forms representing clothes with glowing neon edges.",
        "Partially obscured by ink drips, glowing eyes.",
        "Ink silhouette figures.",
        "Abstract, fluid proportions.",
        "White or black void, exploding ink splashes, glowing neon geometric lines, energy effects."
    )
  },
  {
    title: 'Đa Giác (Low-Poly)',
    description: 'Tạo hình từ các mảng khối đa giác hiện đại.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phong cách kỹ thuật số trừu tượng, thích hợp cho visual background hoặc game indie.', 
    locked: false,
    promptTemplate: buildTemplate(
        "Low-Poly Art, faceted 3D geometry, digital sculpture aesthetic.",
        "Faceted polygon planes, flat colors per facet, hard lighting edges.",
        "Blocky, geometric representation of clothes.",
        "Angular, sharp features, minimalist low-poly face.",
        "Low-poly figures.",
        "Blocky, geometric proportions.",
        "Geometric landscape, sharp shadows, soft ambient occlusion, abstract digital world."
    ),
    sceneTemplate: buildSceneTemplate(
        "Low-Poly Art, faceted 3D geometry, digital sculpture aesthetic.",
        "Faceted polygon planes, flat colors per facet, hard lighting edges.",
        "Blocky, geometric representation of clothes.",
        "Angular, sharp features, minimalist low-poly face.",
        "Low-poly figures.",
        "Blocky, geometric proportions.",
        "Geometric landscape, sharp shadows, soft ambient occlusion, abstract digital world."
    )
  },
  {
    title: 'Cổ Trang Trung Hoa (Manhua)',
    description: 'Phong cách truyện tranh cổ trang Trung Quốc, nét mực tàu, không khí nạn đói.',
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phù hợp cho truyện tranh lịch sử, phim cổ trang, không khí bi thương, nạn đói.',
    locked: false,
    promptTemplate: buildTemplate(
        "Ancient Chinese manhua illustration style, pure historical ancient China setting, famine era atmosphere, no modern elements, traditional ink-style linework, expressive faces, realistic hardship depiction, muted earthy color palette, dusty brown and faded gray tones, soft natural cinematic lighting, detailed fabric texture, worn and patched clothing realism, subtle dramatic composition.",
        "rough, slightly dirty texture consistent with famine conditions, natural tones, no glossy or modern rendering",
        "coarse ancient linen clothing with visible wear, patches, faded fabric, historically accurate peasant attire",
        "realistic ancient Chinese manhua facial structure, expressive but not exaggerated, visible fatigue and hardship details",
        "dressed in similar ancient peasant clothing, thin bodies, worn faces, simple traditional hairstyles (bun or loose tied hair), no modern elements",
        "realistic human proportions, slightly thin due to famine setting, no chibi, no stylization exaggeration",
        "poor rural ancient Chinese village environment, cracked mud walls, straw roof structures, rough wooden furniture, clay bowls, farming tools, dusty air, historically accurate textures"
    ),
    sceneTemplate: buildSceneTemplate(
        "Ancient Chinese manhua illustration style, pure historical ancient China setting, famine era atmosphere, no modern elements, traditional ink-style linework, expressive faces, realistic hardship depiction, muted earthy color palette, dusty brown and faded gray tones, soft natural cinematic lighting, detailed fabric texture, worn and patched clothing realism, subtle dramatic composition.",
        "rough, slightly dirty texture consistent with famine conditions, natural tones, no glossy or modern rendering",
        "coarse ancient linen clothing with visible wear, patches, faded fabric, historically accurate peasant attire",
        "realistic ancient Chinese manhua facial structure, expressive but not exaggerated, visible fatigue and hardship details",
        "dressed in similar ancient peasant clothing, thin bodies, worn faces, simple traditional hairstyles (bun or loose tied hair), no modern elements",
        "realistic human proportions, slightly thin due to famine setting, no chibi, no stylization exaggeration",
        "poor rural ancient Chinese village environment, cracked mud walls, straw roof structures, rough wooden furniture, clay bowls, farming tools, dusty air, historically accurate textures"
    )
  }
];
