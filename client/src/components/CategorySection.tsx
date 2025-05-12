import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const CategorySection: React.FC = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Helper function to get appropriate border class based on category
  const getCategoryBorderClass = (categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case 'electronics':
        return 'category-electronics';
      case 'fashion':
        return 'category-fashion';
      case 'home & kitchen':
        return 'category-home';
      default:
        return 'category-electronics';
    }
  };
  
  // Helper function to get image URL based on category name
  const getCategoryImage = (category: Category): string => {
    switch (category.name.toLowerCase()) {
      case 'electronics':
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';
      case 'fashion':
        return 'https://images.unsplash.com/photo-1551232864-3f0890e580d9';
      case 'home & kitchen':
        return 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6';
      case 'beauty & health':
        return 'https://images.unsplash.com/photo-1513595207829-9f414c0665f6';
      default:
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
    }
  };
  
  return (
    <section className="container mx-auto px-4 mb-8">
      <h2 className="text-xl font-medium text-dark mb-4">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          // Show skeleton loading state
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-sm flex flex-col items-center animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-36"></div>
            </div>
          ))
        ) : (
          categories?.map(category => (
            <Link 
              key={category.id}
              href={`/products?category=${category.id}`} 
              className={`${getCategoryBorderClass(category.name)} bg-white p-4 rounded shadow-sm flex flex-col items-center hover:shadow-md transition-shadow`}
            >
              <img 
                src={getCategoryImage(category)} 
                alt={`${category.name} category`} 
                className="w-20 h-20 object-contain mb-2"
                loading="lazy"
              />
              <h3 className="font-medium text-center">{category.name}</h3>
              <p className="text-xs text-gray-500 text-center">{category.description}</p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default CategorySection;
