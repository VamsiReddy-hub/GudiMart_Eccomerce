import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface CategoryNavProps {
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ onCategorySelect }) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'laptop':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'tshirt':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 15l-3-3m0 0l3-3m-3 3h21M16 15l3-3m0 0l-3-3m3 3H3"
            />
          </svg>
        );
      case 'home':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-success mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case 'heartbeat':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-error mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        );
    }
  };
  
  // Add offers category
  const allCategories = [
    ...(categories || []),
    {
      id: 999,
      name: "Offers",
      description: "Special deals and discounts",
      icon: "gift",
      color: "#fb641b"
    }
  ];
  
  return (
    <div className="bg-white text-dark shadow-sm">
      <div className="container mx-auto px-4 overflow-x-auto">
        <div className="flex space-x-8 py-2 whitespace-nowrap">
          {isLoading ? (
            // Show skeleton while loading
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full mb-1"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            allCategories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id === 999 ? null : category.id)}
                className="text-dark hover:text-primary text-sm font-medium flex flex-col items-center"
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
