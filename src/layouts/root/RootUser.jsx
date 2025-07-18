import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../user/Header";
import Footer from "../user/Footer";
import ChatBox from "@/components/ChatBox/ChatBox";

export default function RootUser() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const contentRef = useRef(null);

  // Xử lý cuộn lên đầu trang mỗi khi route thay đổi
  useEffect(() => {
    if (contentRef.current) {
      // Đặt contentRef về đầu trang ngay lập tức
      contentRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);


  return (
    <>
      <Header />
      <ChatBox />
        <main 
        ref={contentRef}
        className="min-h-screen mt-[75px] bg-[#151B27]"
      >
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
