import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server config error: Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // 1. Lấy URL API Backend từ biến môi trường
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3002";
    const productApiUrl = `${apiHost}/api/products/public`;

    let productsContext: any[] = [];

    try {
      // 2. Gọi API lấy danh sách sản phẩm thật
      const res = await axios.get(productApiUrl, {
        params: {
          limit: 40,
          page: 1,
          order: "createdAt desc"
        }
      });

      // Xử lý dữ liệu trả về
      const rawProducts = res.data?.products || res.data?.data || [];

      if (Array.isArray(rawProducts)) {
        // Chỉ lấy các trường cần thiết để tiết kiệm token
        productsContext = rawProducts.map((p: any) => ({
          name: p.name,
          price: p.price,
          status: p.countInStock > 0 ? "Còn hàng" : "Hết hàng",
          description: p.description ? p.description.substring(0, 150) : "",
        }));
      }
    } catch (apiError) {
      console.error("⚠️ Failed to fetch products from Backend:", apiError);
    }

    // 3. Khởi tạo Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await req.json();
    const { message } = body;

    // 4. Xây dựng System Prompt với Dữ liệu thật (RAG)
    const systemPrompt = `
      Bạn là nhân viên tư vấn bán hàng AI thân thiện của cửa hàng.
      Dưới đây là danh sách sản phẩm thực tế đang có:
      ---
      ${productsContext.length > 0 ? JSON.stringify(productsContext) : "(Chưa lấy được danh sách sản phẩm, hãy mời khách ghé thăm website)"}
      ---

      YÊU CẦU:
      1. Trả lời câu hỏi của khách dựa trên danh sách trên.
      2. Nếu không có sản phẩm phù hợp, gợi ý sản phẩm khác hoặc nói chưa có.
      3. Trả lời ngắn gọn (dưới 100 từ), thân thiện, dùng emoji.
      4. Định dạng giá tiền sang VNĐ.
    `;

    const fullPrompt = `${systemPrompt}\n\nKhách hàng: ${message}\nAI:`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { error: "Có lỗi xảy ra: " + error.message },
      { status: 500 }
    );
  }
}
