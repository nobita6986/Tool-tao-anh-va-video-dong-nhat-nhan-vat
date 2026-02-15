
import React from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[150] p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#0b2b1e] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#1f4d3a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-[#1f4d3a] flex justify-between items-center bg-gray-50 dark:bg-[#020a06]">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Hướng dẫn sử dụng StudyAI86</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Công cụ tối ưu quy trình sáng tạo Video AI & Storyboard</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10 text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
          
          {/* Section 1: Điểm mạnh */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <span className="text-2xl">🚀</span> Tại sao nên dùng tool này?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <h4 className="font-bold mb-1">🎭 Đồng nhất nhân vật (Consistency)</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Giải quyết bài toán khó nhất của AI. Tool tự động chèn ảnh tham chiếu và prompt khóa ngoại hình vào từng phân cảnh để nhân vật giống nhau xuyên suốt.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <h4 className="font-bold mb-1">⚡ Tự động hóa quy trình</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Từ kịch bản thô &rarr; Phân cảnh &rarr; Prompt Image &rarr; Prompt Video &rarr; Xuất File. Tiết kiệm 90% thời gian so với làm thủ công.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <h4 className="font-bold mb-1">🎬 Prompt Video chuyên sâu</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Tự động phân tích hình ảnh đã tạo để viết prompt chuyển động camera (Dolly, Pan, Tilt...) phù hợp cho Kling, Luma, Runway.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <h4 className="font-bold mb-1">📦 Quản lý tài sản (Assets)</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Lưu trữ lịch sử các phiên bản ảnh, xuất file Excel quản lý và tải xuống toàn bộ ảnh chỉ với 1 cú click.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2: API Key */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <span className="text-2xl">🔑</span> Yêu cầu bắt buộc: Gemini API Key
            </h3>
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 p-5 rounded-xl">
              <p className="mb-3">Tool sử dụng trí tuệ nhân tạo của Google (Gemini) để xử lý. Bạn cần có API Key riêng để sử dụng (Miễn phí).</p>
              <ol className="list-decimal list-inside space-y-2 mb-4 font-medium">
                <li>Truy cập: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Google AI Studio (Get API Key)</a></li>
                <li>Đăng nhập bằng tài khoản Google của bạn.</li>
                <li>Nhấn nút <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Create API Key</span>.</li>
                <li>Copy đoạn mã bắt đầu bằng <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">AIza...</code></li>
                <li>Quay lại tool, nhấn nút <strong>"API & Model"</strong> trên thanh menu và dán Key vào.</li>
              </ol>
              <p className="text-xs text-orange-600 dark:text-orange-400 italic">* Lưu ý: Bạn nên thêm nhiều Key nếu có nhu cầu tạo ảnh số lượng lớn để tránh bị giới hạn tốc độ (Rate Limit).</p>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3: Quy trình */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <span className="text-2xl">🛠️</span> Quy trình 5 bước hiệu quả
            </h3>
            
            <div className="space-y-6 border-l-2 border-green-200 dark:border-green-800 ml-3 pl-6 relative">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">1</span>
                <h4 className="font-bold text-base mb-1">Chọn Phong Cách & Tỷ Lệ</h4>
                <p className="text-gray-600 dark:text-gray-400">Chọn Style phù hợp (Anime, Cinematic, 3D...) và tỷ lệ khung hình (16:9 cho Youtube, 9:16 cho TikTok).</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">2</span>
                <h4 className="font-bold text-base mb-1">Tải & Xử lý Kịch bản</h4>
                <p className="text-gray-600 dark:text-gray-400">Tải file <code>.txt</code> hoặc <code>.docx</code>. Chọn chế độ phân đoạn (theo câu hoặc theo ý). AI sẽ tự động viết prompt bối cảnh cho từng dòng.</p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">3</span>
                <h4 className="font-bold text-base mb-1">Thiết lập Nhân vật (Quan trọng nhất)</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Để nhân vật giống nhau ở mọi ảnh:</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                  <li>Mở mục <strong>"Quản lý nhân vật"</strong>.</li>
                  <li>Tạo Slot nhân vật, đặt tên (Ví dụ: "Tam").</li>
                  <li>Upload 1-3 ảnh tham chiếu rõ mặt của nhân vật đó.</li>
                  <li>Ở bảng kết quả bên dưới, tại cột <strong>"Nhân vật"</strong>, tích chọn nhân vật xuất hiện trong cảnh đó.</li>
                  <li>Dùng nút <strong>"Tự động điền"</strong> để AI tự quét tên trong kịch bản và tích chọn giúp bạn.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">4</span>
                <h4 className="font-bold text-base mb-1">Tạo Prompt & Tạo Ảnh</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Nhấn <strong>"Tạo tất cả prompt ảnh"</strong> để AI gộp Style + Bối cảnh + Nhân vật lại.<br/>
                  Sau đó nhấn <strong>"Tạo ảnh hàng loạt"</strong> để bắt đầu vẽ.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <span className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">5</span>
                <h4 className="font-bold text-base mb-1">Xuất File</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Nếu cần làm video, nhấn <strong>"Tạo tất cả prompt video"</strong> để lấy prompt chuyển động.<br/>
                  Cuối cùng tải xuống file Excel và file Zip ảnh để đưa vào phần mềm dựng phim.
                </p>
              </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-[#1f4d3a] bg-gray-50 dark:bg-[#020a06] text-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
          >
            Đã hiểu, bắt đầu sáng tạo!
          </button>
        </div>
      </div>
    </div>
  );
};
