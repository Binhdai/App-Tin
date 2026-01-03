
import { Curriculum } from './types';

export const CURRICULUM: Curriculum = {
  11: [
    {
      id: '11-1',
      topic: 'Hệ điều hành',
      title: 'Bài 1: Hệ điều hành',
      summary: 'Tìm hiểu về lịch sử phát triển, chức năng chính và các loại hệ điều hành phổ biến hiện nay.',
      keyPoints: ['Lịch sử HĐH cho PC', 'Chức năng quản lý thiết bị & tệp', 'Giao diện đồ họa (GUI)', 'HĐH Windows, MacOS, Linux'],
      grade: 11,
      questions: [
        {
          question: "Người sử dụng có thể giao tiếp với máy tính bằng cách nào?",
          options: ["Chỉ bằng dòng lệnh", "Đưa vào các lệnh hoặc chọn trên bảng chọn (Menu)", "Chỉ bằng giọng nói", "Chỉ bằng cảm biến"],
          correctAnswer: 1,
          explanation: "HĐH hiện đại cung cấp cả giao diện dòng lệnh và giao diện đồ họa (Menu/Icons) để người dùng tương tác."
        },
        {
          question: "Hệ điều hành nào cho phép nhiều chương trình được thực hiện cùng lúc và nhiều người dùng đăng nhập hệ thống?",
          options: ["Đơn nhiệm 1 người dùng", "Đa nhiệm 1 người dùng", "Đa nhiệm nhiều người dùng", "Đơn nhiệm nhiều người dùng"],
          correctAnswer: 2,
          explanation: "HĐH đa nhiệm nhiều người dùng (như Linux, Windows Server) cho phép quản lý nhiều tài khoản và tiến trình đồng thời."
        }
      ]
    },
    {
      id: '11-4',
      topic: 'Bên trong máy tính',
      title: 'Bài 4: Bên trong máy tính',
      summary: 'Khám phá các linh kiện phần cứng bên trong máy tính và cách chúng hoạt động.',
      keyPoints: ['CPU - Bộ xử lý trung tâm', 'RAM & ROM', 'Mạch logic & Cổng logic', 'Hệ nhị phân'],
      grade: 11,
      questions: [
        {
          question: "Thành phần nào sau đây là bộ phận chính của CPU?",
          options: ["Bộ nhớ đệm (Cache)", "Bộ số học và lôgic (ALU) và Bộ điều khiển (CU)", "Ổ cứng", "Bàn phím"],
          correctAnswer: 1,
          explanation: "CPU gồm 2 phần chính là ALU (tính toán) và CU (điều khiển). Cache là thành phần hỗ trợ."
        },
        {
          question: "Bộ nhớ nào có khả năng lưu trữ dữ liệu tạm thời và mất dữ liệu khi tắt máy?",
          options: ["ROM", "SSD", "HDD", "RAM"],
          correctAnswer: 3,
          explanation: "RAM là bộ nhớ truy xuất ngẫu nhiên, có tính khả biến (mất dữ liệu khi không có điện)."
        }
      ]
    },
    {
      id: '11-9',
      topic: 'An toàn Internet',
      title: 'Bài 9: Giao tiếp an toàn trên internet',
      summary: 'Các quy tắc và kỹ năng phòng tránh lừa đảo, bảo vệ thông tin cá nhân trên không gian mạng.',
      keyPoints: ['Phòng tránh lừa đảo', 'Bảo mật mật khẩu', 'Quy tắc ứng xử', 'Luật an ninh mạng'],
      grade: 11,
      questions: [
        {
          question: "Khi nhận được email từ địa chỉ lạ yêu cầu mở tệp đính kèm, em nên làm gì?",
          options: ["Mở ngay để xem", "Chuyển tiếp cho bạn bè", "Tra cứu thông tin người gửi và chỉ mở nếu tin cậy", "Xóa ngay lập tức"],
          correctAnswer: 2,
          explanation: "Cần xác minh danh tính người gửi để tránh mã độc đính kèm trong tệp."
        }
      ]
    }
  ],
  12: [
    {
      id: '12-A1',
      topic: 'Trí tuệ nhân tạo (AI)',
      title: 'Bài A1: Giới thiệu Trí tuệ nhân tạo',
      summary: 'Khám phá khái niệm, lịch sử phát triển và phân loại các hệ thống Trí tuệ nhân tạo hiện nay.',
      keyPoints: [
        'Khái niệm AI (Trí tuệ nhân tạo)',
        'Lịch sử AI & Phép thử Turing',
        'Phân loại AI hẹp (ANI) & AI tổng quát (AGI)',
        'Đặc trưng của AI: Học, Suy luận, Nhận thức'
      ],
      grade: 12,
      questions: [
        {
          question: "Trí tuệ nhân tạo (AI) được định nghĩa là gì?",
          options: [
            "Hệ thống tự động hóa hoàn toàn không cần con người",
            "Khả năng của máy tính thực hiện các công việc mang tính trí tuệ của con người",
            "Phần mềm chuyên dụng để diệt virus",
            "Ứng dụng chạy trên điện thoại thông minh"
          ],
          correctAnswer: 1,
          explanation: "AI là khả năng của máy tính để thực hiện các công việc mà thường đòi hỏi trí tuệ của con người như đọc chữ, dịch thuật, học hỏi và ra quyết định."
        },
        {
          question: "AI hẹp (ANI) khác với AI tổng quát (AGI) ở điểm nào?",
          options: [
            "ANI có thể thực hiện nhiều nhiệm vụ phức tạp hơn AGI",
            "AGI chỉ tập trung vào một nhiệm vụ cụ thể",
            "ANI chỉ thực hiện các tác vụ được lập trình và học cụ thể",
            "AGI không thể học từ dữ liệu mới"
          ],
          correctAnswer: 2,
          explanation: "AI hẹp (ANI) được thiết kế cho các tác vụ chuyên biệt, trong khi AI tổng quát (AGI) có năng lực trí tuệ tương tự và có thể học hỏi như con người."
        },
        {
          question: "Khả năng nhận thức của AI thường được thể hiện qua điều gì?",
          options: [
            "Viết mã chương trình tự động",
            "Chỉ đọc dữ liệu văn bản",
            "Cảm nhận và hiểu biết môi trường qua các cảm biến",
            "Dự đoán dựa trên cảm giác trực giác"
          ],
          correctAnswer: 2,
          explanation: "Khả năng nhận thức của AI cho phép nó thu thập thông tin từ môi trường xung quanh thông qua các cảm biến (như trong xe tự lái)."
        }
      ]
    },
    {
      id: '12-A2',
      topic: 'Trí tuệ nhân tạo (AI)',
      title: 'Bài A2: Trí tuệ nhân tạo và cuộc sống',
      summary: 'Tác động của AI đối với các lĩnh vực y tế, giáo dục, tài chính và các cảnh báo đạo đức nghề nghiệp.',
      keyPoints: [
        'Ứng dụng AI trong Y tế & Giáo dục',
        'AI trong Tài chính & Giao thông',
        'Vấn đề đạo đức và thiên vị dữ liệu',
        'Nguy cơ thất nghiệp và quyền riêng tư'
      ],
      grade: 12,
      questions: [
        {
          question: "Lợi ích nổi bật của AI trong giáo dục và đào tạo là gì?",
          options: [
            "Tăng chi phí giáo dục",
            "Cá nhân hóa việc học tập",
            "Thay thế hoàn toàn vai trò của giáo viên",
            "Tăng áp lực học tập cho học sinh"
          ],
          correctAnswer: 1,
          explanation: "AI giúp tạo ra các lộ trình học tập cá nhân hóa, phù hợp với năng lực và tiến độ của từng học sinh (như Duolingo)."
        },
        {
          question: "Hệ chuyên gia MYCIN được sử dụng trong lĩnh vực nào?",
          options: ["Tài chính", "Giao thông", "Y học", "Nông nghiệp"],
          correctAnswer: 2,
          explanation: "MYCIN là một hệ chuyên gia nổi tiếng trong lĩnh vực y tế, hỗ trợ chẩn đoán bệnh nhiễm trùng máu."
        },
        {
          question: "Một trong những cảnh báo quan trọng về AI trong tương lai là gì?",
          options: [
            "AI sẽ trở nên quá thông minh",
            "Vấn đề đạo đức do thiên vị trong dữ liệu huấn luyện",
            "AI không thể truy cập Internet",
            "AI sẽ tiêu tốn quá nhiều năng lượng điện"
          ],
          correctAnswer: 1,
          explanation: "Nếu dữ liệu huấn luyện bị thiên vị, AI có thể đưa ra các quyết định bất công hoặc vi phạm các chuẩn mực đạo đức."
        },
        {
          question: "Ứng dụng nào sau đây giúp phát hiện gian lận trong giao dịch ngân hàng?",
          options: ["Trợ lý ảo Siri", "Google Dịch", "AI trong lĩnh vực tài chính", "Robot Asimo"],
          correctAnswer: 2,
          explanation: "AI có khả năng phân tích hàng triệu giao dịch mỗi giây để phát hiện các dấu hiệu bất thường và gian lận tài chính."
        }
      ]
    }
  ]
};
