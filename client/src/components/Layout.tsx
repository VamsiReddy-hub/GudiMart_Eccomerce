import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";
import Chatbot from "./Chatbot";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  cartItemCount: number;
  onSearch: (term: string) => void;
  onCategorySelect: (categoryId: number | null) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  cartItemCount,
  onSearch,
  onCategorySelect,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        cartItemCount={cartItemCount} 
        onSearch={onSearch}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={onLogout}
      />
      <CategoryNav onCategorySelect={onCategorySelect} />
      
      <main className="flex-grow pb-10">
        {children}
      </main>
      
      <Footer />
      
      {/* Chatbot */}
      {user && (
        <>
          <div className="fixed bottom-6 right-6 z-40">
            <button 
              onClick={() => setIsChatOpen(prev => !prev)}
              className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
              aria-label="Open chat assistant"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
            </button>
          </div>
          
          <Chatbot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            userId={user.id} 
          />
        </>
      )}
    </div>
  );
};

export default Layout;
