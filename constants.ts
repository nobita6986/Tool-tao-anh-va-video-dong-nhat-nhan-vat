
import type { Style } from './types';

const BASE_INVARIANT_START = `*YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách:*`;

const BASE_INVARIANT_END = `*Nếu có yêu cầu khác ở phân cảnh thì phải check lại scene trước xem những scene nào cùng khung cảnh phải đồng nhất trang phục với các scene đó. Ví dụ cũng buổi chiều tại trường học, chỉ đổi góc độ quay nhân vật thì vẫn là trang phục đấy, một cảnh khác nhân vật đã đi nơi khác vào thời điểm khác thì cần phải check lại kịch bản để lựa chọn trang phục phù hợp.*
*+ Phong cách vẽ mặt nhân vật:* [FACE_STYLE]
*+ Các nhân vật khác nếu có sẽ với phong cách:* [OTHER_CHARS_STYLE]
*+ Tỉ lệ kích thước cơ thể (Tất cả nhân vật):* [BODY_RATIO]
*+ Phong cách vẽ bối cảnh:* [BG_STYLE]

*Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.*`;

// Helper function to build the full strict template
const buildTemplate = (
    mainStyle: string,
    skinStyle: string,
    clothesStyle: string,
    faceStyle: string,
    otherCharsStyle: string,
    bodyRatio: string,
    bgStyle: string
) => {
    return `${BASE_INVARIANT_START} ${mainStyle}

*Chi tiết nhân vật: [CHARACTER_STYLE]*
*+ Màu da/màu lông (đối với động vật):* ${skinStyle}
*+ Phong cách trang phục:* ${clothesStyle} ${BASE_INVARIANT_END
        .replace('[FACE_STYLE]', faceStyle)
        .replace('[OTHER_CHARS_STYLE]', otherCharsStyle)
        .replace('[BODY_RATIO]', bodyRatio)
        .replace('[BG_STYLE]', bgStyle)}`;
};

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
    )
  },
  {
    title: 'Hoạt hình Âu Mỹ (Modern 2D)',
    description: 'Phong cách hoạt hình phương Tây hiện đại, nét viền sạch, màu sắc tươi sáng.',
    imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80',
    tooltip: 'Phù hợp cho phim hoạt hình gia đình, video giáo dục, hoặc nội dung giải trí năng động.',
    locked: false,
    promptTemplate: buildTemplate(
        "2D Modern Western Animation Style, thiết kế phẳng hiện đại, lineart sạch và rõ ràng, nét viền dứt khoát với độ dày thay đổi linh hoạt, màu sắc tươi sáng nhưng có kiểm soát, đổ bóng cel-shading mềm 1–2 lớp, ánh sáng rim light nhẹ để tạo chiều sâu, sử dụng nguyên lý squash & stretch tinh tế, bố cục khung hình điện ảnh (medium shot hoặc close-up linh hoạt theo cảm xúc), độ tương phản màu cao để làm nổi bật nhân vật, mood năng động – cảm xúc rõ ràng – thân thiện, phong cách hướng đến khán giả trẻ và gia đình, mang lại cảm giác sinh động, hiện đại và giàu biểu cảm, texture tối giản, không quá nhiều chi tiết nhỏ gây rối mắt, chuyển động gợi cảm giác animation frame trong phim hoạt hình truyền hình Mỹ hiện đại",
        "Tông màu rõ ràng, ít texture, chuyển sắc mượt nhưng không tả thực quá mức, sử dụng bảng màu sạch và đồng nhất, cel-shading tạo khối rõ ràng, màu da thể hiện cá tính nhân vật (ấm áp – lạnh lùng – năng động tùy nội dung kịch bản), bề mặt mịn, không nhấn mạnh lỗ chân lông hay chi tiết siêu thực.",
        "Thiết kế đơn giản hoá chi tiết phức tạp, tập trung vào silhouette rõ ràng, mảng màu lớn, phối màu tương phản hoặc bổ túc để nổi bật trên nền, nếp gấp được vẽ tối giản bằng 1–2 đường line hoặc mảng đổ bóng cel-shade, giữ tính nhất quán trang phục giữa các scene cùng thời điểm và bối cảnh theo kịch bản, ưu tiên tính chuyển động linh hoạt phù hợp animation.",
        "Đặc trưng Modern Western Animation với mắt to vừa phải (không quá anime), lòng trắng rõ, con ngươi đậm màu và có highlight đơn giản, lông mày linh hoạt thể hiện cảm xúc mạnh, mũi tối giản bằng khối hoặc chấm nhỏ tuỳ thiết kế, miệng rõ hình dạng khi biểu cảm (smear frame có thể áp dụng nhẹ), biểu cảm phóng đại vừa đủ, không quá tả thực, đường viền mặt tròn hoặc góc cạnh tùy cá tính nhân vật, phụ kiện nhận diện (nếu có) được giữ nguyên chính xác.",
        "Đồng bộ 2D Modern Western Animation Style, thiết kế đa dạng về hình khối cơ thể (cao – thấp – tròn – góc cạnh) để tạo sự phong phú, màu sắc phân tách rõ ràng giữa nhân vật chính và phụ, ít chi tiết nhỏ, giữ lineart sạch và đổ bóng cel-shading nhất quán.",
        "Tỷ lệ cân đối theo phong cách hoạt hình phương Tây hiện đại, đầu và cơ thể hài hòa (không chibi), tay chân linh hoạt, bàn tay biểu cảm rõ ràng, tránh đầu quá to hoặc thân quá nhỏ trừ khi kịch bản yêu cầu đặc biệt.",
        "Bối cảnh 2D stylized, hình khối rõ ràng, chi tiết được đơn giản hoá, nhà cửa và công trình sử dụng hình học cơ bản, xe cộ bo tròn mềm mại, cây cối tạo mảng lớn không quá nhiều lá nhỏ, bảng màu hài hòa và có chiều sâu bằng layer ánh sáng xa – gần, sử dụng atmospheric perspective nhẹ, ánh sáng key light rõ ràng kèm rim light nhẹ phía sau nhân vật, có thể dùng depth blur giả lập để tăng cảm giác điện ảnh, tổng thể sạch sẽ – hiện đại – phù hợp phim hoạt hình truyền hình Mỹ."
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
    )
  }
];

export const PRESET_PROMPT_SEGMENT = `Chia nhỏ kịch bản trên ra thành các dòng ngắn 7-15 chữ...`;
export const PRESET_PROMPT_CONTEXT = `”Phân tích kịch bản gốc đã được cung cấp...`;
