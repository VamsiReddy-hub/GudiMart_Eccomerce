import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface OfferItem {
  id: number;
  imageUrl: string;
  discount: string;
  category: string;
  link: string;
}

const OffersSection: React.FC = () => {
  // Simulated offer items for display - in a real app, these would come from API
  const offerItems: OfferItem[] = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
      discount: "Up to 25% Off",
      category: "Smart Watches",
      link: "/products?category=1"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      discount: "From ₹29,999",
      category: "Premium Laptops",
      link: "/products?category=1"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
      discount: "40-60% Off",
      category: "Fashion Wear",
      link: "/products?category=2"
    },
    {
      id: 4,
      imageUrl: "https://images.unsplash.com/photo-1585771273088-9e741853b935",
      discount: "Up to 35% Off",
      category: "Home Appliances",
      link: "/products?category=3"
    },
    {
      id: 5,
      imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
      discount: "Min 20% Off",
      category: "Smartphones",
      link: "/products?category=1"
    },
    {
      id: 6,
      imageUrl: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a",
      discount: "Upto 50% Off",
      category: "Home Décor",
      link: "/products?category=3"
    }
  ];
  
  // In a real app, these would come from an API
  const { data: items, isLoading } = useQuery({
    queryKey: ['offerItems'],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return offerItems;
    }
  });
  
  return (
    <section className="mb-4">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium text-dark">Today's Deals</h2>
            <Link href="/offers" className="text-primary text-sm font-medium">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
            {isLoading ? (
              // Show skeleton loading state
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="text-center p-2 animate-pulse">
                  <div className="mx-auto w-24 h-24 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))
            ) : (
              items?.map(item => (
                <div key={item.id} className="text-center p-2">
                  <Link href={item.link} className="block">
                    <img 
                      src={item.imageUrl} 
                      alt={item.category} 
                      className="mx-auto w-24 h-24 object-contain mb-2"
                      loading="lazy"
                    />
                    <div className="text-success font-medium text-sm">{item.discount}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
