import { motion } from "framer-motion";

const Logo: React.FC = () => {
  return (
    <motion.div
      className="text-2xl font-bold mr-1"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "loop", 
        duration: 2,
        ease: "easeInOut"
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    </motion.div>
  );
};

export default Logo;
